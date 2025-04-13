import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface StudioData {
  id: string;
  name: string;
  email: string;
  logo: string;
  subscription?: {
    tier: 'Free' | 'Pro' | 'Business';
    status: 'active' | 'inactive';
    expiresAt?: string;
    billingPeriod: 'monthly' | 'yearly';
    currentPeriodEnd: string;
    price: number;
  };
}

interface StudioContextType {
  studioData: StudioData | null;
  setStudioData: (data: StudioData | null) => void;
  refreshStudioData: () => Promise<void>;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [studioData, setStudioData] = useState<StudioData | null>(null);
  const router = useRouter();

  const refreshStudioData = async () => {
    try {
      const response = await fetch('/studio/api/me', {
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        // Transform the data to include all required subscription fields
        const transformedData = {
          ...data,
          subscription: {
            ...data.subscription,
            billingPeriod: data.subscription?.billingPeriod || 'monthly',
            currentPeriodEnd: data.subscription?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            price: data.subscription?.price || 0
          }
        };
        setStudioData(transformedData);
      } else if (response.status === 401) {
        // If unauthorized, redirect to login
        setStudioData(null);
        router.push('/studio/auth/login');
      }
    } catch (error) {
      console.error('Error fetching studio data:', error);
      setStudioData(null);
    }
  };

  useEffect(() => {
    // Skip the initial fetch on login/register pages
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/auth/login') || path.includes('/auth/register')) {
        return;
      }
      refreshStudioData();
    }
  }, []);

  return (
    <StudioContext.Provider value={{ studioData, setStudioData, refreshStudioData }}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error('useStudio must be used within a StudioProvider');
  }
  return context;
} 