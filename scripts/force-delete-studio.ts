import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function forceDeleteStudio(studioId: string) {
  try {
    console.log(`\nStarting force deletion for studio ID: ${studioId}`);

    // First, let's check if the studio exists and show its details
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        _count: {
          select: {
            clients: true,
            projects: true
          }
        }
      }
    });

    if (!studio) {
      console.log('Studio not found!');
      return;
    }

    console.log('\nFound studio:', {
      name: studio.name,
      email: studio.email,
      clientCount: studio._count.clients,
      projectCount: studio._count.projects
    });

    // 1. Delete all media first
    console.log('\nDeleting media...');
    await prisma.$executeRaw`DELETE FROM "Media" WHERE "projectId" IN (SELECT id FROM "Project" WHERE "studioId" = ${studioId})`;
    
    // 2. Delete all sections
    console.log('Deleting sections...');
    await prisma.$executeRaw`DELETE FROM "Section" WHERE "projectId" IN (SELECT id FROM "Project" WHERE "studioId" = ${studioId})`;

    // 3. Delete all projects
    console.log('Deleting projects...');
    await prisma.$executeRaw`DELETE FROM "Project" WHERE "studioId" = ${studioId}`;

    // 4. Delete all clients
    console.log('Deleting clients...');
    await prisma.$executeRaw`DELETE FROM "Client" WHERE "studioId" = ${studioId}`;

    // 5. Finally delete the studio
    console.log('Deleting studio...');
    await prisma.$executeRaw`DELETE FROM "Studio" WHERE id = ${studioId}`;

    console.log('\nStudio and all related data deleted successfully!');

  } catch (error) {
    console.error('\nError during deletion:', error);
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

forceDeleteStudio(studioId); 