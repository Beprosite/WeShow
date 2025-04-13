/**
 * Project Management Page
 * File: /admin/projects/page.tsx
 * 
 * This page handles all project management functionality including:
 * - Viewing all projects in a grid layout
 * - Adding new projects
 * - Editing existing projects
 * - Deleting projects
 * - Searching projects by name, location, or tags
 */

'use client';

// =============================================================================
// IMPORTS
// =============================================================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  RiAddLine, 
  RiEditLine, 
  RiDeleteBinLine,
  RiFileList3Line,
  RiMoneyDollarCircleLine,
  RiSearchLine 
} from 'react-icons/ri';
import {
  Project,
  ProjectStatus,
  ProjectTag,
  PROJECT_STATUSES,
  PROJECT_TAGS,
  MOCK_PROJECTS
} from '@/lib/mockData';

// =============================================================================
// UTILITIES
// =============================================================================
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB'); // Consistent DD/MM/YYYY format
};

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * AddProjectModal Component
 * Handles the creation of new projects
 * - Collects project details through a form
 * - Validates required fields
 * - Handles tag selection
 * - Creates new project on submission
 */
const AddProjectModal = ({ isOpen, onClose, onAdd }: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
}) => {
  // Initialize form data with default values
  const [formData, setFormData] = useState({
    name: '',
    clientId: '1',
    clientName: 'Ben Shalom',
    city: '',
    country: '',
    status: 'Materials Received' as ProjectStatus,
    startDate: '',
    dueDate: '',
    budget: 0,
    tags: [] as ProjectTag[],
    thumbnailUrl: 'https://picsum.photos/800/600?random=' + Math.random()
  });

  /**
   * Handles toggling of project tags
   * Adds or removes tags from the selection
   */
  const handleTagToggle = (tag: ProjectTag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  /**
   * Handles form submission
   * Validates required fields and creates new project
   */
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (formData.tags.length === 0) {
    alert('Please select at least one deliverable');
    return;
  }
  onAdd({
    id: Date.now().toString(),
    ...formData,
    isPaid: false,
    lastUpdate: new Date().toISOString().split('T')[0]  // Add this line
  });
  onClose();
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Add New Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                required
                placeholder="e.g. Tel Aviv"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                required
                placeholder="e.g. Israel"
              />
            </div>
          </div>

          {/* Status Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ProjectStatus }))}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
            >
              {Object.keys(PROJECT_STATUSES).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
          </div>

          {/* Budget Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Budget ($)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
              required
              min="0"
            />
          </div>

          {/* Project Deliverables */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Deliverables
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {formData.tags.length === 0 && (
              <p className="text-red-400 text-sm mt-2">Please select at least one deliverable</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
            >
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * EditProjectModal Component
 * Handles the editing of existing projects
 * - Pre-fills form with current project data
 * - Allows editing of all project fields
 * - Validates changes before submission
 * - Updates project on confirmation
 */
const EditProjectModal = ({ isOpen, onClose, onEdit, project }: {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
  project: Project | null;
}) => {
  // State to hold the form data
  const [formData, setFormData] = useState<Project | null>(null);

  // Update form data when project changes
  React.useEffect(() => {
    if (project) {
      setFormData(project);
    }
  }, [project]);

  /**
   * Handles toggling of project tags
   * Adds or removes tags from the selection
   */
  const handleTagToggle = (tag: ProjectTag) => {
    if (!formData) return;
    setFormData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tags: prev.tags.includes(tag)
          ? prev.tags.filter(t => t !== tag)
          : [...prev.tags, tag]
      };
    });
  };

  /**
   * Handles form submission
   * Validates required fields and updates project
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    if (formData.tags.length === 0) {
      alert('Please select at least one deliverable');
      return;
    }
    onEdit(formData);
    onClose();
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
              required
            />
          </div>

          {/* Location Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => prev ? { ...prev, city: e.target.value } : null)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                required
                placeholder="e.g. Tel Aviv"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData(prev => prev ? { ...prev, country: e.target.value } : null)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                required
                placeholder="e.g. Israel"
              />
            </div>
          </div>

          {/* Status Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => prev ? { ...prev, status: e.target.value as ProjectStatus } : null)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
            >
              {Object.keys(PROJECT_STATUSES).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => prev ? { ...prev, startDate: e.target.value } : null)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => prev ? { ...prev, dueDate: e.target.value } : null)}
                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
                required
              />
            </div>
          </div>

          {/* Budget Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Budget ($)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData(prev => prev ? { ...prev, budget: Number(e.target.value) } : null)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
              required
              min="0"
            />
          </div>

          {/* Payment Status Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Payment Status
            </label>
            <select
              value={formData.isPaid ? 'paid' : 'unpaid'}
              onChange={(e) => setFormData(prev => prev ? { ...prev, isPaid: e.target.value === 'paid' } : null)}
              className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Project Deliverables */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project Deliverables
            </label>
            <div className="flex flex-wrap gap-2">
              {PROJECT_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {formData.tags.length === 0 && (
              <p className="text-red-400 text-sm mt-2">Please select at least one deliverable</p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * DeleteConfirmationModal Component
 * Displays a confirmation dialog before deleting a project
 * - Shows project name for confirmation
 * - Requires explicit confirmation to delete
 * - Provides option to cancel
 */
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, projectName }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Delete Project</h2>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete the project "{projectName}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ProjectsPage Component
 * Main component for the projects management page
 * - Displays list of all projects
 * - Handles project creation, editing, and deletion
 * - Provides filtering and sorting options
 */
export default function ProjectsPage() {
  // State management
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  /**
   * Handles adding a new project
   */
  const handleAddProject = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  /**
   * Handles editing an existing project
   */
  const handleEditProject = (updatedProject: Project) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  /**
   * Handles deleting a project
   */
  const handleDeleteProject = () => {
    if (!selectedProject) return;
    setProjects(prev =>
      prev.filter(project => project.id !== selectedProject.id)
    );
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects Management</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
        >
          <RiAddLine className="text-xl" />
          Add New Project
        </button>
      </div>

      {/* Projects Table */}
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-6 py-3 text-left">Project</th>
              <th className="px-6 py-3 text-left">Location</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Start Date</th>
              <th className="px-6 py-3 text-left">Due Date</th>
              <th className="px-6 py-3 text-left">Budget</th>
              <th className="px-6 py-3 text-left">Payment</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id} className="border-t border-gray-700">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {project.tags.join(', ')}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {project.city}, {project.country}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${PROJECT_STATUSES[project.status]}`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4">{formatDate(project.startDate)}</td>
                <td className="px-6 py-4">{formatDate(project.dueDate)}</td>
                <td className="px-6 py-4">${project.budget.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    project.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-700 rounded-lg"
                    >
                      <RiEditLine className="text-lg" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-700 rounded-lg text-red-400"
                    >
                      <RiDeleteBinLine className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProject}
      />
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProject(null);
        }}
        onEdit={handleEditProject}
        project={selectedProject}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedProject(null);
        }}
        onConfirm={handleDeleteProject}
        projectName={selectedProject?.name || ''}
      />
    </div>
  );
}