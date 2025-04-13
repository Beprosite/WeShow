import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import { JWT_SECRET } from './config';

const encoder = new TextEncoder();

interface JwtPayload {
  studioId: string;
  email: string;
}

export async function getStudioFromToken(authHeader?: string) {
  try {
    let token;
    
    // Try to get token from auth header
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    }
    
    // If no token in header, try to get from cookie
    if (!token) {
      const cookieStore = cookies();
      token = cookieStore.get('studio_token')?.value;
    }

    if (!token) {
      console.log('No token found in headers or cookies');
      return null;
    }

    const secret = encoder.encode(JWT_SECRET);
    
    // Verify token
    const { payload } = await jose.jwtVerify(token, secret);
    
    if (!payload.studioId) {
      return null;
    }

    // Get studio from database
    const studio = await prisma.studio.findUnique({
      where: { id: payload.studioId as string },
      select: {
        id: true,
        name: true,
        email: true,
        logoUrl: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
        industry: true,
        website: true,
        subscriptionTier: true,
        isActive: true
      }
    });

    return studio;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export function generateToken(studioId: string, email: string) {
  return jwt.sign(
    { studioId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function setAuthCookie(token: string) {
  cookies().set('studio_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 // 7 days
  });
} 