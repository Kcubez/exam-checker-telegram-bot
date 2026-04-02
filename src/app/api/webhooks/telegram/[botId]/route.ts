import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTelegramMessage, answerCallbackQuery } from '@/lib/telegram';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Handle MCQ Flow without AI
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  try {
    const { botId } = await params;
    if (!BOT_TOKEN) return new NextResponse('Missing Token', { status: 500 });
    const update = await request.json();

    // ── Handle Callback Queries (Button Clicks) ──
    if (update.callback_query) {
      const cb = update.callback_query;
      const chatId = String(cb.message.chat.id);
      const data = cb.data;

      // Find the bot using the URL parameter
      const bot = await prisma.bot.findUnique({
        where: { id: botId },
        include: { questions: { orderBy: { createdAt: 'asc' } } }
      });
      if (!bot) return new NextResponse('No Bot', { status: 404 });

      // Identify student
      const student = await prisma.student.findUnique({
        where: { botId_telegramChatId: { botId: bot.id, telegramChatId: chatId } }
      });
      if (!student) return new NextResponse('No Student', { status: 404 });

      // ── Start Exam ──
      if (data === 'start_exam') {
        await answerCallbackQuery(BOT_TOKEN, cb.id, 'Exam started!');
        await sendQuestion(bot, student, 0);
        return new NextResponse('OK', { status: 200 });
      }

      // ── Answer MCQ ──
      if (data.startsWith('ans:')) {
        const [, qIdxStr, optionIdxStr] = data.split(':');
        const qIdx = parseInt(qIdxStr);
        const optionIdx = parseInt(optionIdxStr);
        const currentQ = bot.questions[qIdx];

        if (currentQ) {
          const options = currentQ.options as string[];
          const selected = options[optionIdx];
          const isCorrect = selected === currentQ.correctAnswer;
          const newScore = isCorrect ? student.score + 1 : student.score;

          // Update student progress
          await prisma.student.update({
            where: { id: student.id },
            data: { 
              currentQuestionIndex: qIdx + 1,
              score: newScore
            }
          });

          const feedback = isCorrect 
            ? `✅ *Correct!*` 
            : `❌ *Incorrect.*\nCorrect Answer: *${currentQ.correctAnswer}*`;
          
          const explanation = currentQ.explanation ? `\n\n💡 _${currentQ.explanation}_` : '';
          
          await sendTelegramMessage(BOT_TOKEN, chatId, `${feedback}${explanation}`);
          
          // Send next question or summary
          await sendQuestion(bot, { ...student, currentQuestionIndex: qIdx + 1, score: newScore }, qIdx + 1);
        }
        await answerCallbackQuery(BOT_TOKEN, cb.id);
        return new NextResponse('OK', { status: 200 });
      }

      await answerCallbackQuery(BOT_TOKEN, cb.id);
    }

    // ── Handle Text Messages ──
    if (update.message && update.message.text) {
      const chatId = String(update.message.chat.id);
      const text = update.message.text;

      const bot = await prisma.bot.findUnique({
        where: { id: botId },
      });
      if (!bot) return new NextResponse('OK', { status: 200 });

      if (text === '/start') {
        const userFrom = update.message.from;
        const fallbackName = userFrom?.first_name 
            ? `${userFrom.first_name} ${userFrom.last_name || ''}`.trim() 
            : null;
        const nameToSave = userFrom?.username ? `@${userFrom.username}` : fallbackName;

        // Register/Reset Student
        await prisma.student.upsert({
          where: { botId_telegramChatId: { botId: bot.id, telegramChatId: chatId } },
          create: { 
            botId: bot.id, 
            telegramChatId: chatId, 
            telegramUsername: nameToSave
          },
          update: { 
            currentQuestionIndex: 0, 
            score: 0,
            telegramUsername: nameToSave
          }
        });

        const welcome = bot.welcomeMessage || '🎉 Exam Bot မှ ကြိုဆိုပါတယ်! စာမေးပွဲ စဖြေဆိုနိုင်ပါပြီ။';
        await sendTelegramMessage(BOT_TOKEN, chatId, welcome, {
          inline_keyboard: [[{ text: '🚀 စတင်ဖြေဆိုမည် (Start Exam)', callback_data: 'start_exam' }]]
        });
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Bot Error:', err);
    return new NextResponse('OK', { status: 200 });
  }
}

/**
 * Helper to send the next question in the set
 */
interface BotWithQuestions {
  questions: Array<{
    id: string;
    questionText: string;
    options: unknown;
    correctAnswer: string;
    explanation: string | null;
  }>;
}

interface StudentState {
  telegramChatId: string;
  currentQuestionIndex: number;
  score: number;
}

async function sendQuestion(bot: BotWithQuestions, student: StudentState, index: number) {
  const questions = bot.questions || [];
  const q = questions[index];

  if (!q) {
    const finalScore = `🎉 *Exam Completed!*\n\n📊 Total Score: *${student.score} / ${questions.length}*`;
    await sendTelegramMessage(BOT_TOKEN!, student.telegramChatId, finalScore, {
      inline_keyboard: [[{ text: '🔄 Try Again', callback_data: 'start_exam' }]]
    });
    return;
  }

  const options = (q.options as string[]) || [];
  const keyboard = options.map((opt, oIdx) => [{ text: opt, callback_data: `ans:${index}:${oIdx}` }]);

  await sendTelegramMessage(
    BOT_TOKEN!, 
    student.telegramChatId, 
    `📝 *Question ${index + 1}:*\n\n${q.questionText}`, 
    { inline_keyboard: keyboard }
  );
}
