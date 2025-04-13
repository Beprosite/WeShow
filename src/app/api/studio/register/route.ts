import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.email || !data.password || !data.companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingStudio = await prisma.studio.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existingStudio) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create studio
    const studio = await prisma.studio.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.companyName,
        phone: data.phone,
        logoUrl: data.logoUrl,
        contactName: `${data.firstName} ${data.lastName}`,
        contactEmail: data.email,
        contactPhone: data.phone,
        address: data.address1,
        industry: data.industry,
        website: data.website,
        subscriptionTier: data.plan || 'Free',
        isActive: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        studioId: studio.id,
        email: studio.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      token,
      studio: {
        id: studio.id,
        name: studio.name,
        email: studio.email
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 