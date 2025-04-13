import { NextRequest, NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
  'Content-Type': 'application/json'
};

function createResponse(data: any, status = 200) {
  return new NextResponse(JSON.stringify(data), {
    status,
    headers: corsHeaders
  });
}

export async function POST(req: NextRequest) {
  console.log('Starting email check request');
  
  try {
    // Test database connection first
    console.log('Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Database connection failed');
      return createResponse({
        success: false,
        message: 'Database connection failed'
      }, 500);
    }
    console.log('Database connection successful');

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return createResponse({
        success: false,
        message: 'Invalid request body'
      }, 400);
    }

    const { email } = body;
    console.log('Checking email:', email);

    if (!email) {
      return createResponse({
        success: false,
        message: 'Email is required'
      }, 400);
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      return createResponse({
        success: false,
        message: 'Invalid email format'
      }, 400);
    }

    try {
      console.log('Querying database for email:', email.toLowerCase());
      const existingStudio = await prisma.studio.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      });

      console.log('Database query result:', { exists: !!existingStudio });

      return createResponse({
        success: true,
        available: !existingStudio,
        message: existingStudio ? 'This email is already registered' : 'Email is available'
      });

    } catch (error) {
      console.error('Database query error:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', {
          code: error.code,
          message: error.message,
          meta: error.meta
        });
      }
      return createResponse({
        success: false,
        message: 'Database error occurred',
        error: error instanceof Error ? error.message : String(error)
      }, 500);
    }

  } catch (error) {
    console.error('Email check error:', error);
    return createResponse({
      success: false,
      message: 'Failed to check email availability',
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
} 