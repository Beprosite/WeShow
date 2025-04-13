import { S3_BUCKET_NAME } from './aws-config';

export const S3Paths = {
  studioLogo: (studioId: string) => ({
    folder: `studios/${studioId}/logo`,
    getKey: (fileName: string) => `studios/${studioId}/logo/${fileName}`
  }),
  
  registrationLogo: () => ({
    folder: `registration/logos`,
    getKey: (fileName: string) => `registration/logos/${fileName}`
  }),
  
  clientLogo: (studioId: string, clientId: string) => ({
    folder: `studios/${studioId}/clients/${clientId}/logo`,
    getKey: (fileName: string) => `studios/${studioId}/clients/${clientId}/logo/${fileName}`
  }),
  
  projectContent: (studioId: string, clientId: string, projectId: string) => ({
    folder: `studios/${studioId}/clients/${clientId}/projects/${projectId}/content`,
    getKey: (fileName: string) => `studios/${studioId}/clients/${clientId}/projects/${projectId}/content/${fileName}`
  })
};

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

export function getS3PublicUrl(key: string): string {
  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

export function extractFileNameFromKey(key: string): string {
  return key.split('/').pop() || '';
} 