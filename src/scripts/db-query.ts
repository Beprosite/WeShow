import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all studios
    const studios = await prisma.studio.findMany();
    console.log('All Studios:', JSON.stringify(studios, null, 2));

    // Get the first studio
    const firstStudio = await prisma.studio.findFirst();
    console.log('\nFirst Studio:', JSON.stringify(firstStudio, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 