import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET, S3_BASE_URL, MEDIA_CONFIG, FILE_PATHS, S3_SECURITY_HEADERS } from '@/config/storage';
import { v4 as uuidv4 } from 'uuid';

export class S3UploadError extends Error {
  constructor(message: string, public code: string = 'S3_UPLOAD_ERROR') {
    super(message);
    this.name = 'S3UploadError';
  }
}

export async function uploadToS3(
  file: File | Buffer,
  type: 'logo' | 'project' | 'avatar' | 'temp',
  originalName?: string
): Promise<string> {
  try {
    const fileBuffer = file instanceof File ? await file.arrayBuffer() : file;
    const buffer = Buffer.from(fileBuffer);
    
    // Validate file type and size
    if (file instanceof File) {
      if (!MEDIA_CONFIG.allowedTypes.includes(file.type)) {
        throw new S3UploadError(`Invalid file type: ${file.type}`, 'INVALID_FILE_TYPE');
      }
      
      const maxSize = file.type.startsWith('image/') 
        ? MEDIA_CONFIG.imageMaxSize 
        : MEDIA_CONFIG.videoMaxSize;
      
      if (file.size > maxSize) {
        throw new S3UploadError(`File size exceeds limit: ${file.size} bytes`, 'FILE_SIZE_EXCEEDED');
      }
    }

    // Generate unique filename
    const extension = originalName?.split('.').pop() || 'bin';
    const filename = `${uuidv4()}.${extension}`;
    const path = `${FILE_PATHS[type]}${filename}`;

    // Upload to S3 with security headers
    await s3Client.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: path,
        Body: buffer,
        ContentType: file instanceof File ? file.type : 'application/octet-stream',
        ...S3_SECURITY_HEADERS,
      })
    );

    return `${S3_BASE_URL}/${path}`;
  } catch (error) {
    if (error instanceof S3UploadError) {
      throw error;
    }
    throw new S3UploadError(
      error instanceof Error ? error.message : 'Failed to upload file to S3',
      'UPLOAD_FAILED'
    );
  }
}

export async function deleteFromS3(url: string): Promise<void> {
  try {
    const key = url.replace(`${S3_BASE_URL}/`, '');
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
      })
    );
  } catch (error) {
    throw new S3UploadError(
      error instanceof Error ? error.message : 'Failed to delete file from S3',
      'DELETE_FAILED'
    );
  }
} 