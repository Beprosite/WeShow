'use client';

// Types & Interfaces
export const PROJECT_STATUSES = {
  'Materials Received': 'bg-gray-500/20 text-gray-500',
  'In Progress': 'bg-yellow-500/20 text-yellow-500',
  'Pending Approval': 'bg-purple-500/20 text-purple-500',
  'In Review': 'bg-blue-500/20 text-blue-500',
  'Revisions': 'bg-orange-500/20 text-orange-500',
  'Completed': 'bg-green-500/20 text-green-500'
} as const;

export const PROJECT_TIERS = {
  Bronze: { min: 0, max: 5, color: 'from-amber-500 to-amber-600' },
  Silver: { min: 6, max: 15, color: 'from-gray-400 to-gray-500' },
  Gold: { min: 16, max: 30, color: 'from-yellow-500 to-yellow-600' },
  Platinum: { min: 31, max: Infinity, color: 'from-blue-500 to-blue-600' }
} as const;

export const PROJECT_TAGS = [
  { type: 'Interior Rendering', color: 'bg-blue-500' },
  { type: 'Exterior Rendering', color: 'bg-green-500' },
  { type: 'Animation', color: 'bg-purple-500' },
  { type: 'Virtual Tour', color: 'bg-yellow-500' },
  { type: 'Floor Plan', color: 'bg-red-500' },
  { type: 'Site Plan', color: 'bg-indigo-500' },
  { type: 'Aerial View', color: 'bg-pink-500' },
  { type: 'Street View', color: 'bg-orange-500' },
  { type: '3D Model', color: 'bg-teal-500' },
  { type: 'Material Selection', color: 'bg-cyan-500' },
  { type: 'Lighting Study', color: 'bg-amber-500' },
  { type: 'Furniture Layout', color: 'bg-lime-500' },
  { type: 'Landscape Visualization', color: 'bg-emerald-500' }
] as const;

export type ProjectStatus = keyof typeof PROJECT_STATUSES;
export type ProjectTag = typeof PROJECT_TAGS[number];

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  city: string;
  country: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string;
  budget: number;
  isPaid: boolean;
  thumbnailUrl: string;
  tags: ProjectTag[];
  lastUpdate: string;
  hasAerialFootage: boolean;
  hasAdditionalMaterials: boolean;
  files: {
    type: string;
    url: string;
    thumbnail: string;
    title: string;
  }[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  projectCount: number;
  status: 'active' | 'inactive';
  lastActive: string;
  projects: string[];
  logo?: string;
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    clientId: 'client-1',
    name: 'Michal Project',
    clientName: 'Michal Design',
    city: 'Tel Aviv',
    country: 'Israel',
    status: 'In Progress',
    startDate: '2024-03-01',
    dueDate: '2024-04-01',
    budget: 5000,
    thumbnailUrl: 'https://picsum.photos/800/600?random=1',
    tags: [
      { type: 'Interior Rendering', color: 'bg-blue-500' },
      { type: 'Exterior Rendering', color: 'bg-green-500' },
      { type: '3D Model', color: 'bg-teal-500' }
    ],
    lastUpdate: new Date().toISOString(),
    isPaid: false,
    hasAerialFootage: true,
    hasAdditionalMaterials: true,
    files: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://picsum.photos/1920/1080?random=1',
        title: 'Main_Animation_Final_V2.mp4'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=2',
        thumbnail: 'https://picsum.photos/1920/1080?random=2',
        title: 'South_Elevation_001.jpg'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=3',
        thumbnail: 'https://picsum.photos/1920/1080?random=3',
        title: 'South_Elevation_002.jpg'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=4',
        thumbnail: 'https://picsum.photos/1920/1080?random=4',
        title: 'North_Elevation_001.jpg'
      },
      {
        type: 'aerial',
        url: 'https://picsum.photos/1920/1080?random=6',
        thumbnail: 'https://picsum.photos/1920/1080?random=6',
        title: 'Aerial_View_Top_001.jpg'
      },
      {
        type: 'aerial',
        url: 'https://picsum.photos/1920/1080?random=7',
        thumbnail: 'https://picsum.photos/1920/1080?random=7',
        title: 'Aerial_View_Front_001.jpg'
      }
    ]
  },
  {
    id: '2',
    clientId: 'client-1',
    name: 'Shafer Building',
    clientName: 'Michal Design',
    city: 'Jerusalem',
    country: 'Israel',
    status: 'Completed',
    startDate: '2024-02-01',
    dueDate: '2024-03-01',
    budget: 7500,
    thumbnailUrl: 'https://picsum.photos/800/600?random=2',
    tags: [
      { type: 'Interior Rendering', color: 'bg-blue-500' },
      { type: 'Animation', color: 'bg-purple-500' }
    ],
    lastUpdate: new Date().toISOString(),
    isPaid: true,
    hasAerialFootage: true,
    hasAdditionalMaterials: true,
    files: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://picsum.photos/1920/1080?random=8',
        title: 'Main_Animation_Final_V2.mp4'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=9',
        thumbnail: 'https://picsum.photos/1920/1080?random=9',
        title: 'South_Elevation_001.jpg'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=10',
        thumbnail: 'https://picsum.photos/1920/1080?random=10',
        title: 'South_Elevation_002.jpg'
      },
      {
        type: 'aerial',
        url: 'https://picsum.photos/1920/1080?random=11',
        thumbnail: 'https://picsum.photos/1920/1080?random=11',
        title: 'Aerial_View_Top_001.jpg'
      }
    ]
  },
  {
    id: '3',
    name: 'Garden Villa',
    clientId: '1',
    clientName: 'Ben Shalom',
    city: 'Ramat Gan',
    country: 'Israel',
    status: 'In Review',
    startDate: '2024-03-10',
    dueDate: '2024-04-10',
    budget: 6000,
    isPaid: false,
    thumbnailUrl: 'https://picsum.photos/800/600?random=3',
    tags: [{ type: 'Virtual Tour', color: 'bg-yellow-500' }],
    lastUpdate: '2024-03-15',
    hasAerialFootage: false,
    hasAdditionalMaterials: false,
    files: []
  },
  {
    id: '4',
    name: 'Urban Loft',
    clientId: '1',
    clientName: 'Ben Shalom',
    city: 'Jerusalem',
    country: 'Israel',
    status: 'Materials Received',
    startDate: '2024-03-20',
    dueDate: '2024-04-20',
    budget: 4500,
    isPaid: false,
    thumbnailUrl: 'https://picsum.photos/800/600?random=4',
    tags: [
      { type: 'Interior Rendering', color: 'bg-blue-500' },
      { type: 'Furniture Layout', color: 'bg-lime-500' }
    ],
    lastUpdate: '2024-03-15',
    hasAerialFootage: false,
    hasAdditionalMaterials: false,
    files: []
  }
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Ben Shalom',
    email: 'contact@benshalom.com',
    company: 'Shalom Architects',
    phone: '+972 50-123-4567',
    projectCount: 4,
    status: 'active',
    lastActive: '2024-03-21',
    projects: ['3', '4'],
    logo: '' // You can add a default logo URL here if needed
  },
  {
    id: '2',
    name: 'Michal Design',
    email: 'michal@design.com',
    company: 'Michal Design Studio',
    phone: '+972 50-987-6543',
    projectCount: 2,
    status: 'active',
    lastActive: '2024-03-20',
    projects: ['1', '2'],
    logo: '' // You can add a default logo URL here if needed
  }
];