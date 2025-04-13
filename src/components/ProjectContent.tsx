// Create a new file: src/components/ProjectContent.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RiFolderLine, RiVideoLine, RiExternalLinkLine } from 'react-icons/ri';

interface ProjectContentProps {
  project: Project;
}

export default function ProjectContent({ project }: ProjectContentProps) {
  return (
    <div className="space-y-6">
      {/* Video Section */}
      {project.videoLink && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <RiVideoLine className="text-blue-400" />
            Project Video
          </h2>
          <div className="aspect-video relative">
            <iframe
              src={project.videoLink}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Folder Link Section */}
      {project.folderShareLink && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <RiFolderLine className="text-yellow-400" />
            Project Files
          </h2>
          <a
            href={project.folderShareLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Open Project Folder</span>
            <RiExternalLinkLine />
          </a>
        </div>
      )}
    </div>
  );
}