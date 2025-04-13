'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  RiArrowLeftLine,
  RiEditLine,
  RiTeamLine,
  RiProjectorLine,
  RiBuilding4Line,
  RiMailLine,
  RiPhoneLine,
  RiGlobalLine,
  RiMapPinLine
} from 'react-icons/ri';

type Studio = {
  id: string;
  name: string;
  email: string;
  phone: string;
  logoUrl?: string;
  isActive: boolean;
  subscriptionTier: string;
  subscriptionStatus: string;
  website?: string;
  address?: string;
  industry?: string;
  clients: Array<{
    id: string;
    name: string;
    _count: {
      projects: number;
    };
  }>;
};

export default function StudioDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [studio, setStudio] = useState<Studio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudioDetails = async () => {
      try {
        const response = await fetch(`/master-admin/api/studios/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch studio details');
        }
        const data = await response.json();
        setStudio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load studio details');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchStudioDetails();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500">{error || 'Studio not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-400 hover:text-white"
            >
              <RiArrowLeftLine size={24} />
            </button>
            <h1 className="text-3xl font-bold text-white">Studio Details</h1>
          </div>
          <Link
            href={`/master-admin/studios/${studio.id}/edit`}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <RiEditLine /> Edit Studio
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Studio Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                {studio.logoUrl ? (
                  <Image
                    src={studio.logoUrl}
                    alt={studio.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-gray-400 text-2xl">
                      {studio.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-white">{studio.name}</h2>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      studio.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {studio.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      studio.subscriptionStatus === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {studio.subscriptionTier}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-400">
                  <RiMailLine />
                  <span>{studio.email}</span>
                </div>
                {studio.phone && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <RiPhoneLine />
                    <span>{studio.phone}</span>
                  </div>
                )}
                {studio.website && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <RiGlobalLine />
                    <span>{studio.website}</span>
                  </div>
                )}
                {studio.address && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <RiMapPinLine />
                    <span>{studio.address}</span>
                  </div>
                )}
                {studio.industry && (
                  <div className="flex items-center gap-3 text-gray-400">
                    <RiBuilding4Line />
                    <span>{studio.industry}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Clients List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  <RiTeamLine /> Clients
                </h3>
                <span className="text-gray-400">
                  {studio.clients.length} clients
                </span>
              </div>

              <div className="space-y-4">
                {studio.clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-white font-medium">{client.name}</h4>
                      <p className="text-gray-400 text-sm">
                        {client._count.projects} projects
                      </p>
                    </div>
                    <Link
                      href={`/master-admin/studios/${studio.id}/clients/${client.id}`}
                      className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 flex items-center gap-2"
                    >
                      <RiProjectorLine /> View Projects
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 