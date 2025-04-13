'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const { studio, client } = params;

  return (
    <div className="min-h-screen bg-[#0A0C10]">
      {/* Header */}
      <header className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{decodeURIComponent(client as string)}</h1>
              <p className="text-gray-400">{decodeURIComponent(studio as string)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  );
} 