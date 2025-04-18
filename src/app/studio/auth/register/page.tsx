'use client';

import React, { useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import PhoneInput from '@/app/components/PhoneInputs';
import EmailValidationStep from '@/app/components/EmailValidationStep';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';

type FormData = {
  // Account Info
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  
  // Profile Info
  companyName: string;
  phone: string;
  address1: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  
  // Payment Info (only for non-free tiers)
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingStateProvince?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVC?: string;
};

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawPlan = searchParams.get('plan') || 'Free';
  const plan = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase();
  const isFreeTier = plan === 'Free';
  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm<FormData>();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [isLogoUploaded, setIsLogoUploaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState<{
    isChecking: boolean;
    isAvailable?: boolean;
    message?: string;
  }>({ isChecking: false });
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [validatedEmail, setValidatedEmail] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be less than 5MB');
        return;
      }

      setLogoFile(file);
      setUploadError('');
      setIsUploading(true);
      setUploadSuccess(false);

      try {
        console.log('Starting logo upload...');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/studio/upload/logo', {
          method: 'POST',
          body: formData
        });

        console.log('Response:', {
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type')
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Upload failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          throw new Error(errorData.error || 'Upload failed');
        }

        const data = await response.json();
        console.log('Upload response:', data);

        if (data.uploadUrl) {
          // Upload the file to the presigned URL
          const uploadResponse = await fetch(data.uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type
            }
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload file to storage');
          }

          // Get the public URL (you'll need to implement this based on your storage setup)
          const publicUrl = data.uploadUrl.split('?')[0]; // This is a placeholder - adjust based on your storage setup
          console.log('Setting logo preview:', publicUrl);
          setLogoPreview(publicUrl);
          setLogoUrl(publicUrl);
          setIsLogoUploaded(true);
          setUploadSuccess(true);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to upload logo');
        setUploadSuccess(false);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleEmailValidated = (email: string) => {
    setValidatedEmail(email);
    setShowRegistrationForm(true);
  };

  const checkEmailAvailability = async (email: string) => {
    try {
      setEmailCheckStatus({ isChecking: true });
      
      const response = await fetch('/api/studio/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      setEmailCheckStatus({
        isChecking: false,
        isAvailable: data.available,
        message: data.message
      });

      return data.available;
    } catch (error) {
      console.error('Email check error:', error);
      setEmailCheckStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Failed to check email availability'
      });
      return false;
    }
  };

  const nextStep = async () => {
    const isValid = await trigger();
    if (!isValid) {
      return;
    }
    
    if (currentStep === 1) {
      const email = watch('email');
      const password = watch('password');
      
      // Check password requirements
      const meetsRequirements = Object.values(passwordRequirements).every(Boolean);
      if (!meetsRequirements) {
        setSubmitStatus({
          type: 'error',
          message: 'Please ensure your password meets all requirements'
        });
        return;
      }
      
      if (email) {
        const isAvailable = await checkEmailAvailability(email);
        if (!isAvailable) {
          return;
        }
      }
    }

    // For free tier, skip to the final step after profile info
    if (isFreeTier && currentStep === 2) {
      setCurrentStep(3);
    } else {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (currentStep < 3) {
      const isValid = await trigger();
      if (!isValid) {
        return;
      }
      nextStep();
      return;
    }

    setSubmitStatus({ type: '', message: '' });
    setIsSubmitting(true);
    
    try {
      const registrationData = {
        companyName: data.companyName,
        email: data.email,
        password: data.password,
        logoUrl: logoUrl,
        subscriptionTier: plan,
        contactName: `${data.firstName} ${data.lastName}`,
        contactEmail: data.email,
        contactPhone: data.phone,
        website: '',
        industry: '',
        address: data.address1,
        studioSize: '',
        isActive: false
      };

      console.log('Submitting registration:', {
        ...registrationData,
        password: '******'
      });

      const response = await fetch('/api/studio/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const result = await response.json();

      setSubmitStatus({
        type: 'success',
        message: 'Registration successful! Please check your email to verify your account.'
      });

      // Show success message for longer
      setTimeout(() => {
        window.location.href = '/studio/auth/login?message=verification-email-sent';
      }, 3000);

    } catch (error: any) {
      console.error('Registration error:', error);
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Registration failed. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${DESIGN_PATTERNS.COLORS.background} text-white flex flex-col`}>
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-0">
        {/* Logo */}
        <div className="mt-8 mb-[30px]">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/Weshow-logo-white_300px.webp" 
              alt="WeShow Logo" 
              width={120} 
              height={40} 
              className="object-contain w-auto h-auto"
              style={{ width: 'auto', height: 'auto' }}
            />
          </Link>
        </div>

        {/* Registration Form */}
        <div className="w-full max-w-md px-4 sm:px-0">
          {!showRegistrationForm ? (
            <div>
              <EmailValidationStep 
                onEmailValidated={handleEmailValidated}
                initialEmail={validatedEmail}
              />
              <div className="text-center mt-2.5">
                <p className="text-sm text-white/60">
                  By proceeding, you agree to the
                </p>
                <p className="text-sm text-white/60">
                  <Link href="/terms" className="text-[#00A3FF] hover:underline">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-[#00A3FF] hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {submitStatus.type && (
                <div className={`${
                  submitStatus.type === 'success' 
                    ? 'bg-green-500/10 border-green-500 text-green-500' 
                    : 'bg-red-500/10 border-red-500 text-red-500'
                } border rounded-lg p-4 mb-6`}>
                  {submitStatus.message}
                </div>
              )}

              {/* Step 1: Account Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      Email
                    </label>
                    <input
                      {...register('email', { required: true })}
                      type="email"
                      id="email"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Enter your email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      Password <span className="text-white/50">(min. 8 characters)</span>
                    </label>
                    <input
                      {...register('password', { required: "Password is required" })}
                      type="password"
                      id="password"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Create a password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      Confirm Password
                    </label>
                    <input
                      {...register('confirmPassword', {
                        required: true,
                        validate: value => value === watch('password') || "Passwords don't match"
                      })}
                      type="password"
                      id="confirmPassword"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Profile Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyName" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      Company Name
                    </label>
                    <input
                      {...register('companyName', { required: true })}
                      type="text"
                      id="companyName"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Enter your company name"
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      Phone Number
                    </label>
                    <PhoneInput
                      value={watch('phone')}
                      onChange={(value) => setValue('phone', value)}
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address1" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      Address
                    </label>
                    <input
                      {...register('address1', { required: true })}
                      type="text"
                      id="address1"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Enter your address"
                    />
                    {errors.address1 && (
                      <p className="text-red-500 text-sm mt-1">{errors.address1.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Payment Information (only for non-free tiers) */}
              {currentStep === 3 && !isFreeTier && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="cardNumber" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      Card Number
                    </label>
                    <input
                      {...register('cardNumber', { required: true })}
                      type="text"
                      id="cardNumber"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Enter card number"
                    />
                    {errors.cardNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.cardNumber.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cardExpiry" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                        Expiry Date
                      </label>
                      <input
                        {...register('cardExpiry', { required: true })}
                        type="text"
                        id="cardExpiry"
                        placeholder="MM/YY"
                        className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      />
                      {errors.cardExpiry && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardExpiry.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="cardCVC" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                        CVC
                      </label>
                      <input
                        {...register('cardCVC', { required: true })}
                        type="text"
                        id="cardCVC"
                        className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      />
                      {errors.cardCVC && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardCVC.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                    className="px-6 py-3 rounded-full inline-flex items-center justify-center 
                      bg-white/10 backdrop-blur-sm text-white 
                      shadow-lg shadow-white/10 
                      border border-white/20 
                      hover:bg-white/20 hover:shadow-white/20
                      transition-all duration-200"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`ml-auto px-6 py-3 rounded-full inline-flex items-center justify-center 
                    bg-[#00A3FF]/20 backdrop-blur-sm text-white 
                    shadow-lg shadow-[#00A3FF]/20 
                    border border-[#00A3FF]/30 
                    hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
                    transition-all duration-200
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {currentStep < 3 ? 'Next' : isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 