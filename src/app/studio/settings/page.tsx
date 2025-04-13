'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import {
  RiImageEditLine,
  RiVipCrownLine,
  RiFileListLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiCloseLine,
  RiAddLine,
  RiSettings4Line,
  RiLogoutBoxLine,
  RiMoonLine,
  RiSunLine
} from 'react-icons/ri';
import { formatDate } from '@/lib/utils/date';
import { useStudio } from '@/app/contexts/StudioContext';

export default function SettingsPage() {
  const router = useRouter();
  const { studioData: contextStudioData, setStudioData: setContextStudioData, refreshStudioData } = useStudio();
  const [isUploading, setIsUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [studioData, setStudioData] = useState(contextStudioData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (contextStudioData) {
      setStudioData(contextStudioData);
      setIsLoading(false);
    }
  }, [contextStudioData]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setSuccessMessage('');

    try {
      console.log('Starting logo upload...');
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/studio/api/upload/logo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.success && data.publicUrl && studioData) {
        setStudioData({
          ...studioData,
          logo: data.publicUrl
        });
        setSuccessMessage('Logo uploaded successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studioData) return;
    
    setIsSaving(true);
    setSuccessMessage('');
    setError('');

    try {
      const response = await fetch('/studio/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: studioData.name,
          email: studioData.email,
          logo: studioData.logo
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/studio/auth/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      const data = await response.json();
      const updatedStudioData = {
        ...studioData,
        name: data.name,
        email: data.email,
        logo: data.logo,
        subscription: studioData.subscription
      };
      
      setStudioData(updatedStudioData);
      // Update the global context
      setContextStudioData(updatedStudioData);
      setSuccessMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!studioData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-500">Failed to load studio data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1490px] mx-auto px-6 py-12">
        <div className="max-w-[1490px] mx-auto space-y-8">
          {/* Profile Section */}
          <div className="relative p-[1px] max-w-[1490px] before:absolute before:w-[9px] before:h-[9px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[9px] after:h-[9px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
            <div className="bg-gradient-to-b from-[#1A1A1A] to-black border border-white/10 p-5">
              <h2 className="text-xl font-light mb-6">Studio Profile</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Upload */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-[#0A0A0A]">
                      {studioData.logo ? (
                        <Image
                          src={studioData.logo}
                          alt="Studio Logo"
                          width={54}
                          height={54}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-light text-white/40">
                            {studioData.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="logo-upload"
                      className="hidden"
                      onChange={handleLogoUpload}
                      accept="image/*"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="absolute bottom-0 right-0 p-1.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 cursor-pointer transition-all duration-300"
                    >
                      <RiImageEditLine size={13} className="text-white/60 hover:text-white" />
                    </label>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={studioData.name}
                      onChange={(e) => setStudioData({ ...studioData, name: e.target.value })}
                      className="text-xl font-light bg-transparent focus:outline-none"
                      placeholder="Studio Name"
                    />
                    <p className="text-white/40 text-xs mt-1">Update your studio profile</p>
                    {successMessage && (
                      <p className="text-green-400 text-xs mt-1">{successMessage}</p>
                    )}
                    {error && (
                      <p className="text-red-400 text-xs mt-1">{error}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/40 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={studioData.email}
                      onChange={(e) => setStudioData({ ...studioData, email: e.target.value })}
                      className="w-full bg-[#0A0A0A] border border-white/10 rounded px-3 py-1.5 text-white/80 focus:outline-none focus:border-white/20 text-sm"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex items-center gap-1 px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs ${
                      isSaving ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="relative p-[1px] max-w-[1490px] before:absolute before:w-[9px] before:h-[9px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[9px] after:h-[9px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
            <div className="bg-gradient-to-b from-[#1A1A1A] to-black border border-white/10 p-5">
              <h2 className="text-xl font-light mb-6">Subscription</h2>
              <div className="space-y-6">
                {/* Current Plan Info */}
                <div className="flex items-start gap-3 p-4 bg-[#0A0A0A] rounded-lg border border-white/10">
                  <RiVipCrownLine size={20} className="text-white/60" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-light">{studioData.subscription.tier} Plan</h3>
                      <span className="px-2.5 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
                        {studioData.subscription.status}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl font-light">${studioData.subscription.price}</span>
                      <span className="text-white/40 text-sm">
                        /{studioData.subscription.billingPeriod}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-2">
                      Next billing date: {formatDate(studioData.subscription.currentPeriodEnd)}
                    </p>
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => {
                          // TODO: Implement upgrade plan
                          alert('Upgrade plan functionality will be implemented soon');
                        }}
                        className="px-2.5 py-0.5 text-xs text-blue-500 hover:text-blue-400 border border-blue-500/20 hover:border-blue-500/40 rounded-full transition-all duration-300"
                      >
                        Upgrade Plan
                      </button>
                      {studioData.subscription.status === 'active' && (
                        <button
                          onClick={() => {
                            // TODO: Implement cancel subscription
                            alert('Cancel subscription functionality will be implemented soon');
                          }}
                          className="px-2.5 py-0.5 text-xs text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-full transition-all duration-300"
                        >
                          Cancel Subscription
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Plan Features */}
                <div>
                  <h3 className="text-lg font-light mb-4">Plan Features</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[#0A0A0A] rounded-lg border border-white/10">
                      <h4 className="text-white/40 text-sm mb-2">Storage</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-light">20GB</span>
                        <span className="text-white/40 text-xs">used: 5.2GB</span>
                      </div>
                    </div>
                    <div className="p-4 bg-[#0A0A0A] rounded-lg border border-white/10">
                      <h4 className="text-white/40 text-sm mb-2">Clients</h4>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-light">15</span>
                        <span className="text-white/40 text-xs">used: 8</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoices Section */}
          <div className="relative p-[1px] max-w-[1490px] before:absolute before:w-[9px] before:h-[9px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[9px] after:h-[9px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
            <div className="bg-gradient-to-b from-[#1A1A1A] to-black border border-white/10 p-5">
              <h2 className="text-xl font-light mb-6">Billing History</h2>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-white/40 text-sm border-b border-white/10">
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Description</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studioData.subscription.status === 'active' && (
                        <tr className="border-b border-white/5 text-sm">
                          <td className="py-4 px-4">{formatDate(studioData.subscription.currentPeriodEnd)}</td>
                          <td className="py-4 px-4">
                            {studioData.subscription.tier} Plan ({studioData.subscription.billingPeriod})
                          </td>
                          <td className="py-4 px-4">${studioData.subscription.price}</td>
                          <td className="py-4 px-4">
                            <span className="px-2.5 py-0.5 text-xs bg-green-500/10 text-green-500 rounded-full">
                              Paid
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button className="text-blue-500 hover:text-blue-400 transition-colors">
                              Download
                            </button>
                          </td>
                        </tr>
                      )}
                      {/* Placeholder for when there are no invoices */}
                      {studioData.subscription.status !== 'active' && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-white/40">
                            No billing history available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 