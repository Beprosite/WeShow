'use server'

import { getPrismaClient } from '../prisma'
import { Prisma } from '@prisma/client'

export async function checkEmail(email: string) {
  console.log('Starting email check for:', email);

  try {
    if (!email) {
      console.log('Email check failed: No email provided');
      return { success: false, message: 'Email is required' }
    }

    // Validate email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    if (!emailRegex.test(email)) {
      console.log('Email check failed: Invalid email format');
      return { success: false, message: 'Invalid email format' }
    }

    console.log('Attempting to check email in database...');
    const prisma = await getPrismaClient()
    const normalizedEmail = email.toLowerCase()
    console.log('Checking database for email:', normalizedEmail);
    
    const existingStudio = await prisma.studio.findUnique({
      where: { email: normalizedEmail },
      select: { id: true }
    })

    console.log('Database query result:', { exists: !!existingStudio });

    return {
      success: true,
      available: !existingStudio,
      message: existingStudio 
        ? 'An account with this email address already exists. Sign in'
        : 'Email is available'
    }
  } catch (error) {
    console.error('Email check error:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error details:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      
      return {
        success: false,
        message: `Database error: ${error.message}`
      }
    }
    
    if (error instanceof Error) {
      return {
        success: false,
        message: `Error: ${error.message}`
      }
    }

    return {
      success: false,
      message: 'An unexpected error occurred while checking email availability'
    }
  }
} 