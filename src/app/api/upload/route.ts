import { NextResponse } from 'next/server';
import { generateProjectFileUploadURL } from '@/lib/s3';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { studioId, clientId, projectId, fileName } = await request.json();

    if (!studioId || !clientId || !projectId || !fileName) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const uploadUrl = await generateProjectFileUploadURL(
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