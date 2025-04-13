import { S3Client } from '@aws-sdk/client-s3';

// Debug logging
console.log('AWS Config:', {
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_BUCKET_NAME,
  hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
});

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true
});

export const S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'my-project-manager-studio-content-dev'; 