'use client';

import React from 'react';
import { StudioProvider } from '@/app/contexts/StudioContext';
import Footer from '@/components/Footer';

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudioProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </div>
    </StudioProvider>
  );
} 