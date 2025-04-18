import { prisma } from './prisma';
import { PLAN_LIMITS } from './plans';

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if a studio has enough storage space for a new file
 * @param studioId - The ID of the studio
 * @param fileSize - The size of the file to be uploaded in bytes
 * @returns Promise<boolean> - True if the studio has enough space
 * @throws StorageError if the studio doesn't have enough space or other errors occur
 */
export async function checkStorageLimit(studioId: string, fileSize: number): Promise<boolean> {
  try {
    // Get studio's current storage usage and tier
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      select: {
        storageUsed: true,
        subscriptionTier: true
      }
    });

    if (!studio) {
      throw new StorageError('Studio not found');
    }

    // Get the storage limit for the studio's tier
    const tierLimits = PLAN_LIMITS[studio.subscriptionTier as keyof typeof PLAN_LIMITS];
    if (!tierLimits) {
      throw new StorageError('Invalid subscription tier');
    }

    const storageLimit = tierLimits.storageLimit;
    const currentUsage = Number(studio.storageUsed);
    const wouldUse = currentUsage + fileSize;

    // Check if the upload would exceed the limit
    if (wouldUse > storageLimit) {
      const remainingSpace = Math.max(0, storageLimit - currentUsage);
      throw new StorageError(
        `Storage limit exceeded. You have ${formatBytes(remainingSpace)} remaining, ` +
        `but the file is ${formatBytes(fileSize)}.`
      );
    }

    return true;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError(`Failed to check storage limit: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update a studio's storage usage
 * @param studioId - The ID of the studio
 * @param bytesChange - The change in bytes (positive for additions, negative for deletions)
 */
export async function updateStorageUsed(studioId: string, bytesChange: number): Promise<void> {
  try {
    await prisma.studio.update({
      where: { id: studioId },
      data: {
        storageUsed: {
          increment: bytesChange
        }
      }
    });
  } catch (error) {
    console.error('Failed to update storage usage:', error);
    // Don't throw here - we don't want to break the upload if the tracking fails
  }
}

/**
 * Format bytes into a human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 