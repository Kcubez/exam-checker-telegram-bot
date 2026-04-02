'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { setTelegramWebhook } from '@/lib/telegram';

export async function getBotSettings() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const bot = await prisma.bot.findFirst({
        where: { userId: session.user.id }
    });
    return { success: true, bot };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function updateBotSettings(data: {
  name: string;
  telegramBotToken?: string;
  welcomeMessage?: string;
}) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    let bot = await prisma.bot.findFirst({
        where: { userId: session.user.id }
    });
    
    if (bot) {
      bot = await prisma.bot.update({
        where: { id: bot.id },
        data: {
          name: data.name,
          telegramBotToken: data.telegramBotToken,
          welcomeMessage: data.welcomeMessage
        }
      });
    } else {
      bot = await prisma.bot.create({
        data: {
          name: data.name,
          telegramBotToken: data.telegramBotToken,
          welcomeMessage: data.welcomeMessage,
          userId: session.user.id
        }
      });
    }

    // Set webhook if token exists
    if (bot && bot.telegramBotToken) {
      await setTelegramWebhook(bot.telegramBotToken, bot.id);
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (err) {
    console.error('Update Error:', err);
    return { success: false, error: String(err) };
  }
}
