import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete all related records first (due to foreign key constraints)
    console.log('Deleting related records...');
    await prisma.section.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.studio.deleteMany({});
    console.log('All studios and related records deleted successfully');

    // Create a new studio
    const hashedPassword = await bcrypt.hash('Test123!@#', 10);
    const newStudio = await prisma.studio.create({
      data: {
        name: 'Test Studio',
        email: '30pips@gmail.com',
        password: hashedPassword,
        phone: '+1234567890',
        subscriptionTier: 'Pro',
        contactName: 'Tomer',
        contactEmail: '30pips@gmail.com',
        contactPhone: '+1234567890',
        contactPosition: 'Owner',
        website: 'https://weshow.drapp.ai',
        industry: 'Photography',
        studioSize: 'Small',
        isActive: true
      }
    });

    console.log('New studio created successfully:', newStudio);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 