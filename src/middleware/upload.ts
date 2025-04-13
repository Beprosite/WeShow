import { NextApiRequest, NextApiResponse } from 'next';
import { uploadToS3 } from '@/utils/s3Upload';
import { MEDIA_CONFIG } from '@/config/storage';

interface FileUpload {
  name: string;
  data: Buffer;
  size: number;
  mimetype: string;
}

interface ExtendedNextApiRequest extends NextApiRequest {
  files?: FileUpload | FileUpload[];
}

export const uploadMiddleware = async (
  req: ExtendedNextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    const uploadedFiles: string[] = [];
    const files = Array.isArray(req.files) ? req.files : [req.files];

    for (const file of files) {
      // Validate file type and size
      if (!MEDIA_CONFIG.allowedTypes.includes(file.mimetype)) {
        throw new Error(`Invalid file type: ${file.mimetype}`);
      }

      const maxSize = file.mimetype.startsWith('image/')
        ? MEDIA_CONFIG.imageMaxSize
        : MEDIA_CONFIG.videoMaxSize;

      if (file.size > maxSize) {
        throw new Error(`File size exceeds limit: ${file.name}`);
      }

      // Upload to S3
      const url = await uploadToS3(file.data, 'project', file.name);
      uploadedFiles.push(url);
    }

    req.body.uploadedFiles = uploadedFiles;
    next();
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload files' });
  }
}; 