import { NextResponse } from 'next/server';
import { withPrisma } from '@/lib/prisma';

export async function POST(request: Request) {
  console.log('Starting email check endpoint');
  
  try {
    const { email } = await request.json();
    console.log('Received email to check:', email);

    if (!email) {
      console.log('No email provided');
      return NextResponse.json({
        success: false,
        available: false,
        message: 'Email is required'
      });
    }

    console.log('Checking email availability:', email);
    console.log('Database URL:', process.env.DATABASE_URL); // Log database URL (redacted sensitive info)

    return await withPrisma(async (prisma) => {
      console.log('Got Prisma client, executing query...');
      
      // Check if studio already exists with this email
      const existingStudio = await prisma.studio.findUnique({
        where: { email },
        select: { id: true, email: true } // Only select necessary fields
      });

      console.log('Database query result:', {
        email,
        studioFound: !!existingStudio,
        studioId: existingStudio?.id
      });

      const isAvailable = !existingStudio;
      
      console.log('Email availability result:', {
        email,
        isAvailable,
        exists: !!existingStudio
      });

      const message = isAvailable 
        ? 'Email is available'
        : 'An account with this email address already exists. Sign in';

      return NextResponse.json({
        success: true,
        available: isAvailable,
        message: message
      });
    });

  } catch (error) {
    console.error('Error checking email availability:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      success: false,
      available: false,
      message: 'Failed to verify email availability'
    });
  }
} 