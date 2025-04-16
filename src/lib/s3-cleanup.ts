import { S3Client, ListObjectsV2Command, DeleteObjectsCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3_BUCKET_NAME } from './aws-config';

const s3Client = new S3Client({});

export async function cleanupRegistrationFiles(registrationId: string) {
  try {
    // List all objects in the registration's temp folder
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: `temp/registrations/${registrationId}/`
    });

    const listResult = await s3Client.send(listCommand);
    
    if (!listResult.Contents || listResult.Contents.length === 0) {
      return;
    }

    // Prepare objects for deletion
    const objectsToDelete = listResult.Contents.map(obj => ({
      Key: obj.Key!
    }));

    // Delete all objects
    const deleteCommand = new DeleteObjectsCommand({
      Bucket: S3_BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete
      }
    });

    await s3Client.send(deleteCommand);
    console.log(`Cleaned up temporary files for registration ${registrationId}`);
  } catch (error) {
    console.error('Error cleaning up registration files:', error);
    throw error;
  }
}

export async function moveRegistrationToStudio(registrationId: string, studioId: string) {
  try {
    // List all objects in the registration's temp folder
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: `temp/registrations/${registrationId}/`
    });

    const listResult = await s3Client.send(listCommand);
    
    if (!listResult.Contents || listResult.Contents.length === 0) {
      return;
    }

    // Move each file to the studio's permanent location
    for (const obj of listResult.Contents) {
      const oldKey = obj.Key!;
      const newKey = oldKey.replace(
        `temp/registrations/${registrationId}/`,
        `studios/${studioId}/`
      );

      // Copy to new location
      await s3Client.send(new CopyObjectCommand({
        Bucket: S3_BUCKET_NAME,
        CopySource: `${S3_BUCKET_NAME}/${oldKey}`,
        Key: newKey
      }));

      // Delete from old location
      await s3Client.send(new DeleteObjectCommand({
        Bucket: S3_BUCKET_NAME,
        Key: oldKey
      }));
    }

    console.log(`Moved registration files to studio ${studioId}`);
  } catch (error) {
    console.error('Error moving registration files:', error);
    throw error;
  }
} 