'use client';

import React, { useCallback, useState, useEffect, useRef, DragEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/types';
import { RiCloseLine, RiImageLine, RiVideoLine, RiUploadCloud2Line, RiDragMove2Line, RiArrowLeftLine, RiHomeLine, RiArrowRightLine } from 'react-icons/ri';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Cookies from 'js-cookie';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-hot-toast';
import { Player } from 'lottie-react';
import Image from 'next/image';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const AUTOSAVE_DELAY = 3000; // 3 seconds

interface UploadProgress {
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  message?: string;
}

interface PhotoName {
  [key: string]: string;
}

export default function MediaPage() {
  const router = useRouter();
  const params = useParams();
  const { clientId, projectId } = params;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroPhoto, setHeroPhoto] = useState<File | null>(null);
  const [heroPhotoUrl, setHeroPhotoUrl] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({});
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: UploadProgress }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoNames, setPhotoNames] = useState<PhotoName>({});
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [tempName, setTempName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load project data and saved progress
  useEffect(() => {
    const loadProject = () => {
      // Load project from localStorage
      const savedProjects = localStorage.getItem('projects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      const currentProject = projects.find((p: Project) => p.id === projectId);
      
      if (!currentProject) {
        router.push('/studio/dashboard/clients/' + clientId + '/projects');
        return;
      }

      setProject(currentProject);

      // Load saved progress from cookies
      const savedProgress = Cookies.get(`project_media_${projectId}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        setPhotoUrls(progress.photoUrls || {});
        setUploadStatus(progress.uploadStatus || {});
      }

      setLoading(false);
    };

    loadProject();
  }, [projectId, clientId, router]);

  // Save progress to cookies
  useEffect(() => {
    if (project) {
      Cookies.set(`project_media_${projectId}`, JSON.stringify({
        photoUrls,
        uploadStatus
      }), { expires: 7 }); // Save for 7 days
    }
  }, [photoUrls, uploadStatus, projectId, project]);

  // Auto-save effect
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      handleSave(true);
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [hasChanges, photoUrls, heroPhoto, video]);

  // Keyboard shortcuts
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    handleSave();
  });

  useHotkeys('esc', () => {
    router.push(`/studio/dashboard/clients/${clientId}/projects/${projectId}`);
  });

  const validateFile = (file: File): boolean => {
    // Remove size validation
    return true;
  };

  const simulateUpload = async (id: string, file: File) => {
    setUploadStatus(prev => ({
      ...prev,
      [id]: { progress: 0, status: 'uploading' }
    }));

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUploadStatus(prev => ({
        ...prev,
        [id]: { progress, status: 'uploading' }
      }));
    }

    setUploadStatus(prev => ({
      ...prev,
      [id]: { progress: 100, status: 'completed' }
    }));
  };

  const onHeroDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setHeroPhoto(file);
      setHeroPhotoUrl(URL.createObjectURL(file));
      simulateUpload('hero', file);
      setHasChanges(true);
    }
  }, []);

  const onVideoDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setVideo(file);
      setVideoUrl(URL.createObjectURL(file));
      simulateUpload('video', file);
      setHasChanges(true);
    }
  }, []);

  const onPhotoDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const newPhotos = [...photos, ...acceptedFiles];
    setPhotos(newPhotos);
    
    // Create URLs for new photos
    const newUrls: { [key: string]: string } = {};
    acceptedFiles.forEach((file, index) => {
      const id = `photo-${photos.length + index}`;
      newUrls[id] = URL.createObjectURL(file);
      simulateUpload(id, file);
    });
    setPhotoUrls(prev => ({ ...prev, ...newUrls }));
    setHasChanges(true);
  }, [photos]);

  const handleSave = async (isAutoSave = false) => {
    setIsSaving(true);
    try {
      // Prepare media data
      const mediaData = {
        heroPhoto: heroPhotoUrl,
        videos: videoUrl ? [{
          id: 'video-1',
          title: 'Project Video',
          url: videoUrl,
          type: 'video'
        }] : [],
        photos: photos.map((photo, index) => ({
          id: `photo-${index}`,
          title: photoNames[`photo-${index}`] || `Photo ${index + 1}`,
          url: photoUrls[`photo-${index}`],
          type: 'image',
          order: index
        }))
      };

      // Update project in localStorage
      const savedProjects = localStorage.getItem('projects');
      const projects = savedProjects ? JSON.parse(savedProjects) : [];
      const projectIndex = projects.findIndex((p: Project) => p.id === projectId);
      
      if (projectIndex !== -1) {
        projects[projectIndex] = {
          ...projects[projectIndex],
          ...mediaData
        };
        localStorage.setItem('projects', JSON.stringify(projects));
      }

      if (!isAutoSave) {
        toast.success('Changes saved successfully');
        router.push(`/studio/dashboard/clients/${clientId}/projects/${projectId}`);
      } else {
        toast.success('Auto-saved');
        setHasChanges(false);
      }
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const removeHero = () => {
    setHeroPhoto(null);
    if (heroPhotoUrl) {
      URL.revokeObjectURL(heroPhotoUrl);
      setHeroPhotoUrl(null);
    }
  };

  const removeVideo = () => {
    setVideo(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = prev.filter((_, i) => i !== index);
      // Update photoUrls to match the new order
      setPhotoUrls(prevUrls => {
        const newUrls: { [key: string]: string } = {};
        newPhotos.forEach((_, i) => {
          newUrls[`photo-${i}`] = prevUrls[`photo-${i}`];
        });
        return newUrls;
      });
      return newPhotos;
    });
  };

  // Handle drag start
  const handleDragStart = (index: number, e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    
    // Create a thumbnail-sized drag image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    // Set canvas size to match our thumbnail size
    canvas.width = 200;
    canvas.height = 112;
    
    img.onload = () => {
      if (ctx) {
        // Draw image at thumbnail size
        ctx.drawImage(img, 0, 0, 200, 112);
        const thumbnail = new Image();
        thumbnail.src = canvas.toDataURL();
        e.dataTransfer.setDragImage(thumbnail, 0, 0);
      }
    };
    
    img.src = photoUrls[`photo-${index}`];
    setDraggedItem(index);
  };
  
  // Handle drag over
  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedItem === null) return;
    setDraggedOverItem(index);
  };
  
  // Handle drop to reorder
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedItem === null || draggedOverItem === null || draggedItem === draggedOverItem) {
      setDraggedItem(null);
      setDraggedOverItem(null);
      return;
    }
    
    // Update photos array
    setPhotos(prevPhotos => {
      const newPhotos = [...prevPhotos];
      const [draggedPhoto] = newPhotos.splice(draggedItem, 1);
      newPhotos.splice(draggedOverItem, 0, draggedPhoto);
      return newPhotos;
    });

    // Update both URLs and names
    setPhotoUrls(prevUrls => {
      const newUrls = { ...prevUrls };
      const draggedUrl = prevUrls[`photo-${draggedItem}`];
      
      // If moving forward, shift all URLs in between back by one
      if (draggedItem < draggedOverItem) {
        for (let i = draggedItem; i < draggedOverItem; i++) {
          newUrls[`photo-${i}`] = prevUrls[`photo-${i + 1}`];
        }
      }
      // If moving backward, shift all URLs in between forward by one
      else {
        for (let i = draggedItem; i > draggedOverItem; i--) {
          newUrls[`photo-${i}`] = prevUrls[`photo-${i - 1}`];
        }
      }
      
      // Place dragged URL in its new position
      newUrls[`photo-${draggedOverItem}`] = draggedUrl;
      
      return newUrls;
    });

    // Update photo names in the same way
    setPhotoNames(prevNames => {
      const newNames = { ...prevNames };
      const draggedName = prevNames[`photo-${draggedItem}`];
      
      // If moving forward, shift all names in between back by one
      if (draggedItem < draggedOverItem) {
        for (let i = draggedItem; i < draggedOverItem; i++) {
          newNames[`photo-${i}`] = prevNames[`photo-${i + 1}`];
        }
      }
      // If moving backward, shift all names in between forward by one
      else {
        for (let i = draggedItem; i > draggedOverItem; i--) {
          newNames[`photo-${i}`] = prevNames[`photo-${i - 1}`];
        }
      }
      
      // Place dragged name in its new position
      newNames[`photo-${draggedOverItem}`] = draggedName;
      
      return newNames;
    });
    
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  const { getRootProps: getHeroProps, getInputProps: getHeroInputProps, isDragActive: isHeroDragging } = useDropzone({
    onDrop: onHeroDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: 1,
    multiple: false
  });

  const { getRootProps: getVideoProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragging } = useDropzone({
    onDrop: onVideoDrop,
    accept: { 'video/*': ['.mp4', '.mov', '.avi'] },
    maxFiles: 1
  });

  const { getRootProps: getPhotoProps, getInputProps: getPhotoInputProps, isDragActive: isPhotosDragging } = useDropzone({
    onDrop: onPhotoDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] }
  });

  // Add this function to handle name editing
  const handleNameEdit = (index: number) => {
    setEditingNameIndex(index);
    setTempName(photoNames[`photo-${index}`] || `Photo ${index + 1}`);
    // Focus the input on next render
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 0);
  };

  // Add this function to save the name
  const handleNameSave = (index: number) => {
    if (tempName.trim()) {
      setPhotoNames(prev => ({
        ...prev,
        [`photo-${index}`]: tempName.trim()
      }));
    }
    setEditingNameIndex(null);
  };

  // Add this function to handle key press
  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handleNameSave(index);
    } else if (e.key === 'Escape') {
      setEditingNameIndex(null);
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">WeShow</h1>
        <div className="flex gap-4">
          <Link href="/login" className="text-white">Log in</Link>
          <Link href="/signup" className="text-white">Sign up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="bg-gradient-to-br dark:from-white from-black from-30% dark:to-white/40 to-black/40 bg-clip-text py-6 text-5xl font-medium leading-none tracking-tighter text-transparent text-balance sm:text-6xl md:text-7xl lg:text-8xl translate-y-[-1rem] animate-fade-in opacity-0 [--animation-delay:200ms]">
          WeShow is the new way<br />to showcase your work.
        </h1>
        <p className="text-xl mb-8">Beautifully designed, animated components and templates built with Tailwind CSS, React, and Framer Motion.</p>
        <Link href="/get-started" className="bg-blue-500 text-white px-6 py-3 rounded-full inline-flex items-center">
          Get Started for free <RiArrowRightLine className="ml-2" />
        </Link>
      </section>

      {/* Image with Glow Effect */}
      <div className="flex justify-center py-10">
        <div className="relative">
          <Image src="/placeholder-image.png" alt="Showcase" width={600} height={400} className="rounded-lg shadow-lg" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 rounded-lg blur-lg"></div>
        </div>
      </div>

      <div className="max-w-[1490px] mx-auto px-5 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/studio/dashboard/clients/${clientId}/projects/${projectId}`}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs text-white/40 hover:text-white"
            >
              <RiArrowLeftLine className="w-3.5 h-3.5" />
              <span>Back to Project</span>
            </Link>
            <h1 className="text-2xl font-light text-white">{project.name} - Media</h1>
          </div>
        </div>

        {/* Hero and Video Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hero Photo Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-light text-white">Hero Photo</h3>
              {uploadStatus.hero && (
                <div className="text-xs text-white/40">
                  {uploadStatus.hero.status === 'uploading' ? `${uploadStatus.hero.progress}%` : '✓'}
                </div>
              )}
            </div>
            <div
              {...getHeroProps()}
              className={`
                relative p-[1px] cursor-pointer before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0
                ${isHeroDragging ? 'before:border-white/40 after:border-white/40' : ''}
              `}
            >
              <div className={`
                aspect-video bg-[#0A0A0A] relative group border border-white/10
                ${isHeroDragging ? 'border-white/40' : ''}
              `}>
                <input {...getHeroInputProps()} />
                {heroPhoto ? (
                  <>
                    <img
                      src={heroPhotoUrl || ''}
                      alt="Hero preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        removeHero();
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={removeHero}
                      className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                    <RiImageLine className="w-12 h-12 mb-2" />
                    <p className="text-xs">Drop hero photo here, or click to select</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-light text-white">Project Video</h3>
              {uploadStatus.video && (
                <div className="text-xs text-white/40">
                  {uploadStatus.video.status === 'uploading' ? `${uploadStatus.video.progress}%` : '✓'}
                </div>
              )}
            </div>
            <div
              {...getVideoProps()}
              className={`
                relative p-[1px] cursor-pointer before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0
                ${isVideoDragging ? 'before:border-white/40 after:border-white/40' : ''}
              `}
            >
              <div className={`
                aspect-video bg-[#0A0A0A] relative group border border-white/10
                ${isVideoDragging ? 'border-white/40' : ''}
              `}>
                <input {...getVideoInputProps()} />
                {video ? (
                  <>
                    <video
                      src={videoUrl || ''}
                      className="w-full h-full object-cover"
                      controls
                    />
                    <button
                      onClick={removeVideo}
                      className="absolute top-2 right-2 text-white/40 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <RiCloseLine className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                    <RiVideoLine className="w-12 h-12 mb-2" />
                    <p className="text-xs">Drop video here, or click to select</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Photos Section */}
        <div className="space-y-2">
          <h3 className="text-sm font-light text-white">Additional Photos</h3>
          <div className="border border-white/10 bg-[#0A0A0A] rounded-lg overflow-hidden">
            <div
              className="p-4"
            >
              <div
                className="grid grid-cols-5 gap-4 auto-rows-[160px]"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files.length > 0) {
                    onPhotoDrop(Array.from(e.dataTransfer.files));
                  } else {
                    handleDrop(e);
                  }
                }}
              >
                {photos.length === 0 ? (
                  <div
                    {...getPhotoProps()}
                    className="col-span-5 h-[160px] flex flex-col items-center justify-center text-white/20 border border-dashed border-white/10 rounded-lg"
                  >
                    <input {...getPhotoInputProps()} />
                    <RiImageLine className="w-12 h-12 mb-2" />
                    <p className="text-xs">Drop photos here, or click to select</p>
                  </div>
                ) : (
                  <>
                    {photos.map((photo, index) => (
                      <div
                        key={`photo-${index}`}
                        className={`w-full h-full bg-[#0A0A0A] rounded-lg overflow-hidden shadow-lg border relative group cursor-move
                          ${draggedItem === index ? 'opacity-50 border-white/40' : 'border-white/10'}
                          ${draggedOverItem === index ? 'border-white border-2' : ''}
                        `}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(index, e)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={() => {
                          setDraggedItem(null);
                          setDraggedOverItem(null);
                        }}
                        style={{ transform: 'translate(0, 0)' }}
                      >
                        <img
                          src={photoUrls[`photo-${index}`]}
                          alt=""
                          className="w-full h-full object-cover pointer-events-none"
                          draggable={false}
                          style={{ transform: 'translate(0, 0)' }}
                        />

                        {/* Gradient overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        {/* Controls and filename */}
                        <div className="absolute inset-x-0 bottom-0 pb-[7px] px-2 flex items-center justify-between">
                          {/* Filename with edit icon */}
                          <div className="flex items-center gap-2 z-10">
                            {editingNameIndex === index ? (
                              <input
                                ref={inputRef}
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                onBlur={() => handleNameSave(index)}
                                onKeyDown={(e) => handleKeyPress(e, index)}
                                className="bg-black/40 backdrop-blur-sm text-[11px] text-white w-[120px] outline-none border-b border-white/20 focus:border-white/40 rounded px-2 py-0.5"
                                placeholder="Enter filename"
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <div 
                                className="flex items-center gap-1 group/edit cursor-text"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNameEdit(index);
                                }}
                              >
                                <p className="text-[11px] text-white/90 truncate max-w-[120px] group-hover/edit:text-white">
                                  {photoNames[`photo-${index}`] || `Photo ${index + 1}`}
                                </p>
                                <RiCloseLine className="w-3 h-3 text-white/60 rotate-45 opacity-0 group-hover/edit:opacity-100 transition-opacity" />
                              </div>
                            )}
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => removePhoto(index)}
                            className="text-white/60 hover:text-white transition-colors bg-black/40 backdrop-blur-sm p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <RiCloseLine className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Drag handle on hover */}
                        <div className="absolute top-2 left-2 text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                          <RiDragMove2Line className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                    
                    {/* Add More Photos cell */}
                    <div
                      {...getPhotoProps()}
                      className="w-full h-full bg-[#0A0A0A] rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center group cursor-pointer hover:border-white/20 transition-colors"
                    >
                      <input {...getPhotoInputProps()} />
                      <div className="text-white/20 group-hover:text-white/40 transition-colors">
                        <RiUploadCloud2Line className="w-8 h-8 mb-2" />
                        <p className="text-[11px]">Add More</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Upload status indicators */}
          <div className="flex gap-2 flex-wrap">
            {Object.entries(uploadStatus)
              .filter(([key]) => key.startsWith('photo-'))
              .map(([key, status]) => (
                <div key={key} className="text-xs text-white/40">
                  {status.status === 'uploading' ? `${status.progress}%` : '✓'}
                </div>
              ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Link
            href={`/studio/dashboard/clients/${clientId}/projects/${projectId}`}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs text-white/40 hover:text-white"
          >
            Cancel (Esc)
          </Link>
          <button
            onClick={() => handleSave()}
            disabled={isSaving}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 bg-black hover:bg-[#222222] rounded-full border 
              ${hasChanges ? 'border-white text-white' : 'border-white/10 text-white/40'}
              transition-all duration-300 text-xs
              ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:text-white'}
            `}
          >
            {isSaving ? 'Saving...' : 'Save Changes (⌘S)'}
          </button>
        </div>

        {/* Keyboard Shortcuts Help */}
        <div className="fixed bottom-4 right-4 text-xs text-white/40">
          <div>⌘S - Save</div>
          <div>Esc - Cancel</div>
        </div>

        {/* How It Works Section */}
        <section>
          <h2>How It Works</h2>
          <Player
            autoplay
            loop
            src={animationData}
            style={{ height: '300px', width: '300px' }}
          />
        </section>
      </div>
    </div>
  );
} 