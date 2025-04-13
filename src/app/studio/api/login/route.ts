import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);

    // Find the studio by email
    const studio = await prisma.studio.findUnique({
      where: { email }
    });

    if (!studio) {
      console.log('No studio found with email:', email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Studio found:', { id: studio.id, email: studio.email });

    // Verify password
    const isValidPassword = await bcrypt.compare(password, studio.password);
    console.log('Password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for studio:', studio.email);
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(studio.id, studio.email);

    // Create response object with token
    const response = NextResponse.json({
      success: true,
      token, // Include token in response for localStorage
      studio: {
        id: studio.id,
        name: studio.name,
        email: studio.email
      }
    });

    // Set the studio_token cookie with proper options
    response.cookies.set('studio_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log('Login successful for studio:', studio.email);
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 