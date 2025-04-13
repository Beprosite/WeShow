import { NextApiHandler } from 'next';
import { validateStorageMiddleware } from './storageValidation';

export function withStorageValidation(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    try {
      await new Promise((resolve, reject) => {
        validateStorageMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve(undefined);
        });
      });
      return handler(req, res);
    } catch (error) {
      console.error('Storage validation error:', error);
      return res.status(400).json({ error: 'Invalid storage configuration' });
    }
  };
} 