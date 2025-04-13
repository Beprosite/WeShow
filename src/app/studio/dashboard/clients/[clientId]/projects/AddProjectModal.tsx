'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiCloseLine, RiAddLine, RiLockLine } from 'react-icons/ri';
import { Project, ProjectTag } from '@/types';
import { PROJECT_STATUSES, ProjectStatus } from '@/lib/mockData';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
  clientId: string;
  studioId: string;
}

interface DeliverableInfo {
  type: string;
  usedInProjects: number; // Count of projects using this deliverable
  createdInProject?: string; // Project ID where it was created
  projectName?: string; // Store project name for tooltip
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  clientId,
  studioId
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    clientId,
    status: 'In Progress' as ProjectStatus,
    budget: 0,
    tags: [],
    city: '',
    country: '',
    address: {
      street: '',
      city: '',
      country: '',
    },
    contact: {
      phone: '',
      email: '',
      name: '',
    },
    lastUpdate: new Date().toISOString(),
    media: []
  });

  const [customDeliverable, setCustomDeliverable] = useState('');
  const [deliverablesInfo, setDeliverablesInfo] = useState<DeliverableInfo[]>([]);

  // Load all deliverables and their usage info from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects) as Project[];
      const deliverableUsage = new Map<string, DeliverableInfo>();

      // Count usage of each deliverable across projects
      projects.forEach(project => {
        project.tags.forEach(tag => {
          const existing = deliverableUsage.get(tag.type) || {
            type: tag.type,
            usedInProjects: 0,
            createdInProject: project.id,
            projectName: project.name // Store project name for tooltip
          };
          existing.usedInProjects++;
          deliverableUsage.set(tag.type, existing);
        });
      });

      setDeliverablesInfo(Array.from(deliverableUsage.values()));
    }
  }, []);

  const handleTagToggle = (tag: ProjectTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.some(t => t.type === tag.type)
        ? prev.tags.filter(t => t.type !== tag.type)
        : [...(prev.tags || []), { ...tag, color: 'bg-blue-500' }]
    }));
  };

  const handleDeleteDeliverable = (type: string) => {
    // Remove from deliverablesInfo
    setDeliverablesInfo(prev => prev.filter(info => info.type !== type));
    
    // Remove from selected tags if it was selected
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag.type !== type) || []
    }));
  };

  const handleAddCustomDeliverable = () => {
    if (customDeliverable.trim()) {
      const newTag: ProjectTag = {
        type: customDeliverable.trim(),
        color: 'bg-gray-500'
      };
      
      // Add to deliverables info
      setDeliverablesInfo(prev => [
        ...prev,
        { type: newTag.type, usedInProjects: 0 }
      ]);
      
      // Select the new deliverable
      handleTagToggle(newTag);
      setCustomDeliverable('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tags?.length) {
      alert('Please select at least one deliverable');
      return;
    }

    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      clientId,
      name: formData.name || '',
      status: formData.status || 'In Progress',
      budget: formData.budget || 0,
      tags: formData.tags || [],
      city: formData.city || '',
      country: formData.country || '',
      address: formData.address || { street: '', city: '', country: '' },
      contact: formData.contact || { phone: '', email: '', name: '' },
      lastUpdate: new Date().toISOString(),
      media: []
    };

    onAdd(newProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative p-[1px] w-full max-w-xl before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0"
      >
        <div className="bg-gradient-to-b from-[#0A0A0A] to-black border border-white/10">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light text-white">Create New Project</h2>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-light text-white/60 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-light text-white/60 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
                  className="w-full px-3 py-2 bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-colors appearance-none"
                >
                  {Object.keys(PROJECT_STATUSES).map((status) => (
                    <option key={status} value={status} className="bg-black">
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-light text-white/60 mb-2">
                  Budget
                </label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs font-light text-white/60 mb-2">
                  Location
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="w-full px-3 py-2 bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                    required
                  />
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                    className="w-full px-3 py-2 bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-light text-white/60 mb-2">
                  Deliverables
                </label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {deliverablesInfo.map((info) => (
                      <div key={info.type} className="flex items-center gap-1 relative group">
                        <button
                          type="button"
                          onClick={() => handleTagToggle({ type: info.type, color: 'bg-blue-500' } as ProjectTag)}
                          className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5 transition-all duration-200 relative ${
                            formData.tags?.some(tag => tag.type === info.type)
                              ? 'bg-white text-black border-transparent font-medium'
                              : 'bg-black/60 text-white/60 hover:text-white border border-white/10 hover:border-white/20'
                          }`}
                        >
                          {info.type}
                          {info.usedInProjects > 0 && (
                            <span className={`text-[10px] ${formData.tags?.some(tag => tag.type === info.type) ? 'opacity-50' : 'opacity-75'}`}>
                              ({info.usedInProjects})
                            </span>
                          )}
                          {info.usedInProjects > 0 && (
                            <RiLockLine className={`w-3 h-3 ${formData.tags?.some(tag => tag.type === info.type) ? 'opacity-30' : 'opacity-50'}`} />
                          )}
                        </button>
                        {info.usedInProjects === 0 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteDeliverable(info.type)}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black hover:bg-red-500 text-white/40 hover:text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/10"
                          >
                            ×
                          </button>
                        )}
                        {info.usedInProjects > 0 && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black text-white/80 text-xs rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                            First used in: {info.projectName || 'Unknown Project'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customDeliverable}
                      onChange={(e) => setCustomDeliverable(e.target.value)}
                      placeholder="Add custom deliverable"
                      className="flex-1 px-3 py-2 bg-black border border-white/10 text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomDeliverable())}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDeliverable}
                      disabled={!customDeliverable.trim()}
                      className="flex items-center gap-1 px-3 py-2 bg-black hover:bg-[#222222] border border-white/10 text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      <RiAddLine className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-1 px-4 py-2 text-white/40 hover:text-white transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-2 bg-black hover:bg-[#222222] border border-white/10 text-white transition-colors text-sm"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AddProjectModal; 