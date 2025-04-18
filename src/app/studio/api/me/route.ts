import { NextResponse } from 'next/server';
import { withPrisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/config';
import { cookies } from 'next/headers';
import { getStudioFromToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Check Authorization header first
    const authHeader = request.headers.get('Authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // If no token in header, try to get from cookie
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('studio_token')?.value;
    }

    if (!token) {
      console.log('No token found in headers or cookies');
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { studioId: string; email: string };
      console.log('Token verified successfully for studio:', decoded.studioId);

      return await withPrisma(async (prisma) => {
        // Get studio from database
        const studio = await prisma.studio.findUnique({
          where: {
            id: decoded.studioId
          },
          select: {
            id: true,
            name: true,
            email: true,
            logoUrl: true,
            isActive: true,
            subscriptionTier: true
          }
        });

        if (!studio) {
          console.log('Studio not found:', decoded.studioId);
          return NextResponse.json({ error: 'Studio not found' }, { status: 404 });
        }

        if (!studio.isActive) {
          console.log('Studio is inactive:', decoded.studioId);
          return NextResponse.json({ error: 'Studio is inactive' }, { status: 403 });
        }

        // Transform the data to match the expected format
        const transformedStudio = {
          ...studio,
          logo: studio.logoUrl,
          subscription: {
            tier: studio.subscriptionTier || 'Free',
            status: studio.isActive ? 'active' : 'inactive',
            expiresAt: null,
            billingPeriod: 'monthly',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            price: 0
          }
        };

        return NextResponse.json(transformedStudio);
      });
    } catch (error) {
      console.error('Token verification error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error in /studio/api/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Check Authorization header first
    const authHeader = request.headers.get('Authorization');
    let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // If no token in header, try to get from cookie
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('studio_token')?.value;
    }

    if (!token) {
      console.log('No token found in headers or cookies');
      return NextResponse.json({ error: 'Unauthorized - No token found' }, { status: 401 });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { studioId: string; email: string };
      console.log('Token verified successfully for studio:', decoded.studioId);

      // Get the updated data from the request
      const data = await request.json();
      
      // Validate required fields
      if (!data.name?.trim() || !data.email?.trim()) {
        return NextResponse.json(
          { success: false, message: 'Name and email are required' },
          { status: 400 }
        );
      }

      return await withPrisma(async (prisma) => {
        const updatedStudio = await prisma.studio.update({
          where: {
            id: decoded.studioId
          },
          data: {
            name: data.name.trim(),
            email: data.email.trim(),
            logoUrl: data.logo || undefined // Only update if provided
          }
        });

        // Transform the response data
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

        return NextResponse.json({
          success: true,
          message: 'Settings updated successfully',
          data: transformedStudio
        });
      });
    } catch (error) {
      console.error('Token verification error:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Token verification failed' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error updating studio settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update settings'
      },
      { status: 500 }
    );
  }
} 