'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { RiUploadCloud2Line, RiCheckLine, RiErrorWarningLine } from 'react-icons/ri';
import { uploadToS3 } from '@/utils/s3Upload';
import { mustUseS3, validateS3Usage } from '@/config/storageRules';
import { formatFileSize, isValidFileSize } from '@/lib/s3-utils';

interface FileUploadProps {
  onUpload: (url: string) => void;
  onError?: (error: string) => void;
  acceptedFileTypes?: string[];
  maxSize?: number; // in bytes
  className?: string;
  uploadType?: 'logo' | 'project' | 'avatar' | 'temp';
}

export default function FileUpload({
  onUpload,
  onError,
  acceptedFileTypes = ['image/*', 'video/*', 'application/pdf'],
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = '',
  uploadType = 'project'
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      // Validate file type
      if (!mustUseS3(file.name)) {
        throw new Error('This file type must be stored in S3');
      }

      // Validate file size
      if (!isValidFileSize(file.size, maxSize)) {
        throw new Error(`File size must be less than ${formatFileSize(maxSize)}`);
      }

      setUploading(true);
      setError(null);

      // Upload to S3
      const url = await uploadToS3(file, uploadType, file.name);
      
      // Validate the returned URL
      validateS3Usage(file.name, url);
      
      onUpload(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [onUpload, onError, maxSize, uploadType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false
  });

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6
          ${isDragActive ? 'border-blue-400 bg-blue-900/20' : 'border-gray-700'}
          ${error ? 'border-red-400 bg-red-900/20' : ''}
          transition-colors duration-200
          cursor-pointer
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4">
          {uploading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <RiUploadCloud2Line className="w-12 h-12 text-blue-400" />
            </motion.div>
          ) : error ? (
            <RiErrorWarningLine className="w-12 h-12 text-red-400" />
          ) : (
            <RiUploadCloud2Line className="w-12 h-12 text-gray-400" />
          )}
          
          <div className="text-center">
            {uploading ? (
              <p className="text-blue-400">Uploading...</p>
            ) : error ? (
              <p className="text-red-400">{error}</p>
            ) : isDragActive ? (
              <p className="text-blue-400">Drop the file here</p>
            ) : (
              <>
                <p className="text-gray-300">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Max size: {formatFileSize(maxSize)}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 