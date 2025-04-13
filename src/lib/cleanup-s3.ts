import { config } from 'dotenv';
import { resolve } from 'path';
import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { S3Client } from '@aws-sdk/client-s3';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true
});

const S3_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'my-project-manager-studio-content-dev';

async function cleanupBucket() {
  try {
    console.log('Starting cleanup with bucket:', S3_BUCKET_NAME);
    console.log('AWS Config:', {
      region: process.env.AWS_REGION,
      bucketName: process.env.AWS_BUCKET_NAME,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
    
    // List all objects in the bucket
    console.log('Listing objects in bucket...');
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME
    });

    const { Contents } = await s3Client.send(listCommand);
    console.log('Current bucket contents:', Contents?.map(c => c.Key));
    
    if (Contents && Contents.length > 0) {
      console.log('Deleting existing objects...');
      // Delete all existing objects
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: S3_BUCKET_NAME,
        Delete: {
          Objects: Contents.map(({ Key }) => ({ Key }))
        }
      });

      await s3Client.send(deleteCommand);
      console.log('Successfully deleted all existing objects');
    } else {
      console.log('No existing objects found in bucket');
    }

    // Create base folder structure
    console.log('Creating registration logos folder...');
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: 'registration/logos/.keep',
      Body: '' // Empty content
    });

    await s3Client.send(command);
    console.log('Successfully created registration logos folder');

    return true;
  } catch (error) {
    console.error('Error during cleanup:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}

async function main() {
  console.log('Starting S3 bucket cleanup...');
  try {
    await cleanupBucket();
    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
}

main(); 