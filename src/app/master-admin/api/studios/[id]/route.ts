import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from the cookie
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(token, JWT_SECRET) as { id: string; role: string };

    if (decoded.role !== 'master_admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch studio with clients and their project counts
    const studio = await prisma.studio.findUnique({
      where: {
        id: params.id
      },
      include: {
        clients: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                projects: true
              }
            }
          }
        }
      }
    });

    if (!studio) {
      return NextResponse.json(
        { message: 'Studio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(studio);
  } catch (error) {
    console.error('Error fetching studio:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the token from the cookie
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token
    const decoded = verify(token, JWT_SECRET) as { id: string; role: string };

    if (decoded.role !== 'master_admin') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Update studio
    const studio = await prisma.studio.update({
      where: {
        id: params.id
      },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        logoUrl: body.logoUrl,
        isActive: body.isActive,
        subscriptionTier: body.subscriptionTier,
        subscriptionStatus: body.subscriptionStatus,
        website: body.website,
        address: body.address,
        industry: body.industry,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        contactPosition: body.contactPosition
      }
    });

    return NextResponse.json(studio);
  } catch (error) {
    console.error('Error updating studio:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 