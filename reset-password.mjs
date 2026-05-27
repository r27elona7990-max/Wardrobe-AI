import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const config = { url: process.env.DATABASE_URL || 'file:./prisma/dev.db' };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'r27elona7990@gmail.com';
  const newPassword = 'password123';
  
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found in DB!');
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(newPassword, salt);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashed }
  });
  
  console.log('Successfully reset password for ' + email + ' to: ' + newPassword);
}

main().catch(console.error).finally(() => prisma.$disconnect());
