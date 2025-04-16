'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('studio_token');
    router.push('http://localhost:3000/studio/auth/login');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      {/* Main Content */}
      <main className="transition-all duration-200 ease-in-out">
        {children}
      </main>
    </div>
  );
} 