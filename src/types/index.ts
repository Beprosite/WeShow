export interface Studio {
  id: string;
  name: string;
  logoUrl: string | null;
  email: string;
  phone: string;
  masterAdminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  projectCount: number;
  status: 'active' | 'inactive';
  lastActive: string;
  projects: string[];
  urlSlug: string;
  logo?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
}

export type ProjectTag = {
  type: string;
  color: string;
}

export interface ProjectFile {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'video' | 'aerial';
  thumbnail?: string;
  height?: number;
  width?: number;
}

export interface MediaItem {
  id: string;
  url: string;
  title: string;
  type: 'photo' | 'video';
}

export type ProjectStatus = 
  | 'Materials Received'
  | 'In Progress'
  | 'Pending Approval'
  | 'In Review'
  | 'Revisions'
  | 'Completed';

export interface Media {
  id: string;
  url: string;
  title?: string;
  name?: string;
  type: 'image' | 'video';
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  status: string;
  startDate: string;
  dueDate: string;
  budget: number;
  thumbnailUrl?: string;
  heroPhoto?: string;
  photos: MediaItem[];
  videos: MediaItem[];
}