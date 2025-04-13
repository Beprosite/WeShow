import { S3_BASE_URL } from './storage';

// List of file extensions that must be stored in S3
export const S3_REQUIRED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.mp4', '.webm', '.mov', '.avi',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.zip', '.rar', '.7z'
];

// List of URL patterns that must be from S3
export const S3_REQUIRED_URL_PATTERNS = [
  /\/images\//,
  /\/videos\//,
  /\/documents\//,
  /\/media\//,
  /\/uploads\//,
  /\/files\//
];

// Function to check if a file must be stored in S3
export function mustUseS3(filename: string): boolean {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return S3_REQUIRED_EXTENSIONS.includes(extension);
}

// Function to check if a URL must be from S3
export function mustBeS3Url(url: string): boolean {
  return S3_REQUIRED_URL_PATTERNS.some(pattern => pattern.test(url));
}

// Function to validate S3 usage
export function validateS3Usage(filename: string, url: string): void {
  if (mustUseS3(filename) && !url.startsWith(S3_BASE_URL)) {
    throw new Error(
      `File ${filename} must be stored in AWS S3. Current URL: ${url}`
    );
  }
}

// Function to get S3 URL for a file
export function getS3Url(path: string): string {
  return `${S3_BASE_URL}/${path}`;
} 