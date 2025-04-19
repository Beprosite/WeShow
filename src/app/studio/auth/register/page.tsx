'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import Link from 'next/link';
import { DESIGN_PATTERNS } from '@/app/shared/constants/DESIGN_SYSTEM';
import debounce from 'lodash/debounce';

type FormData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirthMonth: string;
  dateOfBirthYear: string;
  country: string;
  marketingConsent: boolean;
  emailConfirmation: boolean;
  companyName: string;
};

type PasswordStrength = {
  score: number;
  requirements: {
    length: boolean;
    number: boolean;
    uppercase: boolean;
    lowercase: boolean;
    special: boolean;
  };
};

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawPlan = searchParams.get('plan') || 'free';
  const plan = rawPlan.charAt(0).toUpperCase() + rawPlan.slice(1).toLowerCase();
  const billing = searchParams.get('billing') || 'monthly';
  const [currentStep, setCurrentStep] = useState(1);
  const [userCountry, setUserCountry] = useState('');
  const [isLoadingCountry, setIsLoadingCountry] = useState(true);
  const { register, handleSubmit, watch, formState: { errors }, trigger } = useForm<FormData>();
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | '';
    message: string;
  }>({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState<{
    isChecking: boolean;
    isAvailable?: boolean;
    message?: string;
  }>({ isChecking: false });

  // Add email value state
  const [emailValue, setEmailValue] = useState('');

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    requirements: {
      length: false,
      number: false,
      uppercase: false,
      lowercase: false,
      special: false
    }
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch user's country on component mount
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        setUserCountry(data.country_name);
      } catch (error) {
        console.error('Error detecting country:', error);
        setUserCountry('');
      } finally {
        setIsLoadingCountry(false);
      }
    };

    detectCountry();
  }, []);

  const checkEmailAvailability = useCallback(
    debounce(async (email: string) => {
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
        console.log('Email check response:', data);

        if (!response.ok) {
          setEmailCheckStatus({
            isChecking: false,
            isAvailable: false,
            message: 'Failed to verify email availability'
          });
          return false;
        }

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
          message: 'Failed to verify email availability'
        });
        return false;
      }
    }, 300),  // 300ms debounce
    []  // Empty dependency array since we don't have any dependencies
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setEmailValue(email);
    
    // Only check availability if it's a valid email format
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (email && emailRegex.test(email)) {
      checkEmailAvailability(email);
    } else {
      setEmailCheckStatus({ isChecking: false });
    }
  };

  const checkPasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(requirements).filter(Boolean).length;

    setPasswordStrength({
      score,
      requirements
    });

    return score >= 4; // Return true if password meets at least 4 requirements
  };

  const nextStep = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    if (currentStep === 1) {
      const email = watch('email');
      if (email && !emailCheckStatus.isAvailable) {
        return;
      }
    }

    setCurrentStep(2);
  };

  const onSubmit = async (data: FormData) => {
    if (currentStep === 1) {
      nextStep();
      return;
    }

    setSubmitStatus({ type: '', message: '' });
    setIsSubmitting(true);
    
    try {
      const registrationData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: `${data.dateOfBirthMonth}/01/${data.dateOfBirthYear}`,
        country: data.country || userCountry,
        marketingConsent: data.marketingConsent || false,
        emailConfirmation: data.emailConfirmation,
        subscriptionTier: 'free', // Always set to free initially
        billingPeriod: 'monthly', // Default to monthly
        isActive: true,
        companyName: data.companyName,
        preferences: {
          marketingEmails: data.marketingConsent || false,
          emailCommunication: data.emailConfirmation
        }
      };

      console.log('Submitting registration data:', registrationData);

      const response = await fetch('/api/studio/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Registration failed');
      }

      // Store the user's name in localStorage for the welcome message
      localStorage.setItem('newUser', JSON.stringify({
        firstName: data.firstName,
        isNew: true
      }));

      // Show success modal instead of redirecting immediately
      setSuccessMessage(`Welcome ${data.firstName}! Your account has been created successfully. We've sent you a confirmation email with your account details.`);
      setShowSuccessModal(true);

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

  // Generate month options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (100 years back from current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className={`min-h-screen ${DESIGN_PATTERNS.COLORS.background} text-white flex flex-col`}>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`${DESIGN_PATTERNS.CARD.wrapper} max-w-md w-full mx-4`}>
            <div className={`${DESIGN_PATTERNS.CARD.inner} p-6 text-center`}>
              <div className="mb-6">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-light mb-4">Account Created Successfully!</h3>
              <p className="text-white/80 mb-6">{successMessage}</p>
              <button
                onClick={() => router.push('/studio/auth/login')}
                className={`${DESIGN_PATTERNS.BUTTON.primary} w-full`}
              >
                Continue to Login
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center px-4 sm:px-0">
        {/* Logo */}
        <div className="mt-8 mb-[30px]">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/Weshow-logo-white_300px.webp" 
              alt="WeShow Logo" 
              width={300}
              height={100}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* Selected Plan Display */}
        <div className="w-full max-w-md mb-8">
          <div className={`${DESIGN_PATTERNS.CARD.wrapper}`}>
            <div className={`${DESIGN_PATTERNS.CARD.inner} p-4 text-center`}>
              <h2 className="text-xl font-light mb-2">Selected Plan</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-[#00A3FF] font-semibold">{plan.toLowerCase() === 'free' ? 'Free trial' : plan}</span>
                <span className="text-white/60">•</span>
                <span className="text-white/60">
                  {plan.toLowerCase() === 'free' || plan === 'Free trial' ? 'No credit card required' : `${billing} billing`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="w-full max-w-md px-4 sm:px-0">
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

            {/* Step 1: Email and Password */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-light mb-6">Step 1 of 2: Create an account</h2>
                
                <div>
                  <label htmlFor="email" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      {...register('email', { 
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        },
                        onChange: handleEmailChange
                      })}
                      type="email"
                      id="email"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Enter your email"
                    />
                    {emailCheckStatus.isChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                      </div>
                    )}
                    {!emailCheckStatus.isChecking && emailCheckStatus.isAvailable === false && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                    {!emailCheckStatus.isChecking && emailCheckStatus.isAvailable === true && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                  {emailCheckStatus.message && !errors.email && (
                    <p className={`text-sm mt-1 ${emailCheckStatus.isAvailable ? 'text-green-500' : 'text-red-500'}`}>
                      {emailCheckStatus.isAvailable ? emailCheckStatus.message : (
                        <>
                          An account with this email address already exists.{' '}
                          <Link href="/studio/auth/login" className="text-[#00A3FF] hover:underline">
                            Log in
                          </Link>
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password', { 
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters"
                        },
                        validate: (value) => checkPasswordStrength(value) || "Password does not meet requirements"
                      })}
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Create a password"
                      onChange={(e) => {
                        checkPasswordStrength(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 flex-1 rounded-full ${
                            index < passwordStrength.score
                              ? 'bg-[#00A3FF]'
                              : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                    <ul className="text-sm space-y-1">
                      <li className={`flex items-center gap-2 ${
                        passwordStrength.requirements.length ? 'text-green-500' : 'text-white/60'
                      }`}>
                        {passwordStrength.requirements.length ? '✓' : '•'} At least 8 characters
                      </li>
                      <li className={`flex items-center gap-2 ${
                        passwordStrength.requirements.number ? 'text-green-500' : 'text-white/60'
                      }`}>
                        {passwordStrength.requirements.number ? '✓' : '•'} Contains a number
                      </li>
                      <li className={`flex items-center gap-2 ${
                        passwordStrength.requirements.uppercase ? 'text-green-500' : 'text-white/60'
                      }`}>
                        {passwordStrength.requirements.uppercase ? '✓' : '•'} Contains an uppercase letter
                      </li>
                      <li className={`flex items-center gap-2 ${
                        passwordStrength.requirements.lowercase ? 'text-green-500' : 'text-white/60'
                      }`}>
                        {passwordStrength.requirements.lowercase ? '✓' : '•'} Contains a lowercase letter
                      </li>
                      <li className={`
                        flex items-center gap-2 ${
                          passwordStrength.requirements.special ? 'text-green-500' : 'text-white/60'
                        }
                      `}>
                        {passwordStrength.requirements.special ? '✓' : '•'} Contains a special character
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className={`${DESIGN_PATTERNS.BUTTON.primary} w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-light mb-6">Step 2 of 2: Personal Information</h2>
                
                <div>
                  <label htmlFor="companyName" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                    Company Name
                  </label>
                  <input
                    {...register('companyName', { required: "Company name is required" })}
                    type="text"
                    id="companyName"
                    className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && (
                    <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: "First name is required" })}
                      type="text"
                      id="firstName"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: "Last name is required" })}
                      type="text"
                      id="lastName"
                      className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <label className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary}`}>
                      Date of Birth
                    </label>
                    <div className="relative group">
                      <svg 
                        className="w-4 h-4 text-white/60 cursor-help" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                      </svg>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-[#1A1A1A] text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        We require your date of birth to verify your age and ensure compliance with our terms of service. This information is kept secure and is only used for verification purposes.
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <select
                        {...register('dateOfBirthMonth', { required: "Month is required" })}
                        className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                      >
                        <option value="">Month</option>
                        {months.map((month, index) => (
                          <option key={month} value={String(index + 1).padStart(2, '0')}>
                            {month}
                          </option>
                        ))}
                      </select>
                      {errors.dateOfBirthMonth && (
                        <p className="text-red-500 text-sm mt-1">{errors.dateOfBirthMonth.message}</p>
                      )}
                    </div>
                    <div>
                      <input
                        {...register('dateOfBirthYear', { 
                          required: "Year is required",
                          pattern: {
                            value: /^\d{4}$/,
                            message: "Please enter a valid 4-digit year"
                          },
                          validate: (value) => {
                            const year = parseInt(value);
                            const currentYear = new Date().getFullYear();
                            return (year >= currentYear - 100 && year <= currentYear) || "Please enter a valid year";
                          }
                        })}
                        type="text"
                        className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                        placeholder="YYYY"
                        maxLength={4}
                      />
                      {errors.dateOfBirthYear && (
                        <p className="text-red-500 text-sm mt-1">{errors.dateOfBirthYear.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className={`block text-sm ${DESIGN_PATTERNS.TEXT.secondary} mb-1`}>
                    Country/Region
                  </label>
                  <input
                    {...register('country')}
                    type="text"
                    id="country"
                    className="w-full bg-[#0A0A0A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00A3FF] border border-white/10"
                    placeholder="Enter your country"
                    defaultValue={userCountry}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        {...register('marketingConsent')}
                        type="checkbox"
                        id="marketingConsent"
                        className="w-4 h-4 bg-[#0A0A0A] border-white/10 rounded focus:ring-[#00A3FF]"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="marketingConsent" className={`text-sm ${DESIGN_PATTERNS.TEXT.secondary}`}>
                        Keep me updated on the latest products and features (optional)
                      </label>
                      <p className="text-xs text-white/60 mt-1">
                        You'll still receive important system emails about your account, security, and service updates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        {...register('emailConfirmation', { required: "Email confirmation is required" })}
                        type="checkbox"
                        id="emailConfirmation"
                        className="w-4 h-4 bg-[#0A0A0A] border-white/10 rounded focus:ring-[#00A3FF]"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="emailConfirmation" className={`text-sm ${DESIGN_PATTERNS.TEXT.secondary}`}>
                        I agree to receive important system emails about my account, security, and service updates
                      </label>
                      {errors.emailConfirmation && (
                        <p className="text-red-500 text-sm mt-1">{errors.emailConfirmation.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-white/60 space-y-2">
                  <p>
                    By clicking Create account, I agree that I have read and accepted the{' '}
                    <Link href="/terms" className="text-[#00A3FF] hover:underline">
                      Terms of Use
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy-policy" className="text-[#00A3FF] hover:underline">
                      Privacy Policy
                    </Link>.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`${DESIGN_PATTERNS.BUTTON.primary} w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}