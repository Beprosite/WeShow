import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Default master admin credentials
    const username = 'Admin';
    const password = 'Admin123';

    // Check if master admin already exists
    const existingAdmin = await prisma.masterAdmin.findUnique({
      where: { username }
    });

    if (existingAdmin) {
      console.log('Master admin already exists. Updating password...');
      await prisma.masterAdmin.update({
        where: { username },
        data: { password }
      });
    } else {
      console.log('Creating new master admin...');
      await prisma.masterAdmin.create({
        data: {
          username,
          password
        }
      });
    }

    console.log('Master admin setup complete!');
    console.log('Username:', username);
    console.log('Password:', password);

  } catch (error) {
    console.error('Error setting up master admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 