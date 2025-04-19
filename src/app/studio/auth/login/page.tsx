'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';
import Image from 'next/image';

export default function StudioLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/studio/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      console.log('Login response:', { status: res.status, ok: res.ok });

      // Always redirect to dashboard/clients after successful login
      router.push('/studio/dashboard/clients');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${DESIGN_PATTERNS.COLORS.background} text-white flex flex-col`}>
      {/* Header */}
      <header className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto flex justify-center items-center p-4`}>
        <Link href="/" className="flex items-center">
          <Image 
            src="https://s3.eu-north-1.amazonaws.com/dev.drapp.ai-files/email-assets/logos/Weshow-logo-white_300px.png"
            alt="WeShow Logo" 
            width={300}
            height={100}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>
      </header>

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`${DESIGN_PATTERNS.CARD.wrapper} w-full max-w-md mx-auto transform -translate-y-8`}>
          <div className={`${DESIGN_PATTERNS.CARD.inner} p-6 md:p-8`}>
            <h1 className={`text-2xl ${DESIGN_PATTERNS.TEXT.heading} mb-6 text-center`}>
              Studio Login
            </h1>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary}`}>
                    Password
                  </label>
                  <Link
                    href="/studio/auth/forgot-password"
                    className={`text-sm ${DESIGN_PATTERNS.TEXT.secondary} hover:text-[#00A3FF] transition-colors duration-200`}
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 rounded-full inline-flex items-center justify-center 
                  bg-[#00A3FF]/20 backdrop-blur-sm text-white 
                  shadow-lg shadow-[#00A3FF]/20 
                  border border-[#00A3FF]/30 
                  hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
                  transition-all duration-200
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/studio/auth/signup" 
                className={`text-sm ${DESIGN_PATTERNS.TEXT.secondary} hover:text-[#00A3FF] transition-colors duration-200`}
              >
                Don't have an account? View our plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 