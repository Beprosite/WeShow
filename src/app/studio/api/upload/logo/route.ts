import { NextResponse } from 'next/server';
import { S3_BUCKET_NAME, s3Client } from '../../../../../lib/aws-config';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: Request) {
  console.log('Received logo upload request');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !(file instanceof Blob)) {
      console.log('No valid file provided');
      return NextResponse.json(
        { success: false, message: 'No file provided' },
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
      size: fileSize
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
    const extension = fileName.split('.').pop();
    const uniqueFileName = `${timestamp}-${random}.${extension}`;
    const key = `registration/logos/${uniqueFileName}`;

    console.log('Uploading to S3:', {
      bucket: S3_BUCKET_NAME,
      key,
      contentType: fileType
    });

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: fileType,
      CacheControl: 'max-age=31536000' // 1 year cache
    });

    try {
      await s3Client.send(command);
    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      return NextResponse.json(
        { 
          success: false, 
          message: uploadError instanceof Error ? uploadError.message : 'Failed to upload to S3'
        },
        { status: 500 }
      );
    }

    const publicUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    
    console.log('Upload successful:', {
      publicUrl
    });

    return NextResponse.json({
      success: true,
      publicUrl,
      key
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to upload logo'
      },
      { status: 500 }
    );
  }
} 