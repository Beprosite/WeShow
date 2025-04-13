import React from 'react';
import Link from 'next/link';
import Logo from '@/app/components/Logo';

export default function Footer() {
  return (
    <footer className="w-full py-4 border-t border-white/10 bg-black">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <Link href="/">
          <Logo className="scale-75 origin-left" />
        </Link>
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Drapp.ai. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 