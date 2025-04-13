import { DeleteObjectsCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, S3_BUCKET_NAME } from './aws-config';

export async function cleanupBucket() {
  try {
    // List all objects in the bucket
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME
    });

    const { Contents } = await s3Client.send(listCommand);
    
    if (Contents && Contents.length > 0) {
      // Delete all existing objects
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: S3_BUCKET_NAME,
        Delete: {
          Objects: Contents.map(({ Key }) => ({ Key }))
        }
      });

      await s3Client.send(deleteCommand);
      console.log('Successfully deleted all existing objects');
    }

    // Create placeholder objects to establish folder structure
    const folderStructure = [
      'studios/.keep',  // Root studios folder
    ];

    // Create empty objects to establish the folder structure
    for (const folder of folderStructure) {
      const command = new PutObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: folder,
        Body: '' // Empty content
      });

      await s3Client.send(command);
    }

    console.log('Successfully initialized new folder structure');
    return true;
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
} 