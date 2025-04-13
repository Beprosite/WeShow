'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { 
  RiHomeLine,
  RiArrowRightLine,
  RiImageLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSettings4Line,
  RiLogoutBoxLine
} from 'react-icons/ri';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';

interface Project {
  id: string;
  name: string;
  status: string;
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
}

export default function StudioDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [studioName, setStudioName] = useState('');

  useEffect(() => {
    const loadData = () => {
      const savedClients = localStorage.getItem('clients');
      const savedProjects = localStorage.getItem('projects');
      const savedStudio = localStorage.getItem('studio');
      
      const clients = savedClients ? JSON.parse(savedClients) : [];
      const allProjects = savedProjects ? JSON.parse(savedProjects) : [];
      const studio = savedStudio ? JSON.parse(savedStudio) : null;
      
      setClients(clients);
      setProjects(allProjects);
      setStudioName(studio?.name || '');
      setLoading(false);
    };

    loadData();
  }, []);

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

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1490px] mx-auto px-5">
        {/* Header Section */}
        <div className="relative border-b border-white/10 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-white uppercase">{studioName}</h1>
            </div>
          </div>
        </div>

        {/* Slideshow Section */}
        <div className={`${DESIGN_PATTERNS.CARD.wrapper} mb-6 relative`}>
          <div className={`${DESIGN_PATTERNS.CARD.inner} p-0`}>
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

        {/* Clients Section */}
        <div className="grid grid-cols-3 gap-6">
          {clients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${DESIGN_PATTERNS.CARD.wrapper} group relative`}
            >
              <div className={`${DESIGN_PATTERNS.CARD.inner} p-6`}>
                <div className="flex items-center gap-4">
                  {client.logo ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                      <img
                        src={client.logo}
                        alt={client.company}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40">
                      {client.company.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-light text-white">{client.company}</h3>
                    <p className="text-sm text-white/60">{client.email}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-white/40">
                    {client.projects.length} {client.projects.length === 1 ? 'Project' : 'Projects'}
                  </span>
                  <Link
                    href={`/studio/dashboard/clients/${client.id}`}
                    className={`${DESIGN_PATTERNS.BUTTON.primary} text-sm`}
                  >
                    View Client
                    <RiArrowRightLine className={DESIGN_PATTERNS.ICON.small} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 