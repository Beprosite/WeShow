import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const studios = await prisma.studio.findMany({
    select: {
      email: true,
      name: true,
      createdAt: true
    }
  });
  
  console.log('Existing studios:', studios);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 