import { S3Client } from '@aws-sdk/client-s3';

// Validate required environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_BUCKET_NAME'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Debug logging
console.log('AWS Config Initialization:', {
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_BUCKET_NAME,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...',
  hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
});

// Create S3 client with specific configuration
export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false // Changed to false for virtual-hosted style URLs
});

export const S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

// Log successful client creation
console.log('S3 client created successfully'); 