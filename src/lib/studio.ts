import { prisma } from './prisma';

export async function createStudio(studioData: any) {
  try {
    const studio = await prisma.studio.create({
      data: {
        name: studioData.companyName,
        email: studioData.email,
        password: studioData.password,
        phone: studioData.phone,
        logoUrl: studioData.logoUrl,
        subscriptionTier: studioData.planType || 'Free',
        contactName: studioData.contactName,
        contactEmail: studioData.contactEmail,
        contactPhone: studioData.contactPhone,
        address: studioData.address,
        website: studioData.website,
        industry: studioData.industry,
        studioSize: studioData.studioSize,
        isActive: true
      }
    });

    return studio;
  } catch (error) {
    console.error('Error creating studio:', error);
    throw error;
  }
} 