'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { RiUploadCloud2Line, RiDeleteBinLine, RiDragMove2Line, RiEditLine, RiEyeLine, RiCloseLine } from 'react-icons/ri';

interface SortablePhotoProps {
  id: string;
  url: string;
  title: string;
  onDelete: () => void;
  onTitleChange: (newTitle: string) => void;
}

function SortablePhoto({ id, url, title, onDelete, onTitleChange }: SortablePhotoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditableTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditing(false);
    onTitleChange(editableTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
      onTitleChange(editableTitle);
    }
  };

  return (
    <div className="space-y-2">
      <div
        ref={setNodeRef}
        style={style}
        className="relative group aspect-video bg-gray-800 rounded-lg overflow-hidden"
      >
        <img src={url} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button
            {...attributes}
            {...listeners}
            className="p-2 text-white/70 hover:text-white cursor-move"
          >
            <RiDragMove2Line size={24} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-400 hover:text-red-300"
          >
            <RiDeleteBinLine size={24} />
          </button>
        </div>
      </div>
      <div className="px-1" onClick={e => e.stopPropagation()}>
        {isEditing ? (
          <input
            type="text"
            value={editableTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            className="w-full bg-gray-800 text-white px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <div 
            className="flex items-center group/title cursor-pointer"
            onClick={handleTitleClick}
          >
            <span className="text-gray-300 group-hover/title:text-white truncate flex-1">
              {title}
            </span>
            <RiEditLine 
              size={16} 
              className="text-gray-500 group-hover/title:text-gray-300 ml-2 opacity-0 group-hover/title:opacity-100" 
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

function PreviewModal({ isOpen, onClose, projectId }: PreviewModalProps) {
  const params = useParams();
  const { clientId } = params;
  const [studioId, setStudioId] = useState<string | null>(null);

  useEffect(() => {
    const savedStudioInfo = localStorage.getItem('studioInfo');
    if (savedStudioInfo) {
      try {
        const data = JSON.parse(savedStudioInfo);
        if (data && data.id) {
          setStudioId(data.id);
        }
      } catch (e) {
        console.error('Failed to parse studioInfo:', e);
      }
    }
  }, []);

  if (!isOpen || !studioId) return null;

  const previewUrl = `http://localhost:3000/studio/${studioId}/client/${clientId}/projects/${projectId}`;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative w-full h-[90vh] bg-white rounded-lg overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <RiCloseLine size={24} />
          </button>
        </div>
        <iframe
          src={previewUrl}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export default function ProjectUploadPage() {
  const router = useRouter();
  const params = useParams();
  const { clientId, projectId } = params;

  const [studioId, setStudioId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  
  // Media states
  const [heroPhoto, setHeroPhoto] = useState<File | null>(null);
  const [mainVideo, setMainVideo] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<{ [key: string]: string }>({});
  const [photoTitles, setPhotoTitles] = useState<{ [key: string]: string }>({});
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Function to check authentication
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('studioToken');
      const savedStudioInfo = localStorage.getItem('studioInfo');
      
      if (savedStudioInfo) {
        try {
          const data = JSON.parse(savedStudioInfo);
          if (data && data.id) {
            setStudioId(data.id);
            return data.id;
          }
        } catch (e) {
          console.error('Failed to parse localStorage data:', e);
        }
      }

      if (!token) {
        router.push('/studio/auth/login');
        return null;
      }

      const response = await fetch('/api/studio/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          setStudioId(data.id);
          localStorage.setItem('studioInfo', JSON.stringify(data));
          return data.id;
        }
      }
      
      return null;
    } catch (err) {
      console.error('Auth error:', err);
      return null;
    }
  };

  // Load project details
  const loadProjectDetails = async () => {
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        const project = projects.find((p: any) => p.id === projectId);
        if (project) {
          setProjectName(project.name);
          return;
        }
      }

      const token = localStorage.getItem('studioToken');
      if (!token) return;
      
      const response = await fetch(`/api/studio/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProjectName(data.name);
      }
    } catch (err) {
      console.error('Error loading project details:', err);
      setError('Failed to load project details');
    }
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      if (!clientId || !projectId) {
        setError('Invalid URL parameters');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        await checkAuth();
        await loadProjectDetails();
        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize');
        setIsLoading(false);
      }
    };

    init();
  }, [clientId, projectId]);

  // Handle file preview URLs
  useEffect(() => {
    const urls: { [key: string]: string } = {};
    const titles: { [key: string]: string } = {};
    photos.forEach((photo, index) => {
      urls[`photo-${index}`] = URL.createObjectURL(photo);
      // Set default title as file name if not already set
      if (!photoTitles[`photo-${index}`]) {
        titles[`photo-${index}`] = photo.name;
      }
    });
    setPhotoUrls(urls);
    setPhotoTitles(prev => ({ ...prev, ...titles }));

    return () => {
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [photos]);

  // Dropzone handlers
  const onHeroDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setHeroPhoto(acceptedFiles[0]);
    }
  }, []);

  const onVideoDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setMainVideo(acceptedFiles[0]);
    }
  }, []);

  const onPhotoDrop = useCallback((acceptedFiles: File[]) => {
    setPhotos(prev => [...prev, ...acceptedFiles]);
  }, []);

  // Dropzone configurations
  const { getRootProps: getHeroProps, getInputProps: getHeroInputProps, isDragActive: isHeroDragging } = useDropzone({
    onDrop: onHeroDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const { getRootProps: getVideoProps, getInputProps: getVideoInputProps, isDragActive: isVideoDragging } = useDropzone({
    onDrop: onVideoDrop,
    accept: { 'video/*': [] },
    maxFiles: 1
  });

  const { getRootProps: getPhotoProps, getInputProps: getPhotoInputProps, isDragActive: isPhotosDragging } = useDropzone({
    onDrop: onPhotoDrop,
    accept: { 'image/*': [] }
  });

  // Handle photo reordering
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex((_, index) => `photo-${index}` === active.id);
        const newIndex = items.findIndex((_, index) => `photo-${index}` === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Remove files
  const removeHero = () => setHeroPhoto(null);
  const removeVideo = () => setMainVideo(null);
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(photoUrls[`photo-${index}`]);
    const { [`photo-${index}`]: removed, ...rest } = photoUrls;
    setPhotoUrls(rest);
  };

  // Handle photo title change
  const handlePhotoTitleChange = (index: number, newTitle: string) => {
    setPhotoTitles(prev => ({
      ...prev,
      [`photo-${index}`]: newTitle
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white uppercase">{projectName}</h1>
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <RiEyeLine size={20} />
            <span>View as Client</span>
          </button>
        </div>

        {/* Preview Modal */}
        <PreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          projectId={projectId as string}
        />

        {/* Hero Photo Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Hero Photo</h2>
          <div
            {...getHeroProps()}
            className={`
              border-2 border-dashed rounded-lg transition-colors
              ${heroPhoto ? 'p-0' : 'p-8 text-center cursor-pointer'}
              ${isHeroDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
            `}
          >
            <input {...getHeroInputProps()} />
            {heroPhoto ? (
              <div className="relative group">
                <img
                  src={URL.createObjectURL(heroPhoto)}
                  alt="Hero preview"
                  className="w-full aspect-video object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={removeHero}
                    className="text-red-400 hover:text-red-300"
                  >
                    <RiDeleteBinLine size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                <RiUploadCloud2Line size={48} className="mx-auto mb-4" />
                <p>{isHeroDragging ? 'Drop hero photo here...' : 'Drag & drop hero photo here, or click to select'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Video Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Main Video</h2>
          <div
            {...getVideoProps()}
            className={`
              border-2 border-dashed rounded-lg transition-colors
              ${mainVideo ? 'p-0' : 'p-8 text-center cursor-pointer'}
              ${isVideoDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
            `}
          >
            <input {...getVideoInputProps()} />
            {mainVideo ? (
              <div className="relative group" onClick={e => e.stopPropagation()}>
                <video
                  src={URL.createObjectURL(mainVideo)}
                  className="w-full aspect-video object-cover rounded-lg"
                  controls
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <button
                    onClick={removeVideo}
                    className="text-red-400 hover:text-red-300 pointer-events-auto"
                  >
                    <RiDeleteBinLine size={24} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                <RiUploadCloud2Line size={48} className="mx-auto mb-4" />
                <p>{isVideoDragging ? 'Drop video here...' : 'Drag & drop video here, or click to select'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Photos Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Photos</h2>
          <div
            {...getPhotoProps()}
            className={`
              border-2 border-dashed rounded-lg transition-colors
              ${photos.length > 0 ? 'p-4' : 'p-8 text-center cursor-pointer'}
              ${isPhotosDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
            `}
          >
            <input {...getPhotoInputProps()} />
            {photos.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={Object.keys(photoUrls)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {photos.map((_, index) => (
                      <SortablePhoto
                        key={`photo-${index}`}
                        id={`photo-${index}`}
                        url={photoUrls[`photo-${index}`]}
                        title={photoTitles[`photo-${index}`] || `Photo ${index + 1}`}
                        onDelete={() => removePhoto(index)}
                        onTitleChange={(newTitle) => handlePhotoTitleChange(index, newTitle)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-gray-400">
                <RiUploadCloud2Line size={48} className="mx-auto mb-4" />
                <p>{isPhotosDragging ? 'Drop photos here...' : 'Drag & drop photos here, or click to select'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 