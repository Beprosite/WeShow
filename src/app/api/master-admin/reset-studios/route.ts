import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Verify master admin authentication
    const cookieStore = cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete all related records first (due to foreign key constraints)
    await prisma.section.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.studio.deleteMany({});

    return NextResponse.json({ 
      success: true,
      message: 'All studios and related data have been reset successfully'
    });

  } catch (error) {
    console.error('Error resetting studios:', error);
    return NextResponse.json(
      { error: 'Failed to reset studios' },
      { status: 500 }
    );
  }
} 