import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { JWT_SECRET } from '../../../../lib/config';

export async function GET() {
  try {
    console.log('Studios API: GET request received');
    
    // Get the token from the cookie using Next.js cookies API
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    console.log('Studios API - All cookies:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
    
    const token = cookieStore.get('token')?.value;
    console.log('Studios API - Token from cookie:', token ? `Found token (${token.substring(0, 20)}...)` : 'No token found');

    if (!token) {
      console.log('Studios API - No token found in cookies');
      return NextResponse.json(
        { message: 'Unauthorized - No token found' },
        { status: 401 }
      );
    }

    try {
      // Verify the token
      console.log('Studios API - Attempting to verify token with secret:', JWT_SECRET.substring(0, 10) + '...');
      const decoded = verify(token, JWT_SECRET) as { id: string; role: string };
      console.log('Studios API - Token verification successful. Decoded payload:', decoded);

      if (!decoded || !decoded.role) {
        console.log('Studios API - Invalid token payload:', decoded);
        return NextResponse.json(
          { message: 'Unauthorized - Invalid token payload' },
          { status: 401 }
        );
      }

      if (decoded.role !== 'master_admin') {
        console.log('Studios API - Invalid role:', decoded.role);
        return NextResponse.json(
          { message: 'Unauthorized - Invalid role' },
          { status: 401 }
        );
      }

      // Fetch all studios with client and project counts
      console.log('Fetching studios from database with masterAdminId:', decoded.id);
      const studios = await prisma.studio.findMany({
        where: {
          masterAdminId: decoded.id
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          logoUrl: true,
          isActive: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          createdAt: true,
          updatedAt: true,
          masterAdminId: true,
          _count: {
            select: {
              clients: true,
              projects: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`Found ${studios.length} studios`);
      return NextResponse.json(studios);
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      return NextResponse.json(
        { message: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error fetching studios:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get the token from the cookie using Next.js cookies API
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

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

    // Create new studio
    const studio = await prisma.studio.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        logoUrl: body.logoUrl,
        isActive: true,
        subscriptionTier: body.subscriptionTier,
        subscriptionStatus: body.subscriptionStatus || 'active',
        website: body.website,
        address: body.address,
        industry: body.industry,
        contactName: body.contactName,
        contactEmail: body.contactEmail,
        contactPhone: body.contactPhone,
        contactPosition: body.contactPosition,
        masterAdminId: decoded.id
      }
    });

    return NextResponse.json(studio);
  } catch (error) {
    console.error('Error creating studio:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 