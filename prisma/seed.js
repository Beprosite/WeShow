const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create master admin if it doesn't exist
    const masterAdmin = await prisma.masterAdmin.upsert({
      where: {
        username: 'Admin'
      },
      update: {
        password: 'Admin123'
      },
      create: {
        username: 'Admin',
        password: 'Admin123'
      }
    });

    console.log('Master admin created/updated:', masterAdmin);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 