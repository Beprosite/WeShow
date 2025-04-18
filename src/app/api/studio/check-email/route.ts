import { NextRequest, NextResponse } from 'next/server';
import { checkEmail } from '@/lib/actions/email';

// Use Node.js runtime instead of Edge
export const runtime = 'nodejs';

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
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return createResponse({
        success: false,
        message: 'Email is required'
      }, 400);
    }

    const result = await checkEmail(email);
    return createResponse(result, result.success ? 200 : 400);

  } catch (error) {
    console.error('Email check error:', error);
    return createResponse({
      success: false,
      message: 'An unexpected error occurred. Please try again later.'
    }, 500);
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
} 