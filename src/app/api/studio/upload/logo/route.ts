import { NextResponse } from 'next/server';
import { S3_BUCKET_NAME, s3Client } from '@/lib/aws-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  console.log('Received logo upload request');
  
  try {
    // Validate AWS configuration
    if (!S3_BUCKET_NAME) {
      console.error('AWS_BUCKET_NAME is not configured');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const registrationId = formData.get('registrationId') as string;
    
    if (!file || !(file instanceof Blob)) {
      console.log('No valid file provided');
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    if (!registrationId) {
      console.log('No registration ID provided');
      return NextResponse.json(
        { success: false, message: 'No registration ID provided' },
        { status: 400 }
      );
    }

    // Get file details
    const buffer = await file.arrayBuffer();
    const fileName = 'name' in file ? file.name : 'logo.jpg';
    const fileType = file.type;
    const fileSize = buffer.byteLength;

    console.log('Processing file:', {
      name: fileName,
      type: fileType,
      size: fileSize,
      registrationId
    });

    // Validate file type
    if (!fileType.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload an image.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    if (fileSize > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = fileName.split('.').pop() || 'jpg';
    const uniqueFileName = `${timestamp}-${random}.${extension}`;
    const key = `temp/registrations/${registrationId}/logo/${uniqueFileName}`;

    console.log('Preparing S3 upload:', {
      bucket: S3_BUCKET_NAME,
      key,
      contentType: fileType,
      registrationId,
      fileSize
    });

    try {
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: fileType,
        CacheControl: 'max-age=31536000' // 1 year cache
      });

      console.log('Sending S3 command...');
      await s3Client.send(command);
      console.log('Successfully uploaded to S3');

      // Construct the public URL using virtual-hosted style
      const publicUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
      console.log('Generated public URL:', publicUrl);
      
      return NextResponse.json({
        success: true,
        message: 'Logo uploaded successfully',
        publicUrl,
        key,
        registrationId
      });
    } catch (s3Error) {
      console.error('S3 upload error details:', {
        error: s3Error,
        message: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error',
        code: (s3Error as any)?.Code,
        requestId: (s3Error as any)?.RequestId
      });
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to upload to storage',
          details: s3Error instanceof Error ? s3Error.message : 'Unknown S3 error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to upload logo',
        details: 'Check server logs for more information'
      },
      { status: 500 }
    );
  }
} 