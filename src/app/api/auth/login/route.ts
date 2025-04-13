import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Check user in database
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    // If user not found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Create user object for cookie (without password)
    const userForCookie = {
      id: user.id,
      username: user.username,
      companyName: user.companyName
    };

    // Return successful response with user details
    const response = NextResponse.json(
      { success: true, user: userForCookie },
      { status: 200 }
    );

    // Set cookie with enhanced security
    response.cookies.set('user', JSON.stringify(userForCookie), {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,  // Added secure flag for HTTPS
      maxAge: 7200   // 2 hours in seconds
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}