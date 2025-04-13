import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const studios = await prisma.studio.findMany({
      select: {
        email: true,
        name: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      studios
    });
  } catch (error) {
    console.error('Error fetching studios:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch studios'
    }, { status: 500 });
  }
} 