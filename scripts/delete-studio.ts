import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteStudio(studioId: string) {
  try {
    console.log(`Starting deletion process for studio ID: ${studioId}`);

    // 1. First delete all sections from all projects
    console.log('Deleting sections...');
    await prisma.section.deleteMany({
      where: {
        project: {
          studioId: studioId
        }
      }
    });

    // 2. Delete all projects
    console.log('Deleting projects...');
    await prisma.project.deleteMany({
      where: {
        studioId: studioId
      }
    });

    // 3. Delete all clients
    console.log('Deleting clients...');
    await prisma.client.deleteMany({
      where: {
        studioId: studioId
      }
    });

    // 4. Finally delete the studio
    console.log('Deleting studio...');
    await prisma.studio.delete({
      where: {
        id: studioId
      }
    });

    console.log('Studio and all related data deleted successfully!');

  } catch (error) {
    console.error('Error during deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get studio ID from command line argument
const studioId = process.argv[2];

if (!studioId) {
  console.error('Please provide a studio ID as an argument');
  process.exit(1);
}

deleteStudio(studioId); 