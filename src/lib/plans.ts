export type PlanTier = 'Free' | 'Pro' | 'Business';

export interface PlanLimits {
  storageLimit: number;
  clientLimit: number;
  projectsPerClientLimit: number;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  Free: {
    storageLimit: 500 * 1024 * 1024, // 500MB
    clientLimit: 1,
    projectsPerClientLimit: 5,
    price: {
      monthly: 0,
      yearly: 0
    },
    features: [
      '1 Client',
      '500MB Storage',
      'Basic Project Management Tools',
      'Client Portal Access',
      'Cloud Uploads',
      'No Watermarks',
      'Email Support'
    ]
  },
  Pro: {
    storageLimit: 20 * 1024 * 1024 * 1024, // 20GB
    clientLimit: 15,
    projectsPerClientLimit: 10,
    price: {
      monthly: 59,
      yearly: 588
    },
    features: [
      'Up to 15 Clients',
      '20GB Storage',
      'Upload and Manage Project Files',
      'Email Notifications for Clients',
      'File Preview System',
      'Branded Client Experience',
      'Project Status Tracking',
      'Enhanced Client/Project View',
      'Priority Email Support',
      'Yearly Bonus: +10GB Storage'
    ]
  },
  Business: {
    storageLimit: 100 * 1024 * 1024 * 1024, // 100GB
    clientLimit: -1, // Unlimited
    projectsPerClientLimit: -1, // Unlimited
    price: {
      monthly: 149,
      yearly: 1428
    },
    features: [
      'Unlimited Clients',
      '100GB Storage',
      'Team Member Access',
      'Client Activity History',
      'Priority File Processing',
      'Analytics Dashboard',
      'Advanced Project Organization',
      'Premium Support',
      'Yearly Bonus: +10GB Storage + Onboarding Session'
    ]
  }
}; 