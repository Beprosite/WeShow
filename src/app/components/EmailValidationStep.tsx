import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import PhoneInput from './PhoneInputs';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';
import { useSearchParams } from 'next/navigation';

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

type EmailValidationStepProps = {
  onEmailValidated: (email: string) => void;
  initialEmail?: string;
};

export default function EmailValidationStep({ onEmailValidated, initialEmail }: EmailValidationStepProps) {
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
  const [validatedEmail, setValidatedEmail] = useState(initialEmail || '');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setLogoFile(file);
    setUploadError('');
    setIsUploading(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'logo');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setLogoUrl(data.url);
      setIsLogoUploaded(true);
      setUploadSuccess(true);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const validateEmail = async (email: string) => {
    if (!email) return 'Email is required';
    
    setEmailCheckStatus({ isChecking: true });
    try {
      const response = await fetch('/api/studio/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to verify email');
      }
      
      if (!data.available) {
        return 'This email is already registered';
      }
      
      setEmailCheckStatus({ isChecking: false, isAvailable: true });
      return true;
    } catch (error) {
      console.error('Email check error:', error);
      setEmailCheckStatus({ isChecking: false, isAvailable: false });
      return 'Failed to verify email availability';
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

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

  return (
    <div className="min-h-screen bg-black">
      {/* Header with Logo */}
      <header className="w-full py-4 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center">
          <Link href="/">
            <Image
              src="/images/Weshow-logo-white_300px.webp"
              alt="WeShow Logo"
              width={120}
              height={40}
              className="object-contain"
            />
          </Link>
        </div>
      </header>

      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <div className={`${DESIGN_PATTERNS.CARD.wrapper} w-full max-w-md`}>
          <div className={`${DESIGN_PATTERNS.CARD.inner} p-6 md:p-8`}>
            <h1 className={`text-2xl ${DESIGN_PATTERNS.TEXT.heading} mb-6 text-center`}>
              Create Your Studio Account
            </h1>

            {/* Display chosen tier */}
            <div className="mb-6 text-center">
              <span className={`${DESIGN_PATTERNS.TEXT.secondary} text-sm`}>Selected Plan:</span>
              <h2 className={`text-xl ${DESIGN_PATTERNS.TEXT.heading}`}>
                {plan === 'Free trial' || plan === 'Free' ? '14-Day Free Trial' : `${plan} Tier`}
              </h2>
              {plan === 'Free trial' || plan === 'Free' ? (
                <p className={`${DESIGN_PATTERNS.TEXT.secondary} text-sm`}>
                  No credit card required
                </p>
              ) : (
                <p className={`${DESIGN_PATTERNS.TEXT.secondary} text-sm`}>
                  {billing === 'monthly' ? 'Monthly Billing' : 'Annual Billing'}
                </p>
              )}
            </div>

            {submitStatus.type === 'error' && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-4 mb-6">
                {submitStatus.message}
              </div>
            )}

            {!showRegistrationForm ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="email" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={validatedEmail}
                    onChange={(e) => setValidatedEmail(e.target.value)}
                    className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                    placeholder="Enter your email"
                  />
                  {emailCheckStatus.isChecking && (
                    <p className="text-blue-500 text-sm mt-1">Checking email availability...</p>
                  )}
                </div>
                <button
                  onClick={() => handleEmailValidated(validatedEmail)}
                  className="w-full px-6 py-3 rounded-full inline-flex items-center justify-center 
                    bg-[#00A3FF]/20 backdrop-blur-sm text-white 
                    shadow-lg shadow-[#00A3FF]/20 
                    border border-[#00A3FF]/30 
                    hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={emailCheckStatus.isChecking}
                >
                  {emailCheckStatus.isChecking ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Checking...
                    </>
                  ) : (
                    'Validate Email'
                  )}
                </button>
              </div>
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
                      <div className="relative">
                        <input
                          {...register('password', { required: true, minLength: 8 })}
                          type={showPassword ? "text" : "password"}
                          id="password"
                          className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10 pr-10"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.053 2.454-.149z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">Password must be at least 8 characters</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          {...register('confirmPassword', {
                            required: true,
                            validate: (value) => value === watch('password') || 'Passwords do not match'
                          })}
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10 pr-10"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
                        >
                          {showConfirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.053 2.454-.149z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                          First Name
                        </label>
                        <input
                          {...register('firstName', { required: true })}
                          type="text"
                          id="firstName"
                          className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                          placeholder="Enter your first name"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                          Last Name
                        </label>
                        <input
                          {...register('lastName', { required: true })}
                          type="text"
                          id="lastName"
                          className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                          placeholder="Enter your last name"
                        />
                      </div>
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
                      <div className="flex items-center space-x-4">
                        <div
                          onClick={handleLogoClick}
                          className={`w-24 h-24 rounded-lg border-2 border-dashed ${
                            isUploading ? 'border-blue-500' : 'border-white/20'
                          } flex items-center justify-center cursor-pointer hover:border-[#00A3FF] transition-colors`}
                        >
                          {logoPreview ? (
                            <Image
                              src={logoPreview}
                              alt="Logo preview"
                              width={96}
                              height={96}
                              className="object-contain rounded-lg"
                            />
                          ) : (
                            <span className="text-white/40">Upload Logo</span>
                          )}
                        </div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoChange}
                          className="hidden"
                          accept="image/*"
                        />
                        <div className="flex-1">
                          {isUploading && (
                            <p className="text-blue-500 text-sm">Uploading...</p>
                          )}
                          {uploadError && (
                            <p className="text-red-500 text-sm">{uploadError}</p>
                          )}
                          {uploadSuccess && (
                            <p className="text-green-500 text-sm">Logo uploaded successfully!</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="address1" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                        Address Line 1
                      </label>
                      <input
                        {...register('address1', { required: true })}
                        type="text"
                        id="address1"
                        className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                        placeholder="Enter your address"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                          City
                        </label>
                        <input
                          {...register('city', { required: true })}
                          type="text"
                          id="city"
                          className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                          placeholder="Enter your city"
                        />
                      </div>

                      <div>
                        <label htmlFor="stateProvince" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                          State/Province
                        </label>
                        <input
                          {...register('stateProvince', { required: true })}
                          type="text"
                          id="stateProvince"
                          className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                          placeholder="Enter your state/province"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="postalCode" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                          Postal Code
                        </label>
                        <input
                          {...register('postalCode', { required: true })}
                          type="text"
                          id="postalCode"
                          className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                          placeholder="Enter your postal code"
                        />
                      </div>

                      <div>
                        <label htmlFor="country" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                          Country
                        </label>
                        <input
                          {...register('country', { required: true })}
                          type="text"
                          id="country"
                          className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                          placeholder="Enter your country"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Payment Information (only for paid plans) */}
                {currentStep === 3 && plan !== 'Free' && (
                  <div className="space-y-4">
                    <h2 className={`text-xl ${DESIGN_PATTERNS.TEXT.heading} mb-4`}>Payment Information</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={useSameAddress}
                            onChange={(e) => setUseSameAddress(e.target.checked)}
                            className="rounded border-white/20"
                          />
                          <span className={`text-sm ${DESIGN_PATTERNS.TEXT.secondary}`}>
                            Use same address for billing
                          </span>
                        </label>
                      </div>

                      {!useSameAddress && (
                        <>
                          <div>
                            <label htmlFor="billingAddress1" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                              Billing Address Line 1
                            </label>
                            <input
                              {...register('billingAddress1', { required: !useSameAddress })}
                              type="text"
                              id="billingAddress1"
                              className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                              placeholder="Enter billing address"
                            />
                          </div>

                          <div>
                            <label htmlFor="billingAddress2" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                              Billing Address Line 2 (Optional)
                            </label>
                            <input
                              {...register('billingAddress2')}
                              type="text"
                              id="billingAddress2"
                              className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                              placeholder="Enter additional address information"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="billingCity" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                                City
                              </label>
                              <input
                                {...register('billingCity', { required: !useSameAddress })}
                                type="text"
                                id="billingCity"
                                className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                                placeholder="Enter billing city"
                              />
                            </div>

                            <div>
                              <label htmlFor="billingStateProvince" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                                State/Province
                              </label>
                              <input
                                {...register('billingStateProvince', { required: !useSameAddress })}
                                type="text"
                                id="billingStateProvince"
                                className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                                placeholder="Enter billing state/province"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="billingPostalCode" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                                Postal Code
                              </label>
                              <input
                                {...register('billingPostalCode', { required: !useSameAddress })}
                                type="text"
                                id="billingPostalCode"
                                className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                                placeholder="Enter billing postal code"
                              />
                            </div>

                            <div>
                              <label htmlFor="billingCountry" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                                Country
                              </label>
                              <input
                                {...register('billingCountry', { required: !useSameAddress })}
                                type="text"
                                id="billingCountry"
                                className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                                placeholder="Enter billing country"
                              />
                            </div>
                          </div>
                        </>
                      )}

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
                            className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                            placeholder="MM/YY"
                          />
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
                            placeholder="CVC"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-6 py-3 rounded-full inline-flex items-center justify-center 
                        bg-[#00A3FF]/20 backdrop-blur-sm text-white 
                        shadow-lg shadow-[#00A3FF]/20 
                        border border-[#00A3FF]/30 
                        hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
                        transition-all duration-200"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full inline-flex items-center justify-center 
                      bg-[#00A3FF]/20 backdrop-blur-sm text-white 
                      shadow-lg shadow-[#00A3FF]/20 
                      border border-[#00A3FF]/30 
                      hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
                      transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ml-auto"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      currentStep === 3 ? 'Complete Registration' : 'Next'
                    )}
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