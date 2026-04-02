'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import * as argon2 from 'argon2';

export async function getAdminUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return { success: true, users };
  } catch (err) {
    console.error('getAdminUsers error:', err);
    return { success: false, users: [] };
  }
}

export async function deleteAdminUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    console.error('deleteAdminUser error:', err);
    return { success: false, error: String(err) };
  }
}

export async function createAdminUser(data: { name: string; email: string; role: string; password?: string }) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return { success: false, error: 'User already exists' };

    // Use Better Auth's own API so the password is hashed in the format
    // Better Auth expects at sign-in (argon2 via emailAndPassword.password.hash)
    const response = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: data.password || crypto.randomUUID(), // fallback random pw if none given
      },
    });

    if (!response?.user?.id) {
      return { success: false, error: 'Failed to create user via auth API' };
    }

    // Update role separately since signUpEmail doesn't accept extra fields
    await prisma.user.update({
      where: { id: response.user.id },
      data: { role: data.role, updatedAt: new Date() },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    console.error('createAdminUser error:', err);
    return { success: false, error: String(err) };
  }
}

export async function updateAdminUser(id: string, data: { name: string; email: string; role: string; password?: string }) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        updatedAt: new Date()
      }
    });

    if (data.password) {
      // Hash using the same argon2 function configured in auth.ts emailAndPassword.password.hash
      const hashedPassword = await argon2.hash(data.password);
      const existingAccount = await prisma.account.findFirst({
        where: { userId: id, providerId: 'credential' },
      });
      if (existingAccount) {
        await prisma.account.update({
          where: { id: existingAccount.id },
          data: { password: hashedPassword, updatedAt: new Date() },
        });
      } else {
        // No credential account yet — create one
        const user = await prisma.user.findUnique({ where: { id } });
        await prisma.account.create({
          data: {
            userId: id,
            providerId: 'credential',
            accountId: user!.email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (err) {
    console.error('updateAdminUser error:', err);
    return { success: false, error: String(err) };
  }
}
