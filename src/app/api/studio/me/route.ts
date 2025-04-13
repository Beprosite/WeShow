import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudioFromToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get studio from token
    const studio = await getStudioFromToken(authHeader);
    if (!studio) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return studio data (excluding sensitive information)
    return NextResponse.json({
      id: studio.id,
      name: studio.name,
      email: studio.email,
      logoUrl: studio.logoUrl,
      contactName: studio.contactName,
      contactEmail: studio.contactEmail,
      contactPhone: studio.contactPhone,
      address: studio.address,
      industry: studio.industry,
      website: studio.website,
      subscriptionTier: studio.subscriptionTier,
      isActive: studio.isActive
    });

  } catch (error) {
    console.error('Error in /api/studio/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 