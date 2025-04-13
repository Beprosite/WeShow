import { NextResponse } from 'next/server';
import { getStudioFromToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const studio = await getStudioFromToken();
    
    if (!studio) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, logo, email } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Studio name is required' },
        { status: 400 }
      );
    }

    const updatedStudio = await prisma.studio.update({
      where: {
        id: studio.id
      },
      data: {
        name,
        ...(email && { email }),
        ...(logo && { logoUrl: logo })
      },
      select: {
        id: true,
        name: true,
        email: true,
        logoUrl: true,
        isActive: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        contactPosition: true,
        website: true,
        industry: true,
        address: true,
        studioSize: true
      }
    });

    if (!updatedStudio) {
      throw new Error('Failed to update studio');
    }

    // Transform the data to match the expected format
    const transformedStudio = {
      ...updatedStudio,
      logo: updatedStudio.logoUrl,
      subscription: {
        tier: updatedStudio.subscriptionTier || 'Free',
        status: updatedStudio.isActive ? 'active' : 'inactive',
        expiresAt: null,
        billingPeriod: 'monthly',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        price: 0
      }
    };

    return NextResponse.json(transformedStudio);
  } catch (error) {
    console.error('Error updating studio settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update studio settings';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 