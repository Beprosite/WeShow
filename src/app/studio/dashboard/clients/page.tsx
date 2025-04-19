/**
 * Client Management Page
 * File: /admin/clients/page.tsx
 * 
 * This page handles all client management functionality including:
 * - Viewing all clients in a table layout
 * - Adding new clients with logo upload
 * - Editing existing clients and their logos
 * - Deleting clients
 * - Viewing and managing projects for each client
 */

'use client';

// =============================================================================
// IMPORTS
// =============================================================================
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Modal from '@/components/ui/Modal';
import { 
  RiAddLine, 
  RiEditLine, 
  RiDeleteBinLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiSearchLine,
  RiBuilding2Line,
  RiImageAddLine,
  RiImageEditLine,
  RiSettings4Line,
  RiMailLine,
  RiPhoneLine,
  RiLogoutBoxLine,
  RiGlobalLine,
  RiMoonLine,
  RiSunLine,
  RiCloseLine,
  RiHomeLine,
  RiArrowRightLine
} from 'react-icons/ri';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils/date';
import { slugify } from '@/lib/utils/slugify';
import Cookies from 'js-cookie';
import { MOCK_CLIENTS } from '@/lib/mockData';
import { useStudio } from '@/app/contexts/StudioContext';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================
interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  projectCount: number;
  status: 'active' | 'inactive';
  lastActive: string;
  projects: string[]; // Array of project IDs
  logo?: string; // Base64 encoded image or URL
  website?: string;
  urlSlug?: string; // Add URL slug field
  // New fields
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  businessType?: string;
  industry?: string;
  clientSince?: string;
  preferredContactMethod?: 'email' | 'phone' | 'both';
  notes?: string;
  history?: {
    date: string;
    event: string;
    description: string;
  }[];
}

interface Project {
  id: string;
  name: string;
  clientId: string;
  status: string;
  startDate: string;
  dueDate: string;
  budget: number;
  city: string;
  country: string;
  tags: string[];
}

interface ClientFormData {
  company: string;
  emails: string[];
  phone: string;
  website: string;
  logo: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (client: Client) => void;
}

interface StudioInfo {
  name: string;
  logo: string;
  plan: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================
const PROJECT_STATUSES = {
  'Materials Received': 'bg-gray-600',
  'In Progress': 'bg-blue-600/30 text-blue-400',
  'Pending Approval': 'bg-yellow-600/30 text-yellow-400',
  'In Review': 'bg-purple-600/30 text-purple-400',
  'Revisions': 'bg-orange-600/30 text-orange-400',
  'Completed': 'bg-green-600/30 text-green-400'
} as const;

// Add these mock data constants
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Luxury Villa Project',
    clientId: '1',
    status: 'In Progress',
    startDate: '2024-03-01',
    dueDate: '2024-04-01',
    budget: 5000,
    city: 'Tel Aviv',
    country: 'Israel',
    tags: ['Interior Rendering', 'Exterior Rendering', 'Lighting Study']
  },
  {
    id: '2',
    name: 'Modern Office Complex',
    clientId: '1',
    status: 'Pending Approval',
    startDate: '2024-03-15',
    dueDate: '2024-04-15',
    budget: 7500,
    city: 'Jerusalem',
    country: 'Israel',
    tags: ['3D Model', 'Floor Plan', 'Virtual Tour']
  },
  {
    id: '3',
    name: 'Residential Project',
    clientId: '2',
    status: 'Materials Received',
    startDate: '2024-03-20',
    dueDate: '2024-04-20',
    budget: 4000,
    city: 'Haifa',
    country: 'Israel',
    tags: ['Interior Rendering', 'Material Selection']
  }
];

// Add this constant for hero images
const MOCK_HERO_IMAGES = {
  '1': 'https://picsum.photos/800/400?random=1',
  '2': 'https://picsum.photos/800/400?random=2'
};

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * ImageUpload Component
 * Handles logo upload and preview functionality
 */
const ImageUpload = ({ 
  currentImage, 
  onImageChange,
  studioId 
}: { 
  currentImage?: string;
  onImageChange: (url: string, tempId?: string) => void;
  studioId: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Get studio ID from session if not provided
      let currentStudioId = studioId;
      if (!currentStudioId) {
        const response = await fetch('/api/studio/me');
        if (!response.ok) {
          throw new Error('Failed to get studio ID');
        }
        const data = await response.json();
        currentStudioId = data.studioId;
      }

      if (!currentStudioId) {
        throw new Error('No studio ID found');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('studioId', currentStudioId);
      formData.append('type', 'client-logo');
      formData.append('folder', 'clients');

      // Upload to S3 through our API endpoint
      const response = await fetch('/studio/api/upload/logo', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Upload error response:', errorData);
        throw new Error('Upload failed - Server error');
      }

      const data = await response.json();
      console.log('Upload response:', data);

      if (!data.success || !data.publicUrl) {
        console.error('Invalid response format:', data);
        throw new Error('Upload failed - Invalid response format');
      }

      onImageChange(data.publicUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Company logo" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <RiImageAddLine className="text-3xl" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="logo-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="logo-upload"
            className={`cursor-pointer inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? 'Uploading...' : currentImage ? 'Change Logo' : 'Upload Logo'}
          </label>
          {currentImage && !isUploading && (
            <button
              type="button"
              onClick={() => onImageChange('')}
              className="ml-2 px-4 py-2 text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Recommended: Square image, max 5MB
          </p>
          {uploadError && (
            <p className="text-xs text-red-400 mt-1">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * AddClientModal Component
 * Handles the creation of new clients
 */
const AddClientModal = ({ isOpen, onClose, onAdd }: AddClientModalProps) => {
  const [formData, setFormData] = useState<ClientFormData>({
    company: '',
    emails: [''],
    phone: '',
    website: '',
    logo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddEmail = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const handleRemoveEmail = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({
      ...prev,
      logo: url
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Create a new client object
      const newClient: Client = {
        id: Math.random().toString(36).substr(2, 9), // Temporary ID
        name: formData.company, // Using company name as name
        company: formData.company,
        email: formData.emails[0], // Using primary email
        phone: formData.phone,
        website: formData.website ? (formData.website.startsWith('http') ? formData.website : `https://${formData.website}`) : '',
        logo: formData.logo,
        projectCount: 0,
        status: 'active',
        lastActive: new Date().toISOString().split('T')[0],
        projects: [],
        urlSlug: slugify(formData.company) // Store URL slug
      };

      onAdd(newClient);
      onClose();
      setFormData({
        company: '',
        emails: [''],
        phone: '',
        website: '',
        logo: ''
      });
    } catch (err) {
      console.error('Error creating client:', err);
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Add New Client</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo Upload Section */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-gray-700 rounded-lg overflow-hidden">
                {formData.logo ? (
                  <img 
                    src={formData.logo} 
                    alt="Company logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <RiImageAddLine className="text-3xl" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Create a temporary URL for preview
                      const previewUrl = URL.createObjectURL(file);
                      handleLogoUpload(previewUrl);
                      
                      // Here you would typically upload to your server/S3
                      // For now, we're just using the preview URL
                    }
                  }}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {formData.logo ? 'Change Logo' : 'Upload Logo'}
                </label>
                {formData.logo && (
                  <button
                    type="button"
                    onClick={() => handleLogoUpload('')}
                    className="ml-2 px-4 py-2 text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Recommended: Square image, max 5MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Company Name</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm text-gray-400">Email Notifications</label>
              <button
                type="button"
                onClick={handleAddEmail}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <RiAddLine size={16} />
                Add Email
              </button>
            </div>
            <div className="space-y-2">
              {formData.emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required={index === 0}
                    placeholder={index === 0 ? "Primary Email" : "Additional Email"}
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(index)}
                      className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700/50"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Website (Optional)</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example.com"
            />
            <p className="text-xs text-gray-400 mt-1">Enter domain without https://</p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

const getStudioId = () => {
  // Get studio ID from cookies or local storage
  // This is a placeholder - implement actual logic to get studio ID
  return '1';
};

/**
 * EditClientModal Component
 * Handles the editing of existing clients
 */
const EditClientModal = ({ 
  isOpen, 
  onClose, 
  onEdit,
  client 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onEdit: (id: string, updatedClient: Client) => void;
  client: Client;
}) => {
  const [formData, setFormData] = useState({
    ...client,
    address: client.address || {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    businessType: client.businessType || '',
    industry: client.industry || '',
    clientSince: client.clientSince || new Date().toISOString().split('T')[0],
    preferredContactMethod: client.preferredContactMethod || 'both',
    notes: client.notes || '',
    history: client.history || []
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this client? This will also delete all associated projects.')) {
      // Get existing clients from localStorage
      const existingClients = JSON.parse(localStorage.getItem('clients') || '[]');
      
      // Filter out the client to be deleted
      const updatedClients = existingClients.filter((c: Client) => c.id !== client.id);
      
      // Update localStorage
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      
      // Close the modal
      onClose();
      
      // Refresh the page to show updated list
      window.location.reload();
    }
  };

  // Add escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit(client.id, formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0A0A0A] rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Edit Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload - Moved to top */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Company Logo</h3>
            <ImageUpload
              currentImage={formData.logo}
              onImageChange={(url) => setFormData({ ...formData, logo: url })}
              studioId="1"
            />
          </div>

          {/* Basic Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Website</label>
                <input
                  type="text"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="example.com"
                />
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Street Address</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value }
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">City</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, city: e.target.value }
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">State/Province</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value }
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Country</label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value }
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">ZIP/Postal Code</label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, zipCode: e.target.value }
                  })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Client Preferences Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Client Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Type of Business</label>
                <input
                  type="text"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Architecture Firm, Interior Design Studio"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Industry</label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Residential, Commercial, Hospitality"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Client Since</label>
                <input
                  type="date"
                  value={formData.clientSince}
                  onChange={(e) => setFormData({ ...formData, clientSince: e.target.value })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Preferred Contact Method</label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value as 'email' | 'phone' | 'both' })}
                  className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="both">Both Email & Phone</option>
                  <option value="email">Email Only</option>
                  <option value="phone">Phone Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes & History Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Notes & History</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Add any important notes about the client..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Client History</label>
              <div className="space-y-2">
                {formData.history.map((entry, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="date"
                      value={entry.date}
                      onChange={(e) => {
                        const newHistory = [...formData.history];
                        newHistory[index] = { ...entry, date: e.target.value };
                        setFormData({ ...formData, history: newHistory });
                      }}
                      className="bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={entry.event}
                      onChange={(e) => {
                        const newHistory = [...formData.history];
                        newHistory[index] = { ...entry, event: e.target.value };
                        setFormData({ ...formData, history: newHistory });
                      }}
                      className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Event"
                    />
                    <input
                      type="text"
                      value={entry.description}
                      onChange={(e) => {
                        const newHistory = [...formData.history];
                        newHistory[index] = { ...entry, description: e.target.value };
                        setFormData({ ...formData, history: newHistory });
                      }}
                      className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Description"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          history: formData.history.filter((_, i) => i !== index)
                        });
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <RiDeleteBinLine size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      history: [
                        ...formData.history,
                        {
                          date: new Date().toISOString().split('T')[0],
                          event: '',
                          description: ''
                        }
                      ]
                    });
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <RiAddLine size={16} />
                  Add History Entry
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <div className="mr-auto">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this client? This action cannot be undone and will delete all associated projects.')) {
                    // Get existing clients from localStorage
                    const existingClients = JSON.parse(localStorage.getItem('clients') || '[]');
                    
                    // Filter out the client to be deleted
                    const updatedClients = existingClients.filter((c: Client) => c.id !== client.id);
                    
                    // Update localStorage
                    localStorage.setItem('clients', JSON.stringify(updatedClients));
                    
                    // Close the modal
                    onClose();
                    
                    // Refresh the page to show updated list
                    window.location.reload();
                  }
                }}
                className="px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-red-500/20 text-red-500 text-xs transition-all duration-300 flex items-center gap-1"
              >
                <RiDeleteBinLine size={12} />
                Delete Client
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * ClientsPage Component
 * Main component for the clients management page
 */
const ClientsPage = () => {
  const router = useRouter();
  const { studioData } = useStudio();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [formData, setFormData] = useState<{
    company: string;
    email: string;
    phone: string;
    website: string;
    logo: string;
  }>({
    company: '',
    email: '',
    phone: '',
    website: '',
    logo: ''
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ firstName: string; isNew: boolean } | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const savedClients = localStorage.getItem('clients');
        const clients = savedClients ? JSON.parse(savedClients) : MOCK_CLIENTS;
        setClients(clients);
      } catch (error) {
        console.error('Error loading clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  useEffect(() => {
    // Check for new user data in localStorage
    const storedNewUser = localStorage.getItem('newUser');
    if (storedNewUser) {
      setNewUser(JSON.parse(storedNewUser));
      // Clear the new user flag after showing the message
      localStorage.removeItem('newUser');
    }
  }, []);

  const handleAddClient = async (newClient: Client) => {
    try {
      const urlFriendlyId = slugify(newClient.company);
      const clientWithId = {
        ...newClient,
        id: urlFriendlyId,
        name: newClient.company,
        urlSlug: urlFriendlyId
      };

      const updatedClients = [...clients, clientWithId];
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      setClients(updatedClients);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleEditClient = (id: string, updatedClient: Client) => {
    const updatedClients = clients.map(client => 
      client.id === id ? { ...client, ...updatedClient } : client
    );
    localStorage.setItem('clients', JSON.stringify(updatedClients));
    setClients(updatedClients);
    setEditingClient(null);
  };

  const handleCardClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (!target.closest('.edit-button')) {
      router.push(`/studio/dashboard/clients/${client.id}`);
    }
  };

  const filteredClients = clients.filter(client => 
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.phone && client.phone.includes(searchQuery))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Header Section */}
      <div className={`relative border-b ${
        isDarkMode ? 'border-white/10' : 'border-black/10'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {studioData?.logo && (
                <div className={`w-16 h-16 rounded-full overflow-hidden border ${
                  isDarkMode ? 'border-white/10 bg-[#0A0A0A]' : 'border-black/10 bg-gray-100'
                }`}>
                  <Image
                    src={studioData.logo}
                    alt={studioData.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h1 className="text-3xl font-light">{studioData?.name}</h1>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/studio/settings')}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <RiSettings4Line size={20} />
              </button>
              <button
                onClick={() => {
                  Cookies.remove('studio_token');
                  // Clear any other potential auth data
                  localStorage.clear();
                  sessionStorage.clear();
                  // Force a hard redirect to ensure complete logout
                  window.location.href = 'http://localhost:3000/studio/auth/login';
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors text-sm"
              >
                <RiLogoutBoxLine size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-white/60 mt-6">
            <Link href="/studio/dashboard" className="hover:text-white transition-colors">
              <RiHomeLine className="w-4 h-4" />
            </Link>
            <RiArrowRightLine className="w-4 h-4 mx-2" />
            <span className="text-white">Clients</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              className="pl-9 pr-4 py-1.5 bg-transparent border border-white/10 rounded text-white/60 focus:outline-none focus:border-white/20 w-56 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={14} />
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs"
          >
            <RiAddLine size={12} />
            <span>Add Client</span>
          </button>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              onClick={(e) => handleCardClick(e, client)}
              className="group relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="bg-gradient-to-b from-[#0A0A0A] to-black border border-white/10 p-6 relative">
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content Container */}
                <div className="relative z-10 flex flex-col h-full">
                  {/* Top Section with Info and Logo */}
                  <div className="flex justify-between items-start">
                    {/* Client Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-light group-hover:text-white transition-colors">
                          {client.company}
                        </h3>
                      </div>
                      <div className="space-y-1 text-xs text-white/60">
                        <p>{client.email}</p>
                        <p>{client.phone}</p>
                      </div>
                    </div>

                    {/* Client Logo */}
                    <div>
                      <div className="relative group/logo">
                        {client.logo ? (
                          <div className="relative w-20 h-20 rounded-full overflow-hidden border border-white/10">
                            <Image
                              src={client.logo}
                              alt={client.company}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                            {/* Edit Overlay */}
                            <div 
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingClient(client);
                              }}
                            >
                              <RiImageEditLine size={20} className="text-white/80" />
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-20 h-20 rounded-full bg-[#0A0A0A] flex items-center justify-center border border-white/10">
                            <span className="text-3xl font-light">{client.company.charAt(0)}</span>
                            {/* Edit Overlay */}
                            <div 
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingClient(client);
                              }}
                            >
                              <RiImageEditLine size={20} className="text-white/80" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Section with Project Count and Last Update */}
                  <div className="flex justify-between items-center mt-auto pt-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40">
                        {client.projectCount} {client.projectCount === 1 ? 'Project' : 'Projects'}
                      </span>
                      <button
                        className="p-1 text-white/40 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingClient(client);
                        }}
                      >
                        <RiSettings4Line size={14} />
                      </button>
                    </div>
                    <span className="text-xs text-white/40">
                      Last Update: {new Date(client.lastActive).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-20 relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
            <div className="border border-white/10 py-20 bg-gradient-to-b from-[#0A0A0A] to-black">
              <p className="text-white/40 text-lg">
                {searchQuery ? 'No clients found matching your search' : 'No clients added yet'}
              </p>
            </div>
          </div>
        )}

        {/* Add Client Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto">
            <div className="relative w-full max-w-xl my-16 mx-4">
              <div className="relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
                <div className="bg-gradient-to-b from-[#1A1A1A] to-black border border-white/10 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-light">Add New Client</h2>
                    <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <RiAddLine className="rotate-45" />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const newClient: Client = {
                      id: '',
                      name: formData.get('company') as string,
                      company: formData.get('company') as string,
                      email: formData.get('email') as string,
                      phone: formData.get('phone') as string,
                      projectCount: 0,
                      status: 'active',
                      lastActive: new Date().toISOString(),
                      projects: [],
                      logo: '',
                      website: formData.get('website') as string
                    };
                    handleAddClient(newClient);
                  }} className="space-y-4">
                    {/* Logo Upload Section */}
                    <div className="space-y-3">
                      <h3 className="text-base font-light text-white/80">Company Logo</h3>
                      <ImageUpload
                        currentImage={formData.logo}
                        onImageChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                        studioId={getStudioId()}
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-white/40 mb-1.5">Company Name</label>
                        <input
                          type="text"
                          name="company"
                          required
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/40 mb-1.5">Email</label>
                        <input
                          type="email"
                          name="email"
                          required
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/40 mb-1.5">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/40 mb-1.5">Website (Optional)</label>
                        <input
                          type="text"
                          name="website"
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs"
                      >
                        Add Client
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {editingClient && (
          <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 overflow-y-auto">
            <div className="relative w-full max-w-xl my-16 mx-4">
              <div className="relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
                <div className="bg-gradient-to-b from-[#0A0A0A] to-black border border-white/10 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-light">Edit Client</h2>
                    <button
                      onClick={() => setEditingClient(null)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <RiAddLine className="rotate-45" />
                    </button>
                  </div>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (!editingClient) return;
                    
                    const formData = new FormData(e.currentTarget);
                    const updatedClient = {
                      ...editingClient,
                      name: formData.get('company') as string,
                      company: formData.get('company') as string,
                      email: formData.get('email') as string,
                      phone: formData.get('phone') as string,
                      website: formData.get('website') as string
                    };
                    handleEditClient(editingClient.id, updatedClient);
                  }} className="space-y-4">
                    {/* Logo Upload Section */}
                    <div className="space-y-3">
                      <h3 className="text-base font-light text-white/80">Company Logo</h3>
                      <ImageUpload
                        currentImage={editingClient.logo}
                        onImageChange={(url) => {
                          if (!editingClient) return;
                          handleEditClient(editingClient.id, { ...editingClient, logo: url });
                        }}
                        studioId={getStudioId()}
                      />
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-white/40 mb-1.5">Company Name</label>
                        <input
                          type="text"
                          name="company"
                          defaultValue={editingClient.company}
                          required
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/40 mb-1.5">Email</label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={editingClient.email}
                          required
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/40 mb-1.5">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          defaultValue={editingClient.phone}
                          required
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/40 mb-1.5">Website (Optional)</label>
                        <input
                          type="text"
                          name="website"
                          defaultValue={editingClient.website}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                      <div className="mr-auto">
                        <button
                          type="button"
                          onClick={() => setIsDeleteModalOpen(true)}
                          className="px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-red-500/20 text-red-500 text-xs transition-all duration-300 flex items-center gap-1"
                        >
                          <RiDeleteBinLine size={12} />
                          Delete Client
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingClient(null)}
                        className="px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            setIsDeleteModalOpen(false);
            setEditingClient(null);
            // Refresh the page to show updated list
            window.location.reload();
          }}
          clientName={editingClient?.company || ''}
          clientId={editingClient?.id || ''}
        />

        {/* Welcome Message */}
        <AnimatePresence>
          {newUser?.isNew && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-[#00A3FF]/10 backdrop-blur-sm border border-[#00A3FF]/30 rounded-lg p-6 mb-8"
            >
              <h1 className="text-2xl font-light text-white mb-4">
                Welcome to WeShow, {newUser.firstName}! 👋
              </h1>
              <p className="text-white/60">
                Get started by adding your first client. We'll help you manage your projects and keep everything organized.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ClientsPage;