'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mockData';
import Image from 'next/image';
import { IoGrid, IoList } from 'react-icons/io5';

// Extend the mock project data to match the Project type
const extendMockProject = (project: any): Project => ({
  ...project,
  address: {
    street: '',
    city: project.city || '',
    state: '',
    country: project.country || '',
    zipCode: ''
  },
  contact: {
    name: '',
    email: '',
    phone: ''
  }
});

export default function ProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const { studio, client } = params;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // In a real app, fetch projects from API
    // For now, use mock data and extend it to match Project type
    const clientProjects = MOCK_PROJECTS
      .filter(p => p.clientName?.toLowerCase().replace(/\s+/g, '-') === decodeURIComponent(client as string).toLowerCase()) // Match by client name in URL
      .map(extendMockProject);
    setProjects(clientProjects);
    setLoading(false);
  }, [client]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <div className="relative border-b border-white/10">
        <div className="max-w-[2000px] mx-auto px-8 py-20">
          <div className="space-y-2">
            <p className="text-white/60 uppercase tracking-wider text-sm">[PRODUCTS]</p>
            <h1 className="text-6xl font-light">
              {decodeURIComponent(client as string).split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[2000px] mx-auto px-8 py-12">
        {/* View Toggle */}
        <div className="flex justify-end mb-12">
          <div className="flex items-center gap-1 p-0.5 border border-white/10 rounded">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <IoGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-black' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <IoList size={20} />
            </button>
          </div>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-8">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group cursor-pointer relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0"
                onClick={() => router.push(`/${studio}/${client}/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <div className="relative border border-white/10 p-4 h-full">
                  {/* Thumbnail */}
                  <div className="aspect-[16/9] relative overflow-hidden mb-4 bg-white/5">
                    <Image
                      src={project.thumbnailUrl || '/placeholder-project.jpg'}
                      alt={project.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Info */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-light group-hover:text-white transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs border border-white/10 rounded-full text-white/60"
                        >
                          {tag.type}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-white/40">
                      {project.city}, {project.country}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group cursor-pointer relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0"
                onClick={() => router.push(`/${studio}/${client}/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <div className="relative border border-white/10 p-6 h-full">
                  <div className="flex items-center gap-8">
                    {/* Thumbnail */}
                    <div className="w-48 aspect-[16/9] relative overflow-hidden bg-white/5">
                      <Image
                        src={project.thumbnailUrl || '/placeholder-project.jpg'}
                        alt={project.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-light group-hover:text-white transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 text-xs border border-white/10 rounded-full text-white/60"
                          >
                            {tag.type}
                          </span>
                        ))}
                      </div>
                      <div className="text-sm text-white/40">
                        {project.city}, {project.country}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {projects.length === 0 && (
          <div className="text-center py-20 relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
            <div className="border border-white/10 py-20">
              <p className="text-white/40 text-lg">No projects found.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 