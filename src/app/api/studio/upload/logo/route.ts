import { NextResponse } from 'next/server';
import { generateStudioLogoUploadURL } from '@/lib/s3';
import { getStudioFromToken } from '@/lib/auth';
import { S3Paths, generateUniqueFileName } from '@/lib/s3-utils';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const registrationId = formData.get('registrationId') as string; // Add this to track registration

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const uniqueFileName = generateUniqueFileName(file.name);
    
    // Store in temporary registration folder
    const key = `temp/registrations/${registrationId}/logo/${uniqueFileName}`;
    
    // Generate upload URL for logo
    const uploadUrl = await generateStudioLogoUploadURL('temp', uniqueFileName);

    // Return the upload URL and the key for later use
    return NextResponse.json({ 
      uploadUrl,
      key,
      publicUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process logo upload' },
      { status: 500 }
    );
  }
} 