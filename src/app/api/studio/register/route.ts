import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail, sendStudioRegistrationNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const prisma = await getPrismaClient();
    const data = await request.json();

    console.log('Registration data:', data);

    // Validate required fields
    if (!data.email || !data.password || !data.companyName || !data.firstName || !data.lastName) {
      console.log('Missing required fields:', {
        email: !!data.email,
        password: !!data.password,
        companyName: !!data.companyName,
        firstName: !!data.firstName,
        lastName: !!data.lastName
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if studio already exists
    const existingStudio = await prisma.studio.findUnique({
      where: { email: data.email }
    });

    if (existingStudio) {
      console.log('Studio already exists:', existingStudio.email);
      return NextResponse.json(
        { error: 'Studio with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    console.log('Creating studio with data:', {
      name: data.companyName,
      email: data.email,
      hashedPassword: hashedPassword.substring(0, 10) + '...',
      trialEndsAt,
      marketingConsent: data.marketingConsent || false
    });

    // Create studio
    const studio = await prisma.studio.create({
      data: {
        name: data.companyName,
        email: data.email,
        password: hashedPassword,
        phone: null,
        logoUrl: null,
        isActive: true,
        subscriptionTier: 'Free',
        dateFormat: 'MM/DD/YYYY',
        contactName: `${data.firstName} ${data.lastName}`,
        contactEmail: data.email,
        contactPhone: null,
        contactPosition: null,
        website: null,
        industry: null,
        address: null,
        studioSize: null,
        marketingConsent: data.marketingConsent || false,
        trialEndsAt: trialEndsAt,
        masterAdminId: 'cm9oa83ej0000flt0yemp3qqe' // Updated master admin ID
      }
    });

    console.log('Studio created successfully:', {
      id: studio.id,
      name: studio.name,
      email: studio.email
    });

    // Generate JWT token
    const token = jwt.sign(
      { studioId: studio.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Try to send welcome email, but don't fail registration if it fails
    try {
      console.log('Sending welcome email to:', studio.email);
      await sendWelcomeEmail(studio.email, studio.name, data.firstName);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue with registration even if email fails
    }

    // Try to send admin notification, but don't fail registration if it fails
    try {
      console.log('Sending admin notification');
      await sendStudioRegistrationNotification({
        name: studio.name,
        email: studio.email,
        contactName: studio.contactName,
        subscriptionTier: studio.subscriptionTier
      });
      console.log('Admin notification sent successfully');
    } catch (adminEmailError) {
      console.error('Failed to send admin notification email:', adminEmailError);
      // Continue with registration even if admin email fails
    }

    return NextResponse.json({
      studio: {
        id: studio.id,
        name: studio.name,
        email: studio.email,
        subscriptionTier: studio.subscriptionTier
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 