'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Project } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mockData';
import Image from 'next/image';

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

export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const { studio, client } = params;
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch projects from API
    // For now, use mock data and extend it to match Project type
    const clientProjects = MOCK_PROJECTS
      .filter(p => p.clientId === '1') // Using mock client ID
      .map(extendMockProject);
    setProjects(clientProjects);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Client Header */}
        <div className="glass-effect rounded-xl p-8 mb-12">
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
              <span className="text-3xl font-bold text-gray-400">
                {client?.toString().charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 capitalize">
                {client?.toString().replace(/-/g, ' ')}
              </h1>
              <p className="text-gray-400">
                Studio: <span className="capitalize">{studio?.toString().replace(/-/g, ' ')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => router.push(`/${studio}/${client}/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`)}
            >
              {/* Project Thumbnail */}
              <div className="aspect-video relative overflow-hidden">
                <Image
                  src={project.thumbnailUrl}
                  alt={project.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Project Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm ${tag.color} bg-opacity-20`}
                    >
                      {tag.type}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400">
                  <span>Status: {project.status}</span>
                  <span>{new Date(project.lastUpdate).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 