'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiUploadCloud2Line, RiFileList3Line, RiCloseLine } from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function UploadProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const studioToken = Cookies.get('studio_token');
      if (!studioToken) {
        router.push('/studio/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/studio/me', {
          headers: {
            'Authorization': `Bearer ${studioToken}`,
          },
          credentials: 'include'
        });

        if (!response.ok) {
          Cookies.remove('studio_token');
          router.push('/studio/auth/login');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/studio/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const handleDrop = async (acceptedFiles: File[]) => {
    const studioToken = Cookies.get('studio_token');
    if (!studioToken) {
      setError('Please log in to upload files');
      router.push('/studio/auth/login');
      return;
    }

    setFiles(acceptedFiles);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length) return;

    const studioToken = Cookies.get('studio_token');
    if (!studioToken) {
      setError('Please log in to upload files');
      router.push('/studio/auth/login');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/studio/me', {
        headers: {
          'Authorization': `Bearer ${studioToken}`,
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to get studio information');
      }

      const studioData = await response.json();
      
      for (const file of files) {
        // Get upload URL from our API
        const uploadResponse = await fetch('/api/studio/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studioToken}`
          },
          body: JSON.stringify({
            studioId: studioData.id,
            clientId: 'temp-client-id', // TODO: Get from URL params
            projectId: 'temp-project-id', // TODO: Get from URL params
            fileName: file.name,
          }),
          credentials: 'include'
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl } = await uploadResponse.json();

        // Upload to S3
        const uploadResult = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResult.ok) {
          throw new Error('Failed to upload file');
        }

        // Update progress
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100,
        }));
      }

      // Clear files after successful upload
      setFiles([]);
      setUploadProgress({});
      
      // TODO: Redirect to project page or show success message
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Upload Project Files</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <RiUploadCloud2Line className="text-4xl text-gray-400 mb-2" />
          <span className="text-gray-600">
            Click to upload or drag and drop files here
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Selected Files</h2>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded"
              >
                <div className="flex items-center">
                  <RiFileList3Line className="text-gray-500 mr-2" />
                  <span>{file.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <RiCloseLine />
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}
    </div>
  );
} 