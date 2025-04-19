import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import PhoneInput from './PhoneInputs';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';
import { useSearchParams } from 'next/navigation';
import HumanVerificationPopup from './HumanVerificationPopup';

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
  industry: string;
  website: string;
  
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
  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<FormData>();
  const [currentStep, setCurrentStep] = useState(1);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | 'loading' | '';
    message: string;
  }>({ type: '', message: '' });
  const [isLogoUploaded, setIsLogoUploaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState('');
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
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false
  });
  const [showVerification, setShowVerification] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    setUploadSuccess('');

    try {
      // Generate a registration ID if not exists
      const registrationId = localStorage.getItem('registrationId') || `reg-${Date.now()}`;
      localStorage.setItem('registrationId', registrationId);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('registrationId', registrationId);

      const response = await fetch('/api/studio/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload logo');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to upload logo');
      }

      // Create a preview URL for the uploaded file
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setLogoUrl(data.publicUrl);
      setUploadSuccess('Logo uploaded successfully!');
      setIsLogoUploaded(true);
    } catch (error) {
      console.error('Logo upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload logo');
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
        console.error('Email check failed:', data);
        setEmailCheckStatus({ 
          isChecking: false, 
          isAvailable: false, 
          message: data.message || 'Failed to verify email' 
        });
        return data.message || 'Failed to verify email';
      }
      
      if (!data.success) {
        setEmailCheckStatus({ 
          isChecking: false, 
          isAvailable: false, 
          message: data.message || 'Failed to verify email'
        });
        return data.message || 'Failed to verify email';
      }
      
      if (!data.available) {
        setEmailCheckStatus({ 
          isChecking: false, 
          isAvailable: false, 
          message: data.message || 'This email is already registered' 
        });
        return data.message || 'This email is already registered';
      }
      
      setEmailCheckStatus({ 
        isChecking: false, 
        isAvailable: true, 
        message: data.message || 'Email is available' 
      });
      return true;
    } catch (error) {
      console.error('Email check error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify email availability';
      setEmailCheckStatus({ 
        isChecking: false, 
        isAvailable: false, 
        message: errorMessage 
      });
      return errorMessage;
    }
  };

  const handleEmailValidated = async (email: string) => {
    const validationResult = await validateEmail(email);
    if (validationResult === true) {
      setValidatedEmail(email);
      setShowVerification(true);
    }
  };

  const handleVerificationComplete = () => {
    setShowVerification(false);
    setShowRegistrationForm(true);
    setValue('email', validatedEmail);
  };

  const handleVerificationClose = () => {
    setShowVerification(false);
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger([
        'email',
        'password',
        'confirmPassword',
        'firstName',
        'lastName'
      ]);
      if (!isValid) return;
      
      // Check if password meets all requirements
      const meetsPasswordRequirements = Object.values(passwordRequirements).every(Boolean);
      if (!meetsPasswordRequirements) {
        setSubmitStatus({
          type: 'error',
          message: 'Please ensure your password meets all requirements'
        });
        return;
      }

      setIsTransitioning(true);
      setCurrentStep(2);
      setIsTransitioning(false);
    } else if (currentStep === 2) {
      const isValid = await trigger([
        'companyName',
        'phone',
        'address1',
        'city',
        'stateProvince',
        'postalCode',
        'country',
        'industry',
        'website'
      ]);
      if (!isValid) return;
      
      if (!isLogoUploaded) {
        setSubmitStatus({
          type: 'error',
          message: 'Please upload a logo'
        });
        return;
      }

      setIsTransitioning(true);
      setCurrentStep(3);
      setIsTransitioning(false);
    }
  };

  const prevStep = () => {
    // Clear any error messages when going back
    setSubmitStatus({ type: '', message: '' });
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

      // For free trials, skip to final step
      if (plan === 'Free trial' || plan === 'Free') {
        setCurrentStep(4);
        return;
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const newRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password)
    };
    setPasswordRequirements(newRequirements);
  };

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="flex items-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
              ${!showRegistrationForm || currentStep >= 1 ? 'bg-[#00A3FF]/20 border border-[#00A3FF]' : 'bg-white/10 border border-white/20'}
              shadow-lg ${!showRegistrationForm || currentStep >= 1 ? 'shadow-[#00A3FF]/20' : 'shadow-white/10'}`}>
              <span className={`text-lg ${!showRegistrationForm || currentStep >= 1 ? 'text-[#00A3FF]' : 'text-white/40'}`}>1</span>
            </div>
            <span className={`text-xs mt-2 ${!showRegistrationForm || currentStep >= 1 ? 'text-[#00A3FF]' : 'text-white/40'}`}>Email</span>
          </div>

          {/* Connector Line */}
          <div className={`w-16 h-0.5 ${showRegistrationForm ? 'bg-[#00A3FF]' : 'bg-white/20'}`}></div>

          {/* Step 2 */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
              ${showRegistrationForm && currentStep >= 2 ? 'bg-[#00A3FF]/20 border border-[#00A3FF]' : 'bg-white/10 border border-white/20'}
              shadow-lg ${showRegistrationForm && currentStep >= 2 ? 'shadow-[#00A3FF]/20' : 'shadow-white/10'}`}>
              <span className={`text-lg ${showRegistrationForm && currentStep >= 2 ? 'text-[#00A3FF]' : 'text-white/40'}`}>2</span>
            </div>
            <span className={`text-xs mt-2 ${showRegistrationForm && currentStep >= 2 ? 'text-[#00A3FF]' : 'text-white/40'}`}>Account</span>
          </div>

          {/* Connector Line */}
          <div className={`w-16 h-0.5 ${showRegistrationForm && currentStep >= 2 ? 'bg-[#00A3FF]' : 'bg-white/20'}`}></div>

          {/* Step 3 */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
              ${showRegistrationForm && currentStep >= 3 ? 'bg-[#00A3FF]/20 border border-[#00A3FF]' : 'bg-white/10 border border-white/20'}
              shadow-lg ${showRegistrationForm && currentStep >= 3 ? 'shadow-[#00A3FF]/20' : 'shadow-white/10'}`}>
              <span className={`text-lg ${showRegistrationForm && currentStep >= 3 ? 'text-[#00A3FF]' : 'text-white/40'}`}>3</span>
            </div>
            <span className={`text-xs mt-2 ${showRegistrationForm && currentStep >= 3 ? 'text-[#00A3FF]' : 'text-white/40'}`}>Profile</span>
          </div>

          {/* Connector Line */}
          <div className={`w-16 h-0.5 ${showRegistrationForm && currentStep === 3 ? 'bg-[#00A3FF]' : 'bg-white/20'}`}></div>

          {/* Step 4 */}
          <div className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center 
              ${showRegistrationForm && currentStep === 3 ? 'bg-[#00A3FF]/20 border border-[#00A3FF]' : 'bg-white/10 border border-white/20'}
              shadow-lg ${showRegistrationForm && currentStep === 3 ? 'shadow-[#00A3FF]/20' : 'shadow-white/10'}`}>
              <span className={`text-lg ${showRegistrationForm && currentStep === 3 ? 'text-[#00A3FF]' : 'text-white/40'}`}>4</span>
            </div>
            <span className={`text-xs mt-2 ${showRegistrationForm && currentStep === 3 ? 'text-[#00A3FF]' : 'text-white/40'}`}>Payment</span>
          </div>
        </div>
      </div>

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
            <div className="relative">
              <input
                type="email"
                id="email"
                value={validatedEmail}
                onChange={(e) => setValidatedEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !emailCheckStatus.isChecking) {
                    e.preventDefault();
                    handleEmailValidated(validatedEmail);
                  }
                }}
                className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                placeholder="Enter your email"
              />
              {!emailCheckStatus.isChecking && emailCheckStatus.isAvailable === true && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00FFA3]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {!emailCheckStatus.isChecking && emailCheckStatus.isAvailable === false && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {emailCheckStatus.isChecking && (
              <p className="text-[#00A3FF] text-sm mt-1">Checking email availability...</p>
            )}
            {!emailCheckStatus.isChecking && emailCheckStatus.message && (
              <div className={`text-sm mt-1 ${emailCheckStatus.isAvailable ? 'text-[#00FFA3]' : 'text-red-500'}`}>
                <div className="flex items-center gap-2">
                  <span>{emailCheckStatus.message}</span>
                  {emailCheckStatus.message === 'This email is already registered' && (
                    <Link 
                      href="/studio/auth/login" 
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
              </div>
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
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Validating...
              </>
            ) : (
              'Validate Email'
            )}
          </button>

          {showVerification && (
            <HumanVerificationPopup
              onComplete={handleVerificationComplete}
              onClose={handleVerificationClose}
            />
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (currentStep < 3) {
              nextStep();
            } else {
              handleSubmit(onSubmit)();
            }
          }
        }}>
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
                  Password <span className="text-white/50">(min. 8 characters)</span>
                </label>
                <div className="relative">
                  <input
                    {...register('password', {
                      required: "Password is required",
                      validate: {
                        length: (value) => value.length >= 8 || "Password must be at least 8 characters",
                        hasUpperCase: (value) => /[A-Z]/.test(value) || "Password must contain an uppercase letter",
                        hasLowerCase: (value) => /[a-z]/.test(value) || "Password must contain a lowercase letter",
                        hasNumber: (value) => /[0-9]/.test(value) || "Password must contain a number"
                      }
                    })}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className={`w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border ${
                      Object.values(passwordRequirements).every(Boolean)
                        ? 'border-[#00FFA3] shadow-[0_0_0_1px_#00FFA3]'
                        : errors.password ? 'border-red-500 shadow-[0_0_0_1px_#ef4444]' : 'border-white/10'
                    } pr-10`}
                    placeholder="Create a password"
                    onChange={(e) => {
                      register('password').onChange(e);
                      handlePasswordChange(e);
                    }}
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
                
                {/* Password requirements feedback */}
                <div className="mt-2 text-sm text-white space-y-1">
                  <div className={passwordRequirements.length ? 'text-[#00FFA3]' : 'text-red-400'}>
                    • At least 8 characters
                  </div>
                  <div className={passwordRequirements.uppercase ? 'text-[#00FFA3]' : 'text-red-400'}>
                    • One uppercase letter
                  </div>
                  <div className={passwordRequirements.lowercase ? 'text-[#00FFA3]' : 'text-red-400'}>
                    • One lowercase letter
                  </div>
                  <div className={passwordRequirements.number ? 'text-[#00FFA3]' : 'text-red-400'}>
                    • One number
                  </div>
                </div>
                
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
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
                    className={`w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border ${
                      watch('confirmPassword') && watch('confirmPassword') === watch('password')
                        ? 'border-[#00FFA3] shadow-[0_0_0_1px_#00FFA3]'
                        : errors.confirmPassword ? 'border-red-500 shadow-[0_0_0_1px_#ef4444]' : 'border-white/10'
                    } pr-10`}
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
                <label className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1 text-center`}>
                  Company Logo
                </label>
                <div className="flex flex-col items-center space-y-4">
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
                        className="object-contain rounded-lg w-auto h-auto"
                        style={{ width: 'auto', height: 'auto' }}
                      />
                    ) : (
                      <span className="text-white/40 text-center">Upload<br />Logo</span>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLogoChange}
                    className="hidden"
                    accept="image/*"
                  />
                  <div className="text-center">
                    {isUploading && (
                      <p className="text-blue-500 text-sm">Uploading...</p>
                    )}
                    {uploadError && (
                      <p className="text-red-500 text-sm">{uploadError}</p>
                    )}
                    {uploadSuccess && (
                      <p className="text-green-500 text-sm">{uploadSuccess}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="address1" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                  Street Address
                </label>
                <input
                  {...register('address1', { required: true })}
                  type="text"
                  id="address1"
                  className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                  placeholder="Enter your street address"
                />
              </div>

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
          )}

          {/* Step 3: Payment Information (only for paid plans) or Free Trial Notice */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center space-y-6">
                {plan === 'Free trial' || plan === 'Free' ? (
                  <>
                    <h2 className={`text-xl ${DESIGN_PATTERNS.TEXT.heading} mb-4`}>Start Your 14-Day Free Trial</h2>
                    
                    <div className="bg-[#00A3FF]/10 border border-[#00A3FF]/20 rounded-lg p-6">
                      <div className="flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className={`${DESIGN_PATTERNS.TEXT.secondary} text-lg mb-2`}>
                        No Credit Card Required
                      </p>
                      <p className={`${DESIGN_PATTERNS.TEXT.tertiary} text-sm`}>
                        You'll get full access to all features for 14 days.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}
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
              disabled={isTransitioning}
            >
              {isTransitioning ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 mr-2">
                    <div className="w-full h-full border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  </div>
                  Processing...
                </div>
              ) : (
                currentStep === 3 ? (plan === 'Free trial' || plan === 'Free' ? 'Start Free Trial' : 'Complete Registration') : 'Next'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 