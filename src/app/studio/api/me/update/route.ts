import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStudioFromToken } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const studio = await getStudioFromToken();
    if (!studio) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Update studio in database
    const updatedStudio = await prisma.studio.update({
      where: { id: studio.id },
      data: { name, email }
    });

    return NextResponse.json({
      id: updatedStudio.id,
      name: updatedStudio.name,
      email: updatedStudio.email,
      logo: updatedStudio.logoUrl,
      isActive: updatedStudio.isActive
    });
  } catch (error) {
    console.error('Error updating studio:', error);
    return NextResponse.json(
      { error: 'Failed to update studio' },
      { status: 500 }
    );
  }
} 