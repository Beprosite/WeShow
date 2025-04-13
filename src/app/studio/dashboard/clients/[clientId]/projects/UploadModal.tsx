import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Project } from '@/types';
import { RiCloseLine, RiUploadCloud2Line, RiImageLine, RiVideoLine, RiDeleteBinLine } from 'react-icons/ri';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onUpload: (files: File[]) => void;
}

export default function UploadModal({ isOpen, onClose, project, onUpload }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'video/*': ['.mp4', '.mov', '.avi']
    }
  });

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!files.length) return;

    try {
      // Simulate upload progress
      for (const file of files) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (progress <= 100) {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: progress
            }));
          } else {
            clearInterval(interval);
          }
        }, 200);
      }

      // Call the onUpload callback with the files
      onUpload(files);

      // Clear the files after successful upload
      setFiles([]);
      setUploadProgress({});
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <RiCloseLine size={24} />
        </button>

        <h2 className="text-xl font-semibold text-white mb-6">Upload Files</h2>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg transition-colors p-8 text-center cursor-pointer mb-6
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
          `}
        >
          <input {...getInputProps()} />
          <RiUploadCloud2Line className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-400">
            {isDragActive
              ? "Drop files here..."
              : "Drag & drop files here, or click to select"}
          </p>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="space-y-4 mb-6">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-800 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {file.type.startsWith('image/') ? (
                    <RiImageLine className="text-blue-400" size={24} />
                  ) : (
                    <RiVideoLine className="text-purple-400" size={24} />
                  )}
                  <div>
                    <p className="text-white text-sm">{file.name}</p>
                    <p className="text-gray-400 text-xs">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {uploadProgress[file.name] !== undefined && (
                    <div className="w-20 bg-gray-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  )}
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <RiDeleteBinLine size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Files
          </button>
        </div>
      </div>
    </div>
  );
} 