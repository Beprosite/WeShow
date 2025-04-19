import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Get all studios with their counts
    const studios = await prisma.studio.findMany({
      include: {
        _count: {
          select: {
            clients: true,
            projects: true
          }
        }
      }
    });

    console.log('\nRegistered Studios:', studios.length);
    console.log('------------------------');
    
    studios.forEach(studio => {
      console.log(`\nStudio: ${studio.name}`);
      console.log(`Email: ${studio.email}`);
      console.log(`Subscription: ${studio.subscriptionTier}`);
      console.log(`Clients: ${studio._count.clients}`);
      console.log(`Projects: ${studio._count.projects}`);
      console.log('------------------------');
    });

  } catch (error) {
    console.error('Error checking studios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 