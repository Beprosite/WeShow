'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RiCloseLine, RiAddLine, RiLockLine } from 'react-icons/ri';
import { Project, ProjectTag } from '@/types';
import { PROJECT_STATUSES, ProjectStatus } from '@/lib/mockData';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
  project: Project | null;
}

interface DeliverableInfo {
  type: string;
  usedInProjects: number;
  createdInProject?: string;
  projectName?: string;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  project
}) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    status: 'Materials Received' as ProjectStatus,
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
    },
  });

  const [customDeliverable, setCustomDeliverable] = useState('');
  const [deliverablesInfo, setDeliverablesInfo] = useState<DeliverableInfo[]>([]);

  // Load project data when modal opens
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        status: project.status,
        budget: project.budget,
        tags: project.tags,
        city: project.city,
        country: project.country,
        address: project.address,
        contact: project.contact,
      });
    }
  }, [project]);

  // Load all deliverables and their usage info from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const projects = JSON.parse(savedProjects) as Project[];
      const deliverableUsage = new Map<string, DeliverableInfo>();

      projects.forEach(p => {
        p.tags.forEach(tag => {
          const existing = deliverableUsage.get(tag.type) || {
            type: tag.type,
            usedInProjects: 0,
            createdInProject: p.id,
            projectName: p.name
          };
          existing.usedInProjects++;
          deliverableUsage.set(tag.type, existing);
        });
      });

      setDeliverablesInfo(Array.from(deliverableUsage.values()));
    }
  }, []);

  const handleTagToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.some(tag => tag.type === type)
        ? prev.tags.filter(tag => tag.type !== type)
        : [...(prev.tags || []), { type, color: 'bg-blue-500' }]
    }));
  };

  const handleAddCustomDeliverable = () => {
    if (customDeliverable.trim()) {
      const newType = customDeliverable.trim();
      
      setDeliverablesInfo(prev => [
        ...prev,
        { type: newType, usedInProjects: 0 }
      ]);
      
      handleTagToggle(newType);
      setCustomDeliverable('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !formData.tags?.length) {
      alert('Please select at least one deliverable');
      return;
    }

    const updatedProject: Project = {
      ...project,
      ...formData,
      lastUpdate: new Date().toISOString(),
    };

    onEdit(updatedProject);
    onClose();
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Edit Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(PROJECT_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Budget
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Deliverables
            </label>
            <div className="space-y-4">
              {/* All deliverables */}
              <div className="flex flex-wrap gap-2">
                {deliverablesInfo.map((info) => (
                  <div key={info.type} className="flex items-center gap-1 relative group">
                    <button
                      type="button"
                      onClick={() => handleTagToggle(info.type)}
                      className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors ${
                        formData.tags?.some(tag => tag.type === info.type)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {info.type}
                      {info.usedInProjects > 0 && (
                        <span className="text-xs opacity-75">({info.usedInProjects})</span>
                      )}
                      {info.usedInProjects > 0 && (
                        <RiLockLine 
                          className="w-3 h-3 opacity-50" 
                        />
                      )}
                    </button>
                    {/* Tooltip */}
                    {info.usedInProjects > 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        First used in: {info.projectName || 'Unknown Project'}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Custom deliverable input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDeliverable}
                  onChange={(e) => setCustomDeliverable(e.target.value)}
                  placeholder="Add custom deliverable"
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomDeliverable();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomDeliverable}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <RiAddLine size={20} />
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address?.street || ''}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.address?.city || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.address?.country || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, country: e.target.value }
                })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.contact?.phone || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (234) 567-8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.contact?.email || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, email: e.target.value }
                  })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProjectModal; 