import { Client, Project } from '@/types';

// First, let's create a mock studio
export const MOCK_STUDIO = {
  id: 'studio-1',
  name: 'Design Studio Pro',
  logoUrl: 'https://picsum.photos/200',
  email: 'contact@designstudiopro.com',
  phone: '+1 555-0123',
  masterAdminId: 'admin-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-03-15'
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'test-client-1',
    name: 'Modern Living Designs',
    company: 'Modern Living Designs',
    email: 'contact@modernlivingdesigns.com',
    phone: '+1 234 567 8900',
    projectCount: 2,
    status: 'active',
    lastActive: new Date().toISOString().split('T')[0],
    projects: ['proj-1', 'proj-2'],
    urlSlug: 'modern-living-designs',
    logo: 'https://picsum.photos/200',
    website: 'modernlivingdesigns.com',
    address: {
      street: '123 Design Avenue',
      city: 'Design City',
      state: 'DC',
      country: 'United States',
      zipCode: '12345'
    }
  },
  {
    id: 'client-2',
    name: 'Jane Smith',
    company: 'TechStart',
    email: 'jane@techstart.com',
    phone: '+1 234 567 8901',
    projectCount: 1,
    status: 'active',
    lastActive: new Date().toISOString().split('T')[0],
    projects: ['proj-3'],
    urlSlug: 'techstart',
    logo: 'https://picsum.photos/201'
  },
  {
    id: 'client-3',
    name: 'Mike Johnson',
    company: 'DesignCo',
    email: 'mike@designco.com',
    phone: '+1 234 567 8902',
    projectCount: 0,
    status: 'active',
    lastActive: new Date().toISOString().split('T')[0],
    projects: [],
    urlSlug: 'designco',
    logo: 'https://picsum.photos/202'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    clientId: 'test-client-1',
    name: 'Luxury Villa Project',
    status: 'in-progress',
    startDate: '2024-01-15',
    dueDate: '2024-06-30',
    budget: 250000,
    city: 'Miami',
    country: 'USA',
    thumbnailUrl: 'https://picsum.photos/800/600',
    tags: ['3D Rendering', 'Animation', 'VR Tour'],
    files: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://picsum.photos/1920/1080?random=1',
        title: 'Villa_Animation_Final.mp4'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=2',
        title: 'Front_View_001.jpg'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=3',
        title: 'Back_View_001.jpg'
      },
      {
        type: 'aerial',
        url: 'https://picsum.photos/1920/1080?random=4',
        title: 'Aerial_View_001.jpg'
      }
    ]
  },
  {
    id: 'proj-2',
    clientId: 'test-client-1',
    name: 'Modern Office Complex',
    status: 'completed',
    startDate: '2023-08-01',
    dueDate: '2024-02-28',
    budget: 180000,
    city: 'New York',
    country: 'USA',
    thumbnailUrl: 'https://picsum.photos/800/600?random=2',
    tags: ['3D Rendering', 'Virtual Tour'],
    files: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://picsum.photos/1920/1080?random=5',
        title: 'Office_Walkthrough_Final.mp4'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=6',
        title: 'Exterior_View_001.jpg'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=7',
        title: 'Interior_Lobby_001.jpg'
      }
    ]
  },
  {
    id: 'proj-3',
    clientId: 'client-2',
    name: 'Apartment Complex',
    status: 'Materials Received',
    startDate: '2024-04-01',
    dueDate: '2024-06-15',
    budget: 75000,
    city: 'San Francisco',
    country: 'USA',
    thumbnailUrl: 'https://picsum.photos/800/600?random=3',
    tags: ['Exterior Rendering', 'Aerial View', 'Site Plan'],
    files: [
      {
        type: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://picsum.photos/1920/1080?random=8',
        title: 'Apartment_Overview.mp4'
      },
      {
        type: 'image',
        url: 'https://picsum.photos/1920/1080?random=9',
        title: 'Building_Front.jpg'
      },
      {
        type: 'aerial',
        url: 'https://picsum.photos/1920/1080?random=10',
        title: 'Site_Aerial.jpg'
      }
    ]
  }
]; 