'use client';

import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { RiArrowRightLine } from 'react-icons/ri';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type StudioProfileForm = {
  studioName: string;
  businessType: string;
  contactPhone?: string;
  website?: string;
};

export default function CompleteProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, handleSubmit, formState: { errors } } = useForm<StudioProfileForm>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data: StudioProfileForm) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/studio/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to complete profile');
      }

      router.push('/studio/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${DESIGN_PATTERNS.COLORS.background} text-white flex flex-col`}>
      {/* Header */}
      <header className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto flex justify-center items-center p-4`}>
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/Weshow-logo-white_300px.webp" 
            alt="WeShow Logo" 
            width={120} 
            height={40} 
            className="object-contain"
          />
        </Link>
      </header>

      {/* Complete Profile Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`${DESIGN_PATTERNS.CARD.wrapper} w-full max-w-md mx-auto transform -translate-y-8`}>
          <div className={`${DESIGN_PATTERNS.CARD.inner} p-6 md:p-8`}>
            <h1 className={`text-2xl ${DESIGN_PATTERNS.TEXT.heading} mb-6 text-center`}>
              Complete Your Profile
            </h1>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Studio Name
                </label>
                <input
                  type="text"
                  {...register('studioName', { required: 'Studio name is required' })}
                  className={`${DESIGN_PATTERNS.INPUT.base} w-full`}
                />
                {errors.studioName && (
                  <p className="text-red-500 text-sm mt-1">{errors.studioName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Business Type
                </label>
                <input
                  type="text"
                  {...register('businessType', { required: 'Business type is required' })}
                  className={`${DESIGN_PATTERNS.INPUT.base} w-full`}
                />
                {errors.businessType && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  {...register('contactPhone')}
                  className={`${DESIGN_PATTERNS.INPUT.base} w-full`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  {...register('website')}
                  className={`${DESIGN_PATTERNS.INPUT.base} w-full`}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${DESIGN_PATTERNS.BUTTON.primary} w-full flex items-center justify-center`}
              >
                {isSubmitting ? 'Saving...' : 'Complete Profile'}
                {!isSubmitting && <RiArrowRightLine className="ml-2" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 