import { NextResponse } from 'next/server';
import { generateUploadURL } from '@/lib/s3';
import { getStudioFromToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const studio = await getStudioFromToken();
    if (!studio) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studioId, clientId, projectId, fileName } = await request.json();

    if (!studioId || !clientId || !projectId || !fileName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const uploadUrl = await generateUploadURL(
      studioId,
      clientId,
      projectId,
      fileName
    );

    return NextResponse.json({ uploadUrl });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
} 