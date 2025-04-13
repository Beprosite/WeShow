'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiHomeLine, RiArrowRightLine } from 'react-icons/ri';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';
import ClientProjectsContent from './ClientProjectsContent';

interface ProjectsPageProps {
  params: {
    clientId: string;
  };
}

export default function ProjectsPage({ params }: ProjectsPageProps) {
  const router = useRouter();
  const { clientId } = params;
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClient = () => {
      const savedClients = localStorage.getItem('clients');
      const clients = savedClients ? JSON.parse(savedClients) : [];
      
      // Try to find client by ID first
      let foundClient = clients.find((c: any) => c.id === clientId);
      
      // If not found by ID, try to find by URL slug
      if (!foundClient) {
        const clientSlug = clientId.replace(/-/g, ' ');
        foundClient = clients.find((c: any) => 
          c.name.toLowerCase() === clientSlug.toLowerCase()
        );
      }

      if (!foundClient) {
        router.push('/studio/dashboard/clients');
        return;
      }

      setClient(foundClient);
      setLoading(false);

      // Update URL to use client name
      const clientSlug = foundClient.name.toLowerCase().replace(/\s+/g, '-');
      const newPath = `/studio/dashboard/clients/${clientSlug}/projects`;
      if (window.location.pathname !== newPath) {
        window.history.replaceState({}, '', newPath);
      }
    };

    loadClient();
  }, [clientId, router]);

  if (loading || !client) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className={DESIGN_PATTERNS.LOADING.spinner} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1490px] mx-auto px-5">
        {/* Header Section */}
        <div className="relative border-b border-white/10 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-white uppercase">Projects</h1>
              <p className="text-sm text-white/60 mt-1">Client: <span className="text-white/60">{client.name}</span></p>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-white/60 mb-6">
          <Link href="/studio/dashboard" className="hover:text-white transition-colors">
            <RiHomeLine className="w-4 h-4" />
          </Link>
          <RiArrowRightLine className="w-4 h-4 mx-2" />
          <Link href="/studio/dashboard/clients" className="hover:text-white transition-colors">
            Clients
          </Link>
          <RiArrowRightLine className="w-4 h-4 mx-2" />
          <Link href={`/studio/dashboard/clients/${client.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-white transition-colors">
            {client.name}
          </Link>
          <RiArrowRightLine className="w-4 h-4 mx-2" />
          <span className="text-white">Projects</span>
        </div>

        {/* Rest of your projects page content */}
        <ClientProjectsContent clientId={client.id} />
      </div>
    </div>
  );
} 