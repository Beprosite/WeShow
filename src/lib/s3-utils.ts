/**
 * S3 Utility Functions
 * Contains helper functions for S3 operations
 */

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

/**
 * Generates a unique filename for S3 uploads
 * @param originalName - The original name of the file
 * @returns A unique filename with timestamp and random string
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${random}.${extension}`;
}

/**
 * Validates if a file is an image
 * @param fileType - The MIME type of the file
 * @returns boolean indicating if the file is an image
 */
export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/');
}

/**
 * Formats file size to human readable format
 * @param bytes - The size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Validates file size
 * @param fileSize - The size in bytes
 * @param maxSize - Maximum allowed size in bytes (default: 5MB)
 * @returns boolean indicating if the file size is valid
 */
export function isValidFileSize(fileSize: number, maxSize: number = 5 * 1024 * 1024): boolean {
  return fileSize <= maxSize;
}

/**
 * Generates a clean filename by removing special characters
 * @param fileName - The original filename
 * @returns Sanitized filename
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getS3PublicUrl(key: string): string {
  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

export function extractFileNameFromKey(key: string): string {
  return key.split('/').pop() || '';
} 