import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminExists = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        passwordHash,
        role: 'SUPERADMIN',
        profile: {
          create: {
            fullName: 'Super Administrator',
            jobTitle: 'System Admin',
            phoneNumber: '+1234567890',
            nationalId: '000000000',
            address: 'Headquarters',
            dateOfHiring: new Date(),
            hourlyRate: 0,
          }
        }
      }
    });
    console.log('Created admin user: admin / admin123');
  } else {
    console.log('Admin user already exists.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
