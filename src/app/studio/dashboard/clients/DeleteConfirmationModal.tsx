'use client';

import React, { useState, useEffect } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  clientName: string;
  clientId: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  clientName,
  clientId
}) => {
  const [inputValue, setInputValue] = useState('');
  
  useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  const handleDelete = () => {
    // Get existing clients and projects from localStorage
    const existingClients = JSON.parse(localStorage.getItem('clients') || '[]');
    const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    // Get all projects for this client before deletion
    const clientProjects = existingProjects.filter((project: any) => project.clientId === clientId);
    
    // Clean up media files
    clientProjects.forEach((project: any) => {
      // Clean up hero photo URL if exists
      if (project.heroPhoto) {
        URL.revokeObjectURL(project.heroPhoto);
      }
      
      // Clean up video URLs if exist
      if (project.videos && project.videos.length > 0) {
        project.videos.forEach((video: any) => {
          if (video.url) {
            URL.revokeObjectURL(video.url);
          }
        });
      }
      
      // Clean up photo URLs if exist
      if (project.photos && project.photos.length > 0) {
        project.photos.forEach((photo: any) => {
          if (photo.url) {
            URL.revokeObjectURL(photo.url);
          }
        });
      }
    });

    // Clean up client logo if exists
    const client = existingClients.find((c: any) => c.id === clientId);
    if (client?.logo) {
      URL.revokeObjectURL(client.logo);
    }
    
    // Filter out the client and their projects
    const updatedClients = existingClients.filter((c: any) => c.id !== clientId);
    const updatedProjects = existingProjects.filter((p: any) => p.clientId !== clientId);
    
    // Update localStorage
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    
    // Call the onConfirm callback
    onConfirm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0A0A0A] rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-full">
            <RiErrorWarningLine className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-500">Delete Client</h3>
            <p className="mt-2 text-sm text-white/60">
              This will permanently delete <span className="text-white">{clientName}</span> and all associated data including:
            </p>
            <ul className="mt-2 text-sm text-white/60 list-disc list-inside space-y-1">
              <li>All project information</li>
              <li>All project media files</li>
              <li>Client logo and settings</li>
              <li>Project history and notes</li>
            </ul>
            <div className="mt-4">
              <label className="block text-sm text-white/60 mb-2">
                Type "Delete Client" to confirm
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-3 py-2 bg-black rounded border border-white/10 text-white focus:outline-none focus:border-white/20"
                placeholder="Delete Client"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/60 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={inputValue !== 'Delete Client'}
            className={`px-4 py-2 text-sm rounded-lg ${
              inputValue === 'Delete Client'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-red-500/10 text-red-500/50 cursor-not-allowed'
            }`}
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 