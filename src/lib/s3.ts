import { PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, S3_BUCKET_NAME } from './aws-config';
import { S3Paths, generateUniqueFileName } from './s3-utils';

function getContentType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

export async function generateStudioLogoUploadURL(studioId: string, fileName: string): Promise<string> {
  const uniqueFileName = generateUniqueFileName(fileName);
  const key = S3Paths.studioLogo(studioId).getKey(uniqueFileName);
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: getContentType(fileName)
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300
    });
    console.log('Generated studio logo upload URL:', { studioId, fileName: uniqueFileName, key });
    return signedUrl;
  } catch (error) {
    console.error('Error generating studio logo upload URL:', error);
    throw new Error(`Failed to generate studio logo upload URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateClientLogoUploadURL(studioId: string, clientId: string, fileName: string): Promise<string> {
  const uniqueFileName = generateUniqueFileName(fileName);
  const key = S3Paths.clientLogo(studioId, clientId).getKey(uniqueFileName);
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: getContentType(fileName)
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300
    });
    console.log('Generated client logo upload URL:', { studioId, clientId, fileName: uniqueFileName, key });
    return signedUrl;
  } catch (error) {
    console.error('Error generating client logo upload URL:', error);
    throw new Error(`Failed to generate client logo upload URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateProjectFileUploadURL(
  studioId: string,
  clientId: string,
  projectId: string,
  fileName: string
): Promise<string> {
  const uniqueFileName = generateUniqueFileName(fileName);
  const key = S3Paths.projectContent(studioId, clientId, projectId).getKey(uniqueFileName);
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: getContentType(fileName)
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300
    });
    console.log('Generated project file upload URL:', { studioId, clientId, projectId, fileName: uniqueFileName, key });
    return signedUrl;
  } catch (error) {
    console.error('Error generating project file upload URL:', error);
    throw new Error(`Failed to generate project file upload URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateUploadURL(
  studioId: string,
  clientId: string,
  projectId: string,
  fileName: string
): Promise<string> {
  const key = `studios/${studioId}/clients/${clientId}/projects/${projectId}/${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: getContentType(fileName)
  });

  try {
    // Generate presigned URL valid for 5 minutes
    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300
    });
    console.log('Generated upload URL:', signedUrl);
    return signedUrl;
  } catch (error) {
    console.error('Error generating upload URL:', error);
    throw new Error(`Failed to generate upload URL: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateViewURL(
  studioId: string,
  clientId: string,
  projectId: string,
  fileName: string
): Promise<string> {
  const key = `studios/${studioId}/clients/${clientId}/projects/${projectId}/${fileName}`;
  
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    // Generate presigned URL valid for 1 hour
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating view URL:', error);
    throw new Error('Failed to generate view URL');
  }
}

export async function verifyLogoExists(fileName: string): Promise<boolean> {
  const key = `studio/logos/${fileName}`;
  
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error verifying logo:', error);
    return false;
  }
} 