import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Find the master admin by username
    const masterAdmin = await prisma.masterAdmin.findUnique({
      where: { username },
    });

    if (!masterAdmin) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // In a real application, you would hash the password and compare hashes
    // For demo purposes, we're doing a direct comparison
    if (password !== masterAdmin.password) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = sign(
      { 
        id: masterAdmin.id,
        username: masterAdmin.username,
        role: 'master_admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 