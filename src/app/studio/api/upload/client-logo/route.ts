import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getStudioFromToken } from '@/lib/auth';
import { s3Client, S3_BUCKET_NAME } from '@/lib/aws-config';

export async function POST(request: Request) {
  console.log('Received client logo upload request');
  
  try {
    const studio = await getStudioFromToken();
    if (!studio) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as Blob;
    const studioId = formData.get('studioId') as string;
    const clientId = formData.get('clientId') as string;

    console.log('Received upload data:', {
      hasFile: !!file,
      fileType: file?.type,
      fileSize: file?.size,
      studioId,
      clientId,
      s3Config: {
        bucket: S3_BUCKET_NAME,
        hasClient: !!s3Client
      }
    });

    if (!file || !studioId || !clientId) {
      console.log('Missing required fields:', {
        hasFile: !!file,
        hasStudioId: !!studioId,
        hasClientId: !!clientId
      });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = 'jpg';
    const uniqueFileName = `${timestamp}-${random}.${extension}`;
    const key = `studios/${studioId}/clients/${clientId}/logos/${uniqueFileName}`;

    console.log('Attempting S3 upload:', {
      bucket: S3_BUCKET_NAME,
      key,
      contentType: 'image/jpeg',
      bufferSize: buffer.length
    });

    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: 'image/jpeg',
          CacheControl: 'public, max-age=31536000', // Cache for 1 year
        })
      );
      console.log('S3 upload successful');
    } catch (s3Error) {
      console.error('S3 upload error details:', {
        error: s3Error,
        message: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error',
        stack: s3Error instanceof Error ? s3Error.stack : undefined,
        bucket: S3_BUCKET_NAME,
        key
      });
      throw s3Error;
    }

    const publicUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    console.log('Generated URL:', publicUrl);

    return NextResponse.json({ 
      success: true, 
      publicUrl,
      key,
      message: 'Logo uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to process upload'
      },
      { status: 500 }
    );
  }
} 