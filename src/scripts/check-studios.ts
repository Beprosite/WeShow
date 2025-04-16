import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const studios = await prisma.studio.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      logoUrl: true,
      isActive: true,
      subscriptionTier: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      website: true,
      industry: true,
      address: true,
      studioSize: true,
      createdAt: true,
      updatedAt: true
    }
  });
  
  console.log('Existing studios:', JSON.stringify(studios, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 