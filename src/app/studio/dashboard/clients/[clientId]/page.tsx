'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiArrowLeftLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiHomeLine, RiArrowRightLine, RiImageLine } from 'react-icons/ri';
import { formatDate } from '@/lib/utils/date';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';

interface Project {
  id: string;
  name: string;
  status: string;
  startDate: string;
  dueDate: string;
  budget: number;
  thumbnailUrl?: string;
  clientId: string;
}

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  logo?: string;
  projects: Project[];
  address?: string | {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

interface ClientPageProps {
  params: {
    clientId: string;
  };
}

export default function ClientPage({ params }: ClientPageProps) {
  const router = useRouter();
  const { clientId } = params;
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClient = () => {
      const savedClients = localStorage.getItem('clients');
      const clients = savedClients ? JSON.parse(savedClients) : [];
      
      // Try to find client by ID first
      let foundClient = clients.find((c: any) => c.id === clientId);
      
      // If not found by ID, try to find by URL slug (name)
      if (!foundClient) {
        const clientSlug = clientId.replace(/-/g, ' ');
        foundClient = clients.find((c: any) => 
          c.name.toLowerCase() === clientSlug.toLowerCase()
        );
      }

      if (!foundClient) {
        setError('Client not found');
        setLoading(false);
        return;
      }

      setClient(foundClient);
      setLoading(false);

      // Update URL to use client name if it's not already
      const clientSlug = foundClient.name.toLowerCase().replace(/\s+/g, '-');
      if (window.location.pathname !== `/studio/dashboard/clients/${clientSlug}`) {
        window.history.replaceState({}, '', `/studio/dashboard/clients/${clientSlug}`);
      }

      // Load projects from localStorage
      const savedProjects = localStorage.getItem('projects');
      const allProjects = savedProjects ? JSON.parse(savedProjects) : [];
      const clientProjects = allProjects.filter((p: Project) => p.clientId === foundClient.id);
      
      setProjects(clientProjects);
    };

    loadClient();
  }, [clientId, router]);

  useEffect(() => {
    if (projects.length > 1) {
      const interval = setInterval(() => {
        setProjects(prevProjects => {
          const newProjects = [...prevProjects];
          const firstProject = newProjects.shift();
          if (firstProject) {
            newProjects.push(firstProject);
          }
          return newProjects;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [projects.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className={DESIGN_PATTERNS.LOADING.spinner} />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500">{error || 'Client not found'}</div>
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
              <h1 className="text-3xl font-light text-white uppercase">{client.name}</h1>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-white/60 mt-6">
            <Link href="/studio/dashboard" className="hover:text-white transition-colors">
              <RiHomeLine className="w-4 h-4" />
            </Link>
            <RiArrowRightLine className="w-4 h-4 mx-2" />
            <Link href="/studio/dashboard/clients" className="hover:text-white transition-colors">
              Clients
            </Link>
            <RiArrowRightLine className="w-4 h-4 mx-2" />
            <span className="text-white">{client.name}</span>
          </div>
        </div>

        {/* Slideshow Section with Contact Info Overlay */}
        <div className={`${DESIGN_PATTERNS.CARD.wrapper} mb-6 relative`}>
          <div className={`${DESIGN_PATTERNS.CARD.inner} p-0`}>
            {/* Contact Info Overlay */}
            <div className="absolute top-6 left-6 z-10 bg-black/80 backdrop-blur-sm p-4 rounded-lg max-w-xs">
              <h2 className="text-lg font-light text-white mb-2">Contact Information</h2>
              <div className="space-y-1 text-white/60 text-sm">
                <p>{client.email}</p>
                <p>{client.phone}</p>
                <p>{
                  client.address ? (
                    typeof client.address === 'string' ? 
                      client.address : 
                      `${client.address.street}, ${client.address.city}, ${client.address.country}`
                  ) : 'Not provided'
                }</p>
              </div>
            </div>

            <div className="absolute top-6 right-6 z-10">
              <Link
                href={`/studio/dashboard/clients/${clientId}/projects`}
                className={`${DESIGN_PATTERNS.BUTTON.primary}`}
              >
                <span>View Our Projects</span>
                <RiArrowRightLine className={DESIGN_PATTERNS.ICON.small} />
              </Link>
            </div>
            <div className="relative w-full h-[600px] overflow-hidden">
              {projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                  style={{ display: index === 0 ? 'block' : 'none' }}
                >
                  {project.thumbnailUrl ? (
                    <img
                      src={project.thumbnailUrl}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/40 bg-gray-800">
                      <RiImageLine className="w-12 h-12" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Removed Projects Section */}

      </div>
    </div>
  );
} 