import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Project, ProjectTag } from '@/types';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  RiAddLine, 
  RiArrowLeftLine, 
  RiHomeLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiMapPinLine,
  RiUploadCloud2Line,
  RiLayoutLine,
  RiImageLine,
  RiEyeLine
} from 'react-icons/ri';
import AddProjectModal from './AddProjectModal';
import EditProjectModal from './EditProjectModal';
import EditClientModal from './EditClientModal';
import UploadModal from './UploadModal';
import ProjectCard from './ProjectCard';

interface ClientProjectsContentProps {
  clientId: string;
}

// Constants
const PROJECT_STATUSES = {
  'Materials Received': 'text-gray-400',
  'In Progress': 'text-blue-400',
  'Pending Approval': 'text-yellow-400',
  'In Review': 'text-purple-400',
  'Revisions': 'text-orange-400',
  'Completed': 'text-green-400'
} as const;

export default function ClientProjectsContent({ clientId }: ClientProjectsContentProps) {
  const router = useRouter();
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);
  const [isDeleteProjectModalOpen, setIsDeleteProjectModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    // Load client data from localStorage
    const savedClients = localStorage.getItem('clients');
    const clients = savedClients ? JSON.parse(savedClients) : [];
    
    // Try to find client by ID first
    let foundClient = clients.find((c: any) => c.id === clientId);

    // If not found by ID, try to find by URL slug
    if (!foundClient) {
      foundClient = clients.find((c: any) => c.urlSlug === clientId);
    }

    // If still not found, try to find by normalized name (legacy support)
    if (!foundClient) {
      foundClient = clients.find((c: any) => {
        const clientNameNormalized = c.name.toLowerCase().replace(/\s+/g, '-');
        const urlNameNormalized = clientId.toLowerCase();
        return clientNameNormalized === urlNameNormalized;
      });
    }

    if (!foundClient) {
      console.error('Client not found:', { clientId, availableClients: clients });
      notFound();
    }

    // Load projects from localStorage
    const savedProjects = localStorage.getItem('projects');
    const allProjects = savedProjects ? JSON.parse(savedProjects) : [];
    const clientProjects = allProjects.filter((p: Project) => p.clientId === foundClient.id);
    setProjects(clientProjects);

    // Update client's project count and projects array
    foundClient.projectCount = clientProjects.length;
    foundClient.projects = clientProjects.map(p => p.id);

    // Update the client in the clients array
    const updatedClients = clients.map((c: any) => 
      c.id === foundClient.id ? foundClient : c
    );

    // Save the updated clients back to localStorage
    localStorage.setItem('clients', JSON.stringify(updatedClients));

    setClient(foundClient);
    setLoading(false);
  }, [clientId]);

  const handleAddProject = (newProject: Project) => {
    // Save project to localStorage
    const savedProjects = localStorage.getItem('projects');
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));

    // Update state
    setProjects(prev => [...prev, newProject]);
  };

  const handleEditProject = (updatedProject: Project) => {
    // Update project in localStorage
    const savedProjects = localStorage.getItem('projects');
    const projects = savedProjects ? JSON.parse(savedProjects) : [];
    const updatedProjects = projects.map((p: Project) => 
      p.id === updatedProject.id ? updatedProject : p
    );
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    // Update state
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
      </div>
    );
  }

  if (!client) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Projects Section */}
      <div className="max-w-[1490px] mx-auto px-5 py-8">
        <div className="space-y-6">
          <h2 className="text-xl font-light text-white">Projects</h2>

          {projects.length === 0 ? (
            <div className="relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
              <div className="text-center py-20 border border-white/10 bg-gradient-to-b from-[#0A0A0A] to-black">
                <h3 className="text-xl font-light text-white/40">No Projects Yet</h3>
                <p className="text-white/40 mb-6">Start by creating your first project for this client.</p>
                <button
                  onClick={() => setIsAddProjectModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs text-white mx-auto"
                >
                  <RiAddLine size={12} />
                  <span>Create First Project</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-[1490px] mx-auto px-5 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ProjectCard
                      project={project}
                      clientId={clientId}
                      onEdit={() => {
                        setSelectedProject(project);
                        setIsEditProjectModalOpen(true);
                      }}
                      onMediaClick={() => {
                        router.push(`/studio/dashboard/clients/${clientId}/projects/${project.id}/media`);
                      }}
                      onViewClick={() => {
                        router.push(`/studio/dashboard/clients/${clientId}/projects/${project.id}/view`);
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {isAddProjectModalOpen && (
        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          onAdd={handleAddProject}
          clientId={client.id}
          studioId={client.studioId || ''}
        />
      )}

      {isEditProjectModalOpen && selectedProject && (
        <EditProjectModal
          isOpen={isEditProjectModalOpen}
          onClose={() => {
            setIsEditProjectModalOpen(false);
            setSelectedProject(null);
          }}
          onEdit={handleEditProject}
          project={selectedProject}
        />
      )}

      {isUploadModalOpen && selectedProject && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onUpload={(files) => {
            // Handle file upload
            console.log('Uploading files:', files);
          }}
        />
      )}
    </div>
  );
} 