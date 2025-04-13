'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { IoChevronBack, IoChevronForward, IoClose, IoDownload, IoArrowBack } from 'react-icons/io5';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Project, ProjectFile } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mockData';

function ProjectViewerPage() {
  const router = useRouter();
  const params = useParams();
  const { studioId, clientId, projectId } = params;
  
  const [selectedImage, setSelectedImage] = useState<ProjectFile | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    // In a real app, fetch project data
    const foundProject = MOCK_PROJECTS.find(p => p.id === projectId);
    if (foundProject) {
      setProject(foundProject);
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="glass-effect rounded-xl p-6">
            <h1 className="text-2xl">Project not found</h1>
          </div>
        </div>
      </div>
    );
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  const downloadProject = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const zip = new JSZip();
      const files = project.files;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await fetch(file.url);
        const blob = await response.blob();
        
        const folder = zip.folder(file.type) as JSZip;
        folder.file(file.title, blob);
        
        setDownloadProgress(((i + 1) / files.length) * 100);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' }, 
        (metadata) => {
          setDownloadProgress(metadata.percent);
        }
      );
      
      saveAs(zipBlob, `${project.name}_project.zip`);
    } catch (error) {
      console.error('Error downloading project:', error);
      alert('Error downloading project');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const navigateImages = (direction: 'next' | 'prev') => {
    if (!selectedImage) return;
    
    const currentIndex = project.files.findIndex(file => file.url === selectedImage.url);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex === project.files.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? project.files.length - 1 : currentIndex - 1;
    }
    
    setSelectedImage(project.files[newIndex]);
    setSelectedImageIndex(newIndex);
  };

  const videoFiles = project.files.filter(file => file.type === 'video');
  const imageFiles = project.files.filter(file => file.type === 'image');
  const aerialFiles = project.files.filter(file => file.type === 'aerial');

  return (
    <>
      <div className="min-h-screen bg-[#0A0C10]">
        <div className="max-w-[1920px] mx-auto">
          {/* Back to Projects button */}
          <motion.button
            className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#1A1D23] transition-colors bg-[#1A1D23]/80 backdrop-blur-sm"
            onClick={() => router.push(`/studio/${studioId}/client/${clientId}/projects`)}
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <IoArrowBack className="w-5 h-5" />
            <span>Back to Projects</span>
          </motion.button>

          {/* Project Title - Fixed at top */}
          <div className="fixed top-4 right-4 z-50 bg-[#1A1D23]/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-400">
                Projects / {project.name}
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  <div className="flex gap-2 items-center text-gray-400 text-sm">
                    <span>Status: {project.status}</span>
                    <span>•</span>
                    <span>Updated: {new Date(project.lastUpdate).toLocaleDateString('en-US')}</span>
                  </div>
                </div>
                <button 
                  className="px-6 py-2 bg-[#1A1D23] rounded-full hover:bg-[#1F2228] transition-all flex items-center gap-2 disabled:opacity-50"
                  onClick={downloadProject}
                  disabled={isDownloading}
                >
                  <IoDownload className="w-5 h-5" />
                  <span>{isDownloading ? 'Downloading...' : 'Download All'}</span>
                </button>
              </div>
            </div>

            {isDownloading && (
              <div className="mt-4">
                <div className="w-full bg-[#1A1D23] rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  {Math.round(downloadProgress)}% Complete
                </div>
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="pt-24">
            {/* Video Section - Full Width */}
            {videoFiles.length > 0 && (
              <div className="w-full mb-12">
                <div className="relative w-full aspect-video">
                  <video 
                    controls 
                    className="w-full h-full object-cover"
                    poster={videoFiles[0].thumbnail}
                  >
                    <source src={videoFiles[0].url} type="video/mp4" />
                  </video>
                </div>
              </div>
            )}

            {/* Image Gallery - Larger Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
              {imageFiles.map((file, index) => (
                <motion.div
                  key={index}
                  className="relative cursor-pointer overflow-hidden rounded-xl bg-[#1A1D23] group"
                  onClick={() => {
                    setSelectedImage(file);
                    setSelectedImageIndex(index);
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="aspect-[4/3] relative">
                    <Image
                      src={file.url}
                      alt={file.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm text-white font-light text-left" dir="ltr">
                        {file.title}
                      </h3>
                      <button
                        className="p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadFile(file.url, file.title);
                        }}
                      >
                        <IoDownload className="w-4 h-4 text-white/80" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Additional Materials Buttons */}
          {(project.hasAerialFootage || project.hasAdditionalMaterials) && (
            <div className="flex gap-4 mb-8">
              {aerialFiles.length > 0 && (
                <button className="bg-[#1A1D23] px-6 py-3 rounded-xl hover:bg-[#1F2228] transition-all flex items-center gap-2">
                  <span>Aerial Footage</span>
                  <span className="bg-[#1F2228] px-2 py-1 rounded-full text-sm">
                    {aerialFiles.length}
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Enlarged Image View */}
          {selectedImage && (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop"
                onClick={(e) => {
                  if ((e.target as HTMLElement).classList.contains('backdrop')) {
                    setSelectedImage(null);
                  }
                }}
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="relative w-[98vw] h-[98vh] flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.title}
                    fill
                    className="object-contain"
                    sizes="98vw"
                    quality={100}
                  />
                  
                  <button 
                    className="absolute left-4 top-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadFile(selectedImage.url, selectedImage.title);
                    }}
                  >
                    <IoDownload className="w-6 h-6 text-white/80" />
                  </button>

                  <button 
                    className="absolute left-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImages('prev');
                    }}
                  >
                    <IoChevronBack className="w-6 h-6 text-white/80" />
                  </button>
                  
                  <button 
                    className="absolute right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateImages('next');
                    }}
                  >
                    <IoChevronForward className="w-6 h-6 text-white/80" />
                  </button>

                  <button 
                    className="absolute right-4 top-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                    }}
                  >
                    <IoClose className="w-6 h-6 text-white/80" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full">
                    <h3 className="text-sm text-white/80 font-light" dir="ltr">
                      {selectedImage.title}
                    </h3>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
}

export default ProjectViewerPage; 