'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { IoSearch, IoClose, IoMail, IoCall, IoGlobe, IoCamera, IoPencil } from 'react-icons/io5';
import { Project } from '@/types';
import { MOCK_PROJECTS, PROJECT_STATUSES } from '@/lib/mockData';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// Mock studio data - In real app, this would come from your API/database
const MOCK_STUDIO = {
  id: 'studio-1',
  name: 'Creative Studio',
  logo: '/studio-logo.png',
  website: 'www.creativestudio.com',
  email: 'contact@creativestudio.com',
  phone: '+1 (555) 123-4567',
  description: 'A creative studio specializing in digital content and animations.',
  contactName: 'John Smith'
};

// Mock client data - In real app, this would come from your API/database
const MOCK_CLIENT = {
  id: 'client-1',
  name: 'Shalom Architects',
  logo: '/client-logo.png',
  coverImage: 'https://picsum.photos/1920/400',
  projectsCount: 12,
  totalAssets: 48,
  website: 'shalomarchitects.com',
  lastActive: new Date(),
};

function StudioDetailsModal({ isOpen, onClose, studio }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1A1D23] rounded-xl p-6 max-w-md w-full mx-4 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <IoClose size={24} />
        </button>

        {/* Studio Logo - Centered */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-white mb-4">
            <Image
              src={studio.logo}
              alt={studio.name}
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
          <h3 className="text-xl font-semibold text-center">{studio.name}</h3>
          <p className="text-sm text-gray-400 text-center mt-1">{studio.description}</p>
          <p className="text-sm font-medium text-blue-400 mt-2">Contact: {studio.contactName}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-gray-300">
            <IoGlobe className="text-gray-400 shrink-0" size={20} />
            <a href={`https://${studio.website}`} target="_blank" rel="noopener noreferrer" 
               className="hover:text-blue-400 transition-colors">
              {studio.website}
            </a>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <IoMail className="text-gray-400 shrink-0" size={20} />
            <a href={`mailto:${studio.email}`} className="hover:text-blue-400 transition-colors">
              {studio.email}
            </a>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <IoCall className="text-gray-400 shrink-0" size={20} />
            <a href={`tel:${studio.phone}`} className="hover:text-blue-400 transition-colors">
              {studio.phone}
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ImageCropModal({ 
  isOpen, 
  onClose, 
  image, 
  onSave, 
  aspectRatio = undefined, 
  circular = false,
  studioId,
  clientId 
}: { 
  isOpen: boolean;
  onClose: () => void;
  image: string;
  onSave: (url: string) => void;
  aspectRatio?: number;
  circular?: boolean;
  studioId: string;
  clientId: string;
}) {
  const [crop, setCrop] = useState({
    unit: '%' as const,
    width: circular ? 60 : 90,
    height: circular ? 60 : 28.125,
    x: 20,
    y: 20,
    aspect: circular ? 1 : aspectRatio
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = React.useRef(null);
  const [scale, setScale] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Update currentImage when image prop changes
  useEffect(() => {
    if (image) {
      setCurrentImage(image);
      setImagePosition({ x: 0, y: 0 });
    }
  }, [image]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setCurrentImage(event.target.result);
          setImagePosition({ x: 0, y: 0 });
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setImagePosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault(); // Prevent page scrolling
    const delta = -e.deltaY / 1000; // Normalize the scroll delta
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.min(Math.max(0.5, newScale), 2); // Clamp between 0.5 and 2
    });
  };

  const handleSave = useCallback(async () => {
    if (!imgRef.current) {
      console.error('No image available');
      return;
    }

    setIsUploading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const image = imgRef.current;

      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }

      // Set dimensions for the logo (square for circular crop)
      const size = 512; // High resolution for logo
      canvas.width = size;
      canvas.height = size;

      // Enable high-quality image rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Get the container and image dimensions
      const container = image.parentElement;
      const containerRect = container.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();

      // Calculate the visible area within the crop region
      const cropArea = container.querySelector('.crop-area');
      const cropRect = cropArea.getBoundingClientRect();

      // Calculate the scale factor between the natural image size and the displayed size
      const scaleFactorX = image.naturalWidth / imageRect.width;
      const scaleFactorY = image.naturalHeight / imageRect.height;

      // Calculate the source coordinates in the original image
      const sourceX = (cropRect.left - imageRect.left) * scaleFactorX / scale;
      const sourceY = (cropRect.top - imageRect.top) * scaleFactorY / scale;
      const sourceWidth = cropRect.width * scaleFactorX / scale;
      const sourceHeight = cropRect.height * scaleFactorY / scale;

      // Create a circular mask
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw the image with the correct position and scale
      ctx.drawImage(
        image,
        Math.max(0, sourceX),
        Math.max(0, sourceY),
        Math.min(image.naturalWidth, sourceWidth),
        Math.min(image.naturalHeight, sourceHeight),
        0,
        0,
        size,
        size
      );

      // Convert canvas to blob with maximum quality
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.95 // High quality JPEG
        );
      });

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', blob, 'logo.jpg');
      formData.append('studioId', studioId);
      formData.append('clientId', clientId);

      // Upload to S3 through our API endpoint
      const response = await fetch('/studio/api/upload/client-logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      if (data.success && data.url) {
        onSave(data.url);
        onClose();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error saving image:', error);
      alert(error instanceof Error ? error.message : 'Failed to save image');
    } finally {
      setIsUploading(false);
    }
  }, [onClose, onSave, studioId, clientId, scale]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1A1D23] rounded-xl p-6 max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit Logo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <IoClose size={24} />
          </button>
        </div>
        
        <div className="flex gap-4 mb-4">
          <label className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer text-center">
            <span>Upload New Logo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
          <button
            onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Zoom Out
          </button>
          <button
            onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            Zoom In
          </button>
        </div>

        <div 
          className={`relative overflow-hidden bg-gray-900 flex items-center justify-center ${circular ? 'aspect-square' : 'h-[60vh]'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white">Processing and uploading logo...</p>
              </div>
            </div>
          ) : null}
          <img
            ref={imgRef}
            src={currentImage}
            className="absolute max-h-full max-w-full object-contain"
            alt="Crop preview"
            style={{
              transform: `scale(${scale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
              transformOrigin: 'center',
              cursor: isDragging ? 'grabbing' : 'grab',
              imageRendering: 'crisp-edges'
            }}
            draggable={false}
          />
          <div 
            className="absolute border-2 border-blue-500 pointer-events-none crop-area"
            style={{
              width: circular ? '70%' : `${crop.width}%`,
              height: circular ? '70%' : `${crop.height}%`,
              left: circular ? '15%' : `${crop.x}%`,
              top: circular ? '15%' : `${crop.y}%`,
              zIndex: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              borderRadius: circular ? '50%' : '0',
              aspectRatio: circular ? '1' : '16/5'
            }}
          />
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            disabled={isUploading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors flex items-center gap-2"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { studioId, clientId } = params;
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [clientData, setClientData] = useState(MOCK_CLIENT);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropType, setCropType] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setCropType(type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setCurrentImage(event.target.result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditCover = () => {
    setCropType('cover');
    setCurrentImage(clientData.coverImage);
    setIsCropModalOpen(true);
  };

  const handleCropSave = (croppedImageUrl) => {
    if (cropType === 'cover') {
      setClientData(prev => ({ ...prev, coverImage: croppedImageUrl }));
    } else if (cropType === 'logo') {
      setClientData(prev => ({ ...prev, logo: croppedImageUrl }));
    }
    setIsCropModalOpen(false);
  };

  useEffect(() => {
    const clientProjects = MOCK_PROJECTS.filter(project => project.clientId === clientId);
    setProjects(clientProjects);
    setIsLoading(false);
  }, [clientId]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0A0C10]">
        {/* Client Hero Header */}
        <div className="relative">
          {/* Background Image with Overlay */}
          <div className="h-[280px] relative group">
            <Image
              src={clientData.coverImage}
              alt="Client Cover"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0A0C10]" />
            
            <button
              onClick={handleEditCover}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <IoCamera size={20} />
                <span>Edit Cover Photo</span>
              </div>
            </button>
          </div>

          {/* Client Info */}
          <div className="absolute bottom-0 left-0 right-0 px-8">
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-6">
                {/* Client Logo */}
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 bg-[#1A1D23] shadow-2xl">
                    <Image
                      src={clientData.logo}
                      alt={clientData.name}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
                    <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full">
                      <IoCamera size={24} className="text-white" />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'logo')}
                    />
                  </label>
                </div>
                {/* Client Details */}
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{clientData.name}</h1>
                  <div className="flex items-center gap-6 text-gray-300">
                    <a 
                      href={`https://${clientData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors text-sm"
                    >
                      {clientData.website}
                    </a>
                    <span className="text-sm">
                      Last active: {new Date(clientData.lastActive).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{clientData.projectsCount}</div>
                  <div className="text-sm text-gray-400">Projects</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">All Projects</h2>
              <span className="text-sm text-gray-400">
                Showing {filteredProjects.length} projects
              </span>
            </div>
            <div className="relative w-full sm:w-96">
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-3 bg-[#1A1D23] rounded-xl border border-gray-800 focus:outline-none focus:border-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Projects Grid - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                className="bg-[#1A1D23] rounded-xl overflow-hidden cursor-pointer flex flex-col"
                onClick={() => router.push(`/studio/${studioId}/client/${clientId}/projects/${project.id}`)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                {/* Hero Section (70%) */}
                <div className="relative h-[280px] sm:h-[350px] md:h-[280px]">
                  <Image
                    src={project.thumbnailUrl}
                    alt={project.name}
                    fill
                    className="object-cover"
                  />
                  {/* Project Tags Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                    <div className="flex flex-wrap gap-2">
                      {project.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full text-xs bg-gray-800/50 text-gray-300 backdrop-blur-sm"
                        >
                          {tag.type}
                        </span>
                      ))}
                    </div>
                  </div>
                  {/* Studio Info Overlay */}
                  <div className="absolute top-4 left-4 flex flex-col">
                    <span className="text-xs font-bold text-white mb-1">{MOCK_STUDIO.name}</span>
                    <div className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                      <span className="text-xs text-gray-300">studio.website.com</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-[200px]">
                  {/* Project Info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{project.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${PROJECT_STATUSES[project.status]}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="text-sm text-gray-400 mb-1">
                        Last Active: {new Date(project.lastUpdate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        Assets: {project.files?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                    <button 
                      className="flex items-center justify-center py-3 px-6 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/studio/${studioId}/client/${clientId}/projects/${project.id}`);
                      }}
                    >
                      View Project
                    </button>
                    <button 
                      className="flex items-center justify-center py-3 px-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsStudioModalOpen(true);
                      }}
                    >
                      Studio Info
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="bg-[#1A1D23] rounded-xl p-8 text-center border border-gray-800">
              <h3 className="text-xl font-medium mb-2">No Projects Found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try adjusting your search query' : 'No projects have been created yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Crop Modal */}
      <AnimatePresence>
        {isCropModalOpen && (
          <ImageCropModal
            isOpen={isCropModalOpen}
            onClose={() => setIsCropModalOpen(false)}
            image={currentImage}
            onSave={handleCropSave}
            aspectRatio={cropType === 'logo' ? 1 : 16/5}
            circular={cropType === 'logo'}
            studioId={studioId as string}
            clientId={clientId as string}
          />
        )}
        {isStudioModalOpen && (
          <StudioDetailsModal
            isOpen={isStudioModalOpen}
            onClose={() => setIsStudioModalOpen(false)}
            studio={MOCK_STUDIO}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default ClientDashboardPage; 