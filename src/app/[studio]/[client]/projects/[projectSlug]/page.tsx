'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Project } from '@/types';
import { MOCK_PROJECTS, PROJECT_STATUSES } from '@/lib/mockData';
import Image from 'next/image';
import { IoArrowBack } from 'react-icons/io5';
import Link from 'next/link';

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

export default function ProjectPage() {
  const params = useParams();
  const { studio, client, projectSlug } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch project from API
    // For now, use mock data and extend it to match Project type
    const foundProject = MOCK_PROJECTS.find(
      p => p.name.toLowerCase().replace(/\s+/g, '-') === decodeURIComponent(projectSlug as string).toLowerCase()
    );
    
    if (foundProject) {
      setProject(extendMockProject(foundProject));
    }
    setLoading(false);
  }, [projectSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-200 mb-2">Project Not Found</h2>
          <p className="text-gray-400">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-black">
        <Image
          src={project.thumbnailUrl || '/placeholder-project.jpg'}
          alt={project.name}
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-black/20" />
        
        {/* Back Button */}
        <Link
          href={`/${studio}/${client}/projects`}
          className="absolute top-8 left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors z-10"
        >
          <IoArrowBack />
          <span>Back to Projects</span>
        </Link>

        {/* Project Title */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold text-white mb-4">{project.name}</h1>
            <div className="flex flex-wrap gap-3 items-center text-white/80">
              <span className={`px-3 py-1 rounded-full text-sm ${PROJECT_STATUSES[project.status]}`}>
                {project.status}
              </span>
              <span>•</span>
              <span>{project.city}, {project.country}</span>
              <span>•</span>
              <span>Last Update: {new Date(project.lastUpdate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Media Section */}
            {project.media && project.media.length > 0 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold">Project Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.media.map((item, index) => (
                    <div 
                      key={index} 
                      className="aspect-[16/9] relative rounded-lg overflow-hidden group cursor-pointer"
                    >
                      <Image
                        src={item.url}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {item.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Tags */}
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Project Tags</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${tag.color} bg-opacity-20`}
                  >
                    {tag.type}
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-800/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="text-gray-400">
                {project.address.street && <p>{project.address.street}</p>}
                <p>{project.city}</p>
                <p>{project.country}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 