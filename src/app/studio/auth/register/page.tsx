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
  
  // Payment Info (if not Free tier)
  billingAddress1: string;
  billingAddress2?: string;
  billingCity: string;
  billingStateProvince: string;
  billingPostalCode: string;
  billingCountry: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
};

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get('plan') || 'Free';
  const plan = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase();
  const billing = searchParams.get('billing') || 'monthly';
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
          const text = await response.text();
          console.error('Upload failed:', {
            status: response.status,
            statusText: response.statusText,
            responseText: text
          });
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Upload response:', data);

        if (data.success && data.publicUrl) {
          console.log('Setting logo preview:', data.publicUrl);
          setLogoPreview(data.publicUrl);
          setLogoUrl(data.publicUrl);
          setIsLogoUploaded(true);
          setUploadSuccess(true);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error) {
        console.error('Logo upload error:', error);
        setUploadError(error instanceof Error ? error.message : 'Failed to upload logo');
        setLogoFile(null);
        setLogoPreview('');
        setLogoUrl('');
        setIsLogoUploaded(false);
      } finally {
        setIsUploading(false);
      }
    }
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

      // Set the status based on the response
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

  const validateEmail = async (value: string) => {
    if (!value) return "Email is required";
    
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(value)) {
      return "Invalid email address";
    }

    const isAvailable = await checkEmailAvailability(value);
    return isAvailable || "This email is already registered";
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const email = watch('email');
      if (email) {
        const isAvailable = await checkEmailAvailability(email);
        if (!isAvailable) {
          return;
        }
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const onSubmit = async (data: FormData) => {
    if (currentStep < 3) {
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
        isActive: false // Will be activated after email confirmation
      };

      console.log('Submitting registration:', {
        ...registrationData,
        password: '******' // Don't log the actual password
      });

      const response = await fetch('/api/studio/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      setSubmitStatus({
        type: 'success',
        message: 'Registration successful! Redirecting to login...'
      });

      // Short delay to show success message
      setTimeout(() => {
        window.location.href = '/studio/auth/login';
      }, 2000);

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

  const handleEmailValidated = (email: string) => {
    setValidatedEmail(email);
    setShowRegistrationForm(true);
    setValue('email', email);
  };

  if (!showRegistrationForm) {
    return <EmailValidationStep onEmailValidated={handleEmailValidated} />;
  }

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

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`${DESIGN_PATTERNS.CARD.wrapper} w-full max-w-2xl mx-auto transform -translate-y-8`}>
          <div className={`${DESIGN_PATTERNS.CARD.inner} p-6 md:p-8`}>
            <h1 className={`text-2xl ${DESIGN_PATTERNS.TEXT.heading} mb-6 text-center`}>
              Create Your Studio Account
            </h1>

            {submitStatus.type === 'error' && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                {submitStatus.message}
              </div>
            )}

            {!showRegistrationForm ? (
              <EmailValidationStep 
                onEmailValidated={handleEmailValidated}
                initialEmail={validatedEmail}
              />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Account Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h2 className={`text-xl ${DESIGN_PATTERNS.TEXT.heading} mb-4`}>Account Information</h2>
                    
                    <div>
                      <label htmlFor="email" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                        Email
                      </label>
                      <input
                        {...register('email', { required: true, validate: validateEmail })}
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
                        Password
                      </label>
                      <input
                        {...register('password', { required: true, minLength: 8 })}
                        type="password"
                        id="password"
                        className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                        placeholder="Create a password"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">Password must be at least 8 characters</p>
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
                    <h2 className={`text-xl ${DESIGN_PATTERNS.TEXT.heading} mb-4`}>Profile Information</h2>
                    
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
                    </div>

                    {/* Logo Upload */}
                    <div>
                      <label className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                        Company Logo
                      </label>
                      <div
                        onClick={handleLogoClick}
                        className="w-full h-32 bg-[#0A0A0A] border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#00A3FF]/30 transition-colors duration-200"
                      >
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="Logo preview"
                            width={100}
                            height={100}
                            className="object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            <p className="text-gray-400">Click to upload logo</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                          </div>
                        )}
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </div>
                      {uploadError && (
                        <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
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
    </div>
  );
} 