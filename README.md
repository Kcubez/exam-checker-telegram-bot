# Exam Checker Telegram Bot 🚀

This is a standalone Telegram bot project for checking student exam answers, summaries, and handwritten notes using Google Gemini AI.

## Features
- ✅ **Text Check:** Analyzes typed answers and provides constructive feedback.
- 📸 **Photo Analysis:** Checks handwritten exam sheets and provides scores.
- 🇲🇲 **Myanmar Language:** All feedback and bot responses are in Myanmar (Burmese).

## Setup instructions

1. **Environment Variables**
   - Provide your **TELEGRAM_BOT_TOKEN** in `.env.local`
   - Your **GOOGLE_API_KEY** is already included (copied from your `chatbot-widget` project)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Webhook**
   To receive messages from Telegram, you must set an HTTPS webhook pointing to your API:
   \`\`\`bash
   curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_DEPLOY_URL>/api/webhooks/telegram
   \`\`\`

4. **Run Locally**
   ```bash
   npm run dev
   ```

## Folder Structure
- `src/lib/ai.ts`: Main logic for verifying answers with AI.
- `src/lib/telegram.ts`: Helper methods for communicating with Telegram API.
- `src/app/api/webhooks/telegram/route.ts`: Main webhook handler.
