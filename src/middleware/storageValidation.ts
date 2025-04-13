import { NextApiRequest, NextApiResponse } from 'next';
import { S3_BASE_URL } from '@/config/storage';

interface FileUpload {
  name: string;
  data: Buffer;
  size: number;
  mimetype: string;
  url?: string;
}

interface ExtendedNextApiRequest extends NextApiRequest {
  files?: FileUpload | FileUpload[];
}

export class StorageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageValidationError';
  }
}

export function validateStorageUrl(url: string): void {
  if (!url.startsWith(S3_BASE_URL)) {
    throw new StorageValidationError(
      `Invalid storage URL. All files must be stored in AWS S3. Received: ${url}`
    );
  }
}

export function validateStorageMiddleware(
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  try {
    // Check for file uploads in the request
    if (req.files) {
      const files = Array.isArray(req.files) ? req.files : [req.files];
      for (const file of files) {
        if (file.url) {
          validateStorageUrl(file.url);
        }
      }
    }

    // Check for file URLs in the request body
    if (req.body) {
      const checkUrls = (obj: any) => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === 'string' && (key.includes('url') || key.includes('image') || key.includes('file'))) {
            validateStorageUrl(value);
          } else if (typeof value === 'object' && value !== null) {
            checkUrls(value);
          }
        }
      };
      checkUrls(req.body);
    }

    next();
  } catch (error) {
    if (error instanceof StorageValidationError) {
      return res.status(400).json({ error: error.message });
    }
    throw error;
  }
} 