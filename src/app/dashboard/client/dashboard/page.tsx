'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Project, 
  ProjectTag,
  PROJECT_TIERS, 
  PROJECT_STATUSES, 
  MOCK_PROJECTS 
} from '@/lib/mockData';
import { formatDate } from '@/lib/utils/date';

type ProjectTier = keyof typeof PROJECT_TIERS;

function getCurrentTier(projectCount: number): ProjectTier {
  const tier = Object.entries(PROJECT_TIERS).find(
    ([_, { min, max }]) => projectCount >= min && projectCount <= max
  )?.[0] as ProjectTier;
  
  return tier || 'Bronze';
}

function ClientDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  useEffect(() => {
    if (projects.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % projects.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [projects]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="glass-effect p-8 rounded-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-950">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-xl h-24 mb-16 relative overflow-visible">
          {/* Client Logo Circle */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-black border-4 border-gray-800 shadow-2xl flex items-center justify-center">
              <img 
                src="/Benshalom.svg" 
                alt="Ben Shalom Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Header Content */}
          <div className="h-full flex justify-between items-center px-6">
            {/* Left Side - FORMAX and Name */}
            <div className="flex flex-col items-start">
              <span className="text-sm md:text-lg text-gray-400">FORMAX</span>
              <span className="text-lg md:text-2xl font-bold">Ben Shalom</span>
            </div>

            {/* Right Side - Project Count */}
            <div className="flex flex-col items-center">
              <span className="text-sm text-gray-400">Projects Done</span>
              <div className="flex items-center gap-3">
                <span 
                  className="text-3xl font-bold" 
                  style={{ color: PROJECT_TIERS[getCurrentTier(projects.length)].color.split(' ')[1].replace('to-[', '').replace(']', '') }}
                >
                  {projects.length}
                </span>
                <motion.button
                  onClick={() => setIsTierModalOpen(true)}
                  className="px-3 py-1 rounded-full bg-gray-800/80 backdrop-blur-sm
                            hover:bg-gray-700/80 transition-all duration-300
                            border border-gray-700/30 shadow-lg text-xs"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-gray-300">Next Tier</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Project Status Table */}
        <div className="relative mb-16">
          <div className="glass-effect rounded-xl">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-normal">Project Name</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-normal">Status</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-normal">Updated</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-normal">Payment</th>
                </tr>
              </thead>
            </table>

            <AnimatePresence>
              {isTableOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -20 }}
                  animate={{ height: "auto", opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -10 }}
                  transition={{ duration: 0.01 }}
                >
                  <table className="w-full">
                    <tbody>
                      {projects.map((project) => (
                        <tr 
                          key={project.id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors cursor-pointer"
                          onClick={() => router.push(`/dashboard/client/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`)}
                        >
                          <td className="py-4 px-4">{project.name}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${PROJECT_STATUSES[project.status]} inline-block`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-400">
                            {formatDate(project.lastUpdate)}
                          </td>
                          <td className="py-4 px-4">
                            {project.isPaid ? (
                              <span className="px-3 py-1 rounded-full text-sm bg-emerald-900/50 text-emerald-200 inline-block">
                                Paid
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-sm bg-red-900/50 text-red-200 inline-block">
                                Unpaid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Toggle Button */}
            <div className="flex justify-center relative z-50">
              <motion.button
                onClick={() => setIsTableOpen(!isTableOpen)}
                className="absolute -bottom-6 px-6 py-2 rounded-full bg-gray-800/80 backdrop-blur-sm
                          hover:bg-gray-700/80 transition-all duration-300
                          border border-gray-700/30 shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm text-gray-300">
                  {isTableOpen ? "Close" : "More Details"}
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <motion.div
          animate={{ y: isTableOpen ? 20 : 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="project-card group"
            >
              <div 
                className="aspect-video relative overflow-hidden cursor-pointer"
                onClick={() => router.push(`/dashboard/client/projects/${project.name.toLowerCase().replace(/\s+/g, '-')}`)}
              >
                <motion.img
                  src={project.thumbnailUrl}
                  alt={project.name}
                  className="project-image w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <div className="project-overlay absolute inset-0">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex gap-2 mb-2 pointer-events-none">
                      {project.tags.map((tag, i) => (
                        <motion.span
                          key={i}
                          className="glass-tag text-white text-sm px-3 py-1 rounded-full"
                          initial={{ opacity: 0.8 }}
                          whileHover={{ opacity: 1 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                    </div>
                    <h3 
                      className="font-bold text-lg text-white mb-1 opacity-90 group-hover:opacity-100 hover:underline cursor-pointer"
                      onClick={(e) => {
  e.stopPropagation();
  router.push(`/dashboard/client/projects/${project.id}`);
}}
                    >
                      {project.name}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-opacity-90">
                <div className="flex flex-col space-y-2">
                  <span className={`glass-tag px-3 py-1 rounded-full text-sm ${PROJECT_STATUSES[project.status]} text-white inline-block w-fit pointer-events-none`}>
                    {project.status}
                  </span>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-1">Last updated:</span>
                    {formatDate(project.lastUpdate)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom Slideshow */}
        <div className="glass-effect rounded-xl p-6">
          <div className="slideshow-container">
            {projects.length > 0 && (
              <motion.img
                key={currentSlide}
                src={projects[currentSlide]?.thumbnailUrl || '/placeholder.jpg'}
                alt="Project Preview"
                className="slideshow-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>
        </div>

        {/* Tiers Modal */}
        {isTierModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div 
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsTierModalOpen(false)}
            />
            <div className="relative glass-effect rounded-xl p-6 max-w-md w-full mx-4">
              <button 
                onClick={() => setIsTierModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h3 className="text-xl font-bold mb-6 text-white">Project Tiers</h3>
              
              <div className="space-y-4">
                {Object.entries(PROJECT_TIERS).map(([tier, { min, max, color }]) => (
                  <div 
                    key={tier}
                    className={`p-4 rounded-lg transition-all duration-300 ${
                      getCurrentTier(projects.length) === tier 
                        ? 'bg-gray-800/50 border border-gray-700/50' 
                        : 'hover:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span 
                        className="font-semibold text-white" 
                        style={{ color: color.split(' ')[1].replace('to-[', '').replace(']', '') }}
                      >
                        {tier}
                      </span>
                      <span className="text-sm text-gray-300">
                        {max === Infinity ? `${min}+ Projects` : `${min}-${max} Projects`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDashboard;