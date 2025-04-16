import { NextResponse } from 'next/server';
import { moveRegistrationToStudio } from '@/lib/s3-cleanup';
import { createStudio } from '@/lib/studio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { registrationId, studioData } = body;

    if (!registrationId || !studioData) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Create the studio in the database
    const studio = await createStudio(studioData);

    // Move files from temporary to permanent storage
    await moveRegistrationToStudio(registrationId, studio.id);

    // Clean up the registration ID from localStorage
    // This will be handled by the frontend after successful payment

    return NextResponse.json({
      success: true,
      studioId: studio.id
    });
  } catch (error) {
    console.error('Payment success webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment success' },
      { status: 500 }
    );
  }
} 