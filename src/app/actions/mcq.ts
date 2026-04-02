'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function deleteExamQuestion(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    await prisma.question.delete({
      where: { id }
    });
    revalidatePath('/dashboard/mcqs');
    return { success: true };
  } catch (err) {
    console.error('Delete question error:', err);
    return { success: false, error: String(err) };
  }
}

export async function getExamQuestions() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: 'Unauthorized', questions: [] };

    const bot = await prisma.bot.findFirst({
      where: { userId: session.user.id }
    });
    if (!bot) {
      return { success: true, questions: [] };
    }

    const questions = await prisma.question.findMany({
      where: { botId: bot.id },
      orderBy: { createdAt: 'asc' },
    });

    // Map DB rows back to the UI shape
    const mapped = questions.map((q) => ({
      id: q.id,           // keep DB string id so we can round-trip it
      question: q.questionText,
      options: (q.options as string[]) ?? ['', '', '', ''],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation ?? '',
    }));

    return { success: true, questions: mapped };
  } catch (err) {
    console.error('Load questions error:', err);
    return { success: false, questions: [], error: String(err) };
  }
}

interface QuestionInput {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export async function saveExamQuestions(questions: QuestionInput[]) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const bot = await prisma.bot.findFirst({
      where: { userId: session.user.id }
    });
    if (!bot) {
      return { success: false, error: 'No bot found for current user.' };
    }

    // Use a transaction to ensure either everything works or nothing changes
    await prisma.$transaction(async (tx) => {
        // 1. Wipe out ALL existing questions for this bot
        await tx.question.deleteMany({
          where: { botId: bot.id }
        });

        // 2. Insert the new set from the UI
        if (questions.length > 0) {
            await tx.question.createMany({
              data: questions.map(q => ({
                botId: bot.id,
                questionText: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation
              }))
            });
        }
    });

    console.log(`Successfully synced ${questions.length} questions to database.`);
    revalidatePath('/dashboard/mcqs');
    return { success: true };
  } catch (err) {
    console.error('Save Sync Error:', err);
    return { success: false, error: String(err) };
  }
}
