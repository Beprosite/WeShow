const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createMasterAdmin() {
  try {
    const username = 'admin';
    const password = 'admin123'; // Simple password for testing
    const hashedPassword = await bcrypt.hash(password, 10);

    const masterAdmin = await prisma.masterAdmin.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    console.log('Master Admin created successfully:', {
      id: masterAdmin.id,
      username: masterAdmin.username,
    });

    console.log('\nYou can now log in with:');
    console.log('Username:', username);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating master admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMasterAdmin(); 