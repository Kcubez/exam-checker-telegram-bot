import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as argon2 from 'argon2';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 1,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Admin User
  const adminEmail = 'admin@exam.com';
  const adminPassword = await argon2.hash('admin1234');
  
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          providerId: 'email',
          accountId: adminEmail,
          password: adminPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    }
  });
  console.log('✅ Created Admin user:', admin.email);

  // 2. Create Regular User
  const userEmail = 'user@exam.com';
  const userPassword = await argon2.hash('user1234');

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      name: 'Regular Student',
      role: 'USER',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          providerId: 'email',
          accountId: userEmail,
          password: userPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
    }
  });
  console.log('✅ Created Regular user:', user.email);

  console.log('🏁 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
