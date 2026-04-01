import { NextRequest, NextResponse } from 'next/server';
import { 
  sendTelegramMessage, 
  sendTypingIndicator, 
  getTelegramFileUrl, 
  answerCallbackQuery 
} from '@/lib/telegram';
import { 
  generateBotResponse, 
  verifyExamPhoto, 
  verifyTextSubmission 
} from '@/lib/ai';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Default System Prompt for the Exam Checker
const SYSTEM_PROMPT = \`You are an AI Exam Checker Bot. Your job is to help students by checking their exam answers, summaries, or handwritten notes.
- When a user sends text, check if it's a valid academic response and provide feedback.
- When a user sends a photo, analyze it as an exam sheet and provide a score/feedback.
- Always be encouraging, professional, and helpful.
- Respond in Myanmar (Burmese) language for the user's ease of understanding.\`;

export async function POST(request: NextRequest) {
  try {
    if (!BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not set');
      return new NextResponse('Internal Server Error', { status: 500 });
    }

    const update = await request.json();

    // ── Handle Callback Queries (Buttons) ──
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      if (data === 'how_to_use') {
        const helpText = \`📝 *How to use Exam Checker Bot*
        
1️⃣ *Text Answers:* ရေးသားထားတဲ့ အဖြေတွေကို Bot ဆီ တိုက်ရိုက် ရိုက်ပို့ပေးပါ။ AI က စစ်ဆေးပေးပါမယ်။
2️⃣ *Photo Checking:* လက်ရေးနဲ့ရေးထားတဲ့ အဖြေလွှာတွေကို ဓာတ်ပုံရိုက်ပြီး ပို့ပေးပါ။

Bot က အဖြေတွေကို စစ်ဆေးပြီး လိုအပ်တဲ့ feedback တွေနဲ့ အမှတ်တွေကို ပေးသွားမှာ ဖြစ်ပါတယ်!\`;
        await sendTelegramMessage(BOT_TOKEN, chatId, helpText);
        await answerCallbackQuery(BOT_TOKEN, callbackQuery.id);
      }
      
      return new NextResponse('OK', { status: 200 });
    }

    // ── Handle Text Messages ──
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const userMessage = update.message.text;

      // Handle /start command
      if (userMessage === '/start') {
        const welcomeMessage = \`🎉 *Exam Checker Bot မှ ကြိုဆိုပါတယ်!*

ကျွန်တော်က သင့်ရဲ့ စာမေးပွဲအဖြေလွှာတွေကို စစ်ဆေးပေးမယ့် AI Bot ပါ။ 🚀

စစ်ဆေးချင်တဲ့ အဖြေတွေကို *Text* အနေနဲ့ ပို့နိုင်သလို၊ *ဓာတ်ပုံ (Photo)* ရိုက်ပြီးတော့လည်း ပို့နိုင်ပါတယ်။

ဘယ်လို သုံးရမလဲ သိချင်ရင် အောက်က button ကို နှိပ်ပါ 👇\`;
        
        await sendTelegramMessage(BOT_TOKEN, chatId, welcomeMessage, {
          inline_keyboard: [
            [{ text: '❓ အသုံးပြုပုံ ကြည့်မည်', callback_data: 'how_to_use' }]
          ]
        });
        return new NextResponse('OK', { status: 200 });
      }

      // Handle normal text messages (Exam verification)
      await sendTypingIndicator(BOT_TOKEN, chatId);
      
      // We'll treat this as a general text submission
      const result = await verifyTextSubmission(
        userMessage,
        "General academic check. Provide constructive feedback and point out mistakes.",
        "General Exam/Exercise"
      );

      await sendTelegramMessage(BOT_TOKEN, chatId, result.feedback);
      return new NextResponse('OK', { status: 200 });
    }

    // ── Handle Photo Messages (Exam Sheet Analysis) ──
    if (update.message && update.message.photo) {
      const chatId = update.message.chat.id;
      const photos = update.message.photo;
      const largestPhoto = photos[photos.length - 1]; // Highest resolution

      await sendTelegramMessage(BOT_TOKEN, chatId, '🔍 *အဖြေလွှာကို စစ်ဆေးနေပါတယ်...* ခဏစောင့်ပေးပါ');
      await sendTypingIndicator(BOT_TOKEN, chatId);

      const fileUrl = await getTelegramFileUrl(BOT_TOKEN, largestPhoto.file_id);
      
      if (fileUrl) {
        const result = await verifyExamPhoto(
          fileUrl,
          "Detected from Image",
          "Identify the subject and check the answers. provide score if possible."
        );

        let finalResponse = result.feedback;
        if (result.score) {
          finalResponse = \`📊 *Score: \${result.score}*\n\n\${finalResponse}\`;
        }

        await sendTelegramMessage(BOT_TOKEN, chatId, finalResponse);
      } else {
        await sendTelegramMessage(BOT_TOKEN, chatId, '⚠️ ဓာတ်ပုံကို download လုပ်လို့ မရပါ။ ပြန်ပို့ပေးပါ။');
      }

      return new NextResponse('OK', { status: 200 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (err) {
    console.error('Webhook Error:', err);
    return new NextResponse('OK', { status: 200 }); // Always return 200 to Telegram to stop retries
  }
}
