import { S3Client, ObjectCannedACL } from '@aws-sdk/client-s3';

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_AWS_ACCESS_KEY_ID',
  'NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY',
  'NEXT_PUBLIC_AWS_REGION',
  'NEXT_PUBLIC_AWS_BUCKET_NAME'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  },
});

export const S3_BUCKET = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
export const S3_BASE_URL = `https://${S3_BUCKET}.s3.amazonaws.com`;

// Media file types and size limits
export const MEDIA_CONFIG = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
  maxSize: 100 * 1024 * 1024, // 100MB
  imageMaxSize: 10 * 1024 * 1024, // 10MB
  videoMaxSize: 100 * 1024 * 1024, // 100MB
};

// File paths structure
export const FILE_PATHS = {
  logos: 'logos/',
  projectMedia: 'projects/',
  userAvatars: 'avatars/',
  temporary: 'temp/',
};

// Security headers for S3 uploads
export const S3_SECURITY_HEADERS = {
  ACL: 'public-read' as ObjectCannedACL,
  CacheControl: 'max-age=31536000',
  ContentDisposition: 'inline',
}; 