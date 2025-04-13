import { NextResponse } from 'next/server';
import { generateUploadURL } from '@/lib/s3';

export async function POST(request: Request) {
  try {
    const { studioId, clientId, projectId, fileName } = await request.json();

    if (!studioId || !clientId || !projectId || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const uploadUrl = await generateUploadURL(studioId, clientId, projectId, fileName);
    console.log('Generated URL in API route:', uploadUrl);

    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error('Upload URL generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
} 