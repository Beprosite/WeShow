'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RiImageLine, RiAddLine, RiHomeLine, RiArrowRightLine } from 'react-icons/ri';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';
import { Project } from '@/types';

interface ProjectPageProps {
  params: {
    clientId: string;
    projectId: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const { clientId, projectId } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState<string>('');

  useEffect(() => {
    const loadProject = () => {
      const savedProjects = localStorage.getItem('projects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      const currentProject = projects.find((p: Project) => p.id === projectId);
      
      if (!currentProject) {
        router.push('/studio/dashboard/clients/' + clientId + '/projects');
        return;
      }

      // Load client name
      const savedClients = localStorage.getItem('clients');
      const clients = savedClients ? JSON.parse(savedClients) : [];
      const currentClient = clients.find((c: any) => c.id === clientId);
      if (currentClient) {
        setClientName(currentClient.name);
      }

      // Ensure the project has the required properties initialized
      const initializedProject: Project = {
        ...currentProject,
        photos: currentProject.photos || [],
        videos: currentProject.videos || [],
        heroPhoto: currentProject.heroPhoto || undefined
      };

      setProject(initializedProject);
      setLoading(false);
    };

    loadProject();
  }, [projectId, clientId, router]);

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className={DESIGN_PATTERNS.LOADING.spinner} />
      </div>
    );
  }

  const hasMedia = project.heroPhoto || (project.photos && project.photos.length > 0) || (project.videos && project.videos.length > 0);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1490px] mx-auto px-5">
        {/* Header Section */}
        <div className="relative border-b border-white/10 py-8">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-white/60 mb-6">
            <Link href="/studio/dashboard" className="hover:text-white transition-colors">
              <RiHomeLine className="w-4 h-4" />
            </Link>
            <RiArrowRightLine className="w-4 h-4 mx-2" />
            <Link href={`/studio/dashboard/clients/${clientId}`} className="hover:text-white transition-colors">
              {clientName || 'Client'}
            </Link>
            <RiArrowRightLine className="w-4 h-4 mx-2" />
            <Link href={`/studio/dashboard/clients/${clientId}/projects`} className="hover:text-white transition-colors">
              Projects
            </Link>
            <RiArrowRightLine className="w-4 h-4 mx-2" />
            <span className="text-white">{project.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-white uppercase">{project.name}</h1>
              <p className="text-sm text-white/60 mt-1">Status: {project.status}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="py-8">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className={DESIGN_PATTERNS.LOADING.spinner} />
            </div>
          }>
            {!hasMedia ? (
              // Empty State
              <div className={`${DESIGN_PATTERNS.CARD.wrapper}`}>
                <div className={`${DESIGN_PATTERNS.CARD.inner} p-8`}>
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-full bg-black/50 border border-white/10 flex items-center justify-center mb-4">
                      <RiImageLine className="w-8 h-8 text-white/40" />
                    </div>
                    <h2 className="text-xl font-light text-white mb-2">No Media Yet</h2>
                    <p className="text-sm text-white/60 mb-6">Add your first media file to get started</p>
                    <button
                      onClick={() => router.push(`/studio/dashboard/clients/${clientId}/projects/${projectId}/media`)}
                      className={`${DESIGN_PATTERNS.BUTTON.primary}`}
                    >
                      <RiAddLine className={DESIGN_PATTERNS.ICON.small} />
                      <span>Add Media</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Hero Image Section */}
                {project.heroPhoto && (
                  <div className={`${DESIGN_PATTERNS.CARD.wrapper}`}>
                    <div className={`${DESIGN_PATTERNS.CARD.inner} p-4`}>
                      <h2 className="text-sm font-light text-white mb-4">Hero Image</h2>
                      <div className="aspect-video relative">
                        <img
                          src={project.heroPhoto}
                          alt="Hero image"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Videos Section */}
                {project.videos && project.videos.length > 0 && (
                  <div className={`${DESIGN_PATTERNS.CARD.wrapper}`}>
                    <div className={`${DESIGN_PATTERNS.CARD.inner} p-4`}>
                      <h2 className="text-sm font-light text-white mb-4">Videos</h2>
                      <div className="grid gap-4">
                        {project.videos.map((video) => (
                          <div key={video.id} className="aspect-video relative">
                            <video
                              src={video.url}
                              controls
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <p className="text-sm text-white/60 mt-2">{video.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Photos Grid Section */}
                {project.photos && project.photos.length > 0 && (
                  <div className={`${DESIGN_PATTERNS.CARD.wrapper}`}>
                    <div className={`${DESIGN_PATTERNS.CARD.inner} p-4`}>
                      <h2 className="text-sm font-light text-white mb-4">Photos</h2>
                      <div className="grid grid-cols-3 gap-4">
                        {project.photos.map((photo) => (
                          <div key={photo.id} className="aspect-square relative group">
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <p className="absolute bottom-2 left-2 text-sm text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                              {photo.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
} 