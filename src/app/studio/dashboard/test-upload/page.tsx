'use client';

import React, { useState } from 'react';

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;
    setError(null);

    try {
      setStatus('Getting upload URL...');
      
      const urlResponse = await fetch('/api/studio/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: 'test-studio',
          clientId: 'test-client',
          projectId: 'test-project',
          fileName: file.name
        })
      });

      const responseData = await urlResponse.json();
      console.log('API Response:', responseData);

      if (!urlResponse.ok || !responseData.uploadUrl) {
        throw new Error(`Failed to get upload URL: ${JSON.stringify(responseData)}`);
      }

      setStatus('Uploading file...');
      
      // Upload the file
      const uploadResponse = await fetch(responseData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload response:', errorText);
        throw new Error('Upload failed');
      }

      setStatus('Upload successful!');
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('Upload failed');
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test AWS Upload</h1>
      
      <div className="space-y-4">
        <div>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block mb-2"
          />
          {file && (
            <div className="text-sm text-gray-600">
              Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
        
        <button
          onClick={handleUpload}
          disabled={!file}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Upload File
        </button>

        {status && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            Status: {status}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded whitespace-pre-wrap">
            {error}
          </div>
        )}
      </div>
    </main>
  );
} 