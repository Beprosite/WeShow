'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiUpload, FiX } from 'react-icons/fi';
import { RiCloseLine, RiUpload2Line } from 'react-icons/ri';

interface NewStudio {
  name: string;
  email: string;
  phone: string;
  logoUrl: string;
  website: string;
  address: string;
  industry: string;
  subscriptionTier: 'FREE' | 'STANDARD' | 'PRO';
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactPosition: string;
}

export default function NewStudioPage() {
  const router = useRouter();
  const [studio, setStudio] = useState<NewStudio>({
    name: '',
    email: '',
    phone: '',
    logoUrl: '',
    website: '',
    address: '',
    industry: '',
    subscriptionTier: 'FREE',
    subscriptionStatus: 'ACTIVE',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    contactPosition: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/master-admin/api/studios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studio),
      });

      if (!response.ok) {
        throw new Error('Failed to create studio');
      }

      toast.success('Studio created successfully');
      router.push('/master-admin/dashboard');
    } catch (error) {
      toast.error('Failed to create studio');
      console.error('Error creating studio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1A1B1E] bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-[#1A1B1E] rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Add New Studio</h2>
          <button
            onClick={() => router.push('/master-admin/dashboard')}
            className="text-gray-400 hover:text-white"
          >
            <RiCloseLine className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Company Logo</label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-[#25262B] rounded flex items-center justify-center">
                {studio.logoUrl ? (
                  <img src={studio.logoUrl} alt="Logo" className="w-full h-full object-contain rounded" />
                ) : (
                  <div className="text-gray-600">
                    <RiUpload2Line className="w-8 h-8" />
                  </div>
                )}
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-[#25262B] text-gray-300 rounded hover:bg-[#2C2D32] transition-colors"
                onClick={() => {/* Implement logo upload */}}
              >
                Upload Logo
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Recommended: Square image, max 5MB</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Studio Name</label>
              <input
                type="text"
                value={studio.name}
                onChange={(e) => setStudio({ ...studio, name: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email</label>
              <input
                type="email"
                value={studio.email}
                onChange={(e) => setStudio({ ...studio, email: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
              <input
                type="tel"
                value={studio.phone}
                onChange={(e) => setStudio({ ...studio, phone: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Website</label>
              <input
                type="url"
                value={studio.website}
                onChange={(e) => setStudio({ ...studio, website: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder="https://"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Subscription Tier</label>
              <select
                value={studio.subscriptionTier}
                onChange={(e) => setStudio({ ...studio, subscriptionTier: e.target.value as 'FREE' | 'STANDARD' | 'PRO' })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="FREE">Free</option>
                <option value="STANDARD">Standard</option>
                <option value="PRO">Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Address</label>
              <input
                type="text"
                value={studio.address}
                onChange={(e) => setStudio({ ...studio, address: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Industry</label>
              <input
                type="text"
                value={studio.industry}
                onChange={(e) => setStudio({ ...studio, industry: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Contact Name</label>
              <input
                type="text"
                value={studio.contactName}
                onChange={(e) => setStudio({ ...studio, contactName: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
              <input
                type="email"
                value={studio.contactEmail}
                onChange={(e) => setStudio({ ...studio, contactEmail: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={studio.contactPhone}
                onChange={(e) => setStudio({ ...studio, contactPhone: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Contact Position</label>
              <input
                type="text"
                value={studio.contactPosition}
                onChange={(e) => setStudio({ ...studio, contactPosition: e.target.value })}
                className="w-full bg-[#25262B] border border-gray-800 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-800">
            <button
              type="button"
              onClick={() => router.push('/master-admin/dashboard')}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#1A1B1E] disabled:opacity-50 disabled:hover:bg-blue-600"
            >
              {isSaving ? 'Creating...' : 'Create Studio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} n