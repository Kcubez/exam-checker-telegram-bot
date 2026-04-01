/**
 * Telegram Bot API helper functions for Exam Checker
 */

interface InlineKeyboardButton {
  text: string;
  callback_data: string;
}

/**
 * Send a text message via Telegram Bot API
 * Tries Markdown first, falls back to plain text if Telegram can't parse it
 */
export async function sendTelegramMessage(
  token: string,
  chatId: number | string,
  text: string,
  replyMarkup?: { inline_keyboard: InlineKeyboardButton[][] }
): Promise<{ ok: boolean; result?: { message_id: number }; description?: string }> {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: 'Markdown',
  };

  if (replyMarkup) {
    body.reply_markup = replyMarkup;
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({ ok: false }));

  // If Markdown parsing fails, retry without parse_mode (plain text)
  if (!response.ok && data?.error_code === 400 && data?.description?.includes("can't parse entities")) {
    console.warn('Telegram Markdown parse failed, retrying as plain text...');

    // Strip markdown formatting for clean plain text
    const plainText = text
      .replace(/\*([^*]+)\*/g, '$1') // Remove *bold*
      .replace(/_([^_]+)_/g, '$1'); // Remove _italic_

    const fallbackBody: Record<string, unknown> = {
      chat_id: chatId,
      text: plainText,
    };

    if (replyMarkup) {
      fallbackBody.reply_markup = replyMarkup;
    }

    const fallbackResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fallbackBody),
    });

    return await fallbackResponse.json().catch(() => ({ ok: false }));
  }

  return data;
}

/**
 * Get the download URL of a file uploaded to Telegram
 */
export async function getTelegramFileUrl(token: string, fileId: string): Promise<string | null> {
  const res = await fetch(`https://api.telegram.org/bot${token}/getFile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!data.ok || !data.result?.file_path) return null;

  return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(token: string, chatId: number | string) {
  await fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      action: 'typing',
    }),
  });
}

/**
 * Answer a callback query (removes the "loading" state from the button)
 */
export async function answerCallbackQuery(token: string, callbackQueryId: string, text?: string) {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text || '',
    }),
  });
}
