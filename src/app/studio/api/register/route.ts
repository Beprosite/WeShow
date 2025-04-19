import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { PLAN_LIMITS, PlanTier } from '@/lib/plans';
import { addDays } from 'date-fns';
import { sendWelcomeEmail } from '@/app/lib/email';

export async function POST(request: Request) {
  try {
    console.log('Received registration request');
    const data = await request.json();
    console.log('Parsed request data:', {
      ...data,
      password: '[REDACTED]'
    });
    
    const { 
      name,
      email,
      password,
      logoUrl,
      subscriptionTier: rawSubscriptionTier,
      contactName,
      contactEmail,
      contactPhone,
      website,
      address
    } = data;

    console.log('Subscription Tier received:', rawSubscriptionTier);
    console.log('Available tiers:', Object.keys(PLAN_LIMITS));

    // Validate subscription tier
    const subscriptionTier = (!rawSubscriptionTier || !Object.keys(PLAN_LIMITS).includes(rawSubscriptionTier))
      ? 'Free'
      : rawSubscriptionTier;

    console.log('Using subscription tier:', subscriptionTier);

    console.log('Checking for existing studio with email:', email);
    // Check if studio already exists
    const existingStudio = await prisma.studio.findUnique({
      where: {
        email
      }
    });

    if (existingStudio) {
      console.log('Studio already exists with email:', email);
      return NextResponse.json(
        { message: 'A studio with this email already exists' },
        { status: 400 }
      );
    }

    console.log('Finding master admin');
    // Get the first masterAdmin from the database
    const masterAdmin = await prisma.masterAdmin.findFirst();
    if (!masterAdmin) {
      console.log('No master admin found');
      return NextResponse.json(
        { message: 'No master admin found' },
        { status: 400 }
      );
    }

    console.log('Found master admin:', masterAdmin.id);

    console.log('Hashing password');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get plan limits
    const planTier = subscriptionTier as PlanTier;
    console.log('Using plan tier:', planTier);
    
    const planLimits = PLAN_LIMITS[planTier];
    if (!planLimits) {
      console.error('Plan limits not found for tier:', planTier);
      return NextResponse.json(
        { message: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    console.log('Plan limits:', planLimits);

    // Set trial end date for free tier
    const trialEndsAt = planTier === 'Free' ? addDays(new Date(), 14) : null;

    console.log('Creating new studio with master admin:', masterAdmin.id);
    // Create new studio
    const studio = await prisma.studio.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: true,
        subscriptionTier: planTier,
        logoUrl: logoUrl || '',
        contactName,
        contactEmail,
        contactPhone,
        website: website || '',
        address: address || '',
        trialEndsAt,
        masterAdmin: {
          connect: {
            id: masterAdmin.id
          }
        }
      }
    });

    console.log('Studio created successfully:', {
      id: studio.id,
      name: studio.name,
      email: studio.email,
      masterAdminId: masterAdmin.id,
      plan: {
        tier: planTier,
        storageLimit: planLimits.storageLimit,
        clientLimit: planLimits.clientLimit,
        projectsPerClientLimit: planLimits.projectsPerClientLimit,
        trialEndsAt: trialEndsAt ? trialEndsAt.toISOString() : null
      }
    });

    // After successful registration, send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      { 
        message: 'Studio registered successfully',
        studioId: studio.id,
        plan: {
          tier: planTier,
          features: planLimits.features,
          trialEndsAt: trialEndsAt ? trialEndsAt.toISOString() : null
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Failed to register studio: ' + (error as Error).message },
      { status: 500 }
    );
  }
} 