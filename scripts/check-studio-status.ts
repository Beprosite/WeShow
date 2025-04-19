import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn']
});

async function checkStudioStatus(studioId: string) {
  try {
    // Check if studio exists
    const studioExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM "Studio" WHERE id = ${studioId}
      );
    `;
    console.log('Studio exists:', studioExists);

    // Get all relationships
    const relationships = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM "Client" WHERE "studioId" = ${studioId}) as client_count,
        (SELECT COUNT(*) FROM "Project" WHERE "studioId" = ${studioId}) as project_count,
        (SELECT COUNT(*) FROM "Section" WHERE "projectId" IN 
          (SELECT id FROM "Project" WHERE "studioId" = ${studioId})) as section_count,
        (SELECT COUNT(*) FROM "Media" WHERE "projectId" IN 
          (SELECT id FROM "Project" WHERE "studioId" = ${studioId})) as media_count;
    `;
    console.log('Relationships:', relationships);

  } catch (error) {
    console.error('Error checking studio status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

const studioId = process.argv[2];
if (!studioId) {
  console.error('Please provide a studio ID');
  process.exit(1);
}

checkStudioStatus(studioId); 