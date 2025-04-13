'use client';

import React, { useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import PhoneInput from '@/app/components/PhoneInputs';
import Logo from '@/app/components/Logo';
import EmailValidationStep from '@/app/components/EmailValidationStep';

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
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo className="h-12" />
          </div>
          <h2 className="text-4xl font-bold mb-4">Complete Your Registration</h2>
          <p className="text-xl text-gray-400">
            You selected the <span className="capitalize font-semibold">{plan}</span> plan ({billing})
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-1/2 h-1 w-full bg-gray-700 -translate-y-1/2 z-0"></div>
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${
                step <= currentStep ? 'bg-blue-600' : 'bg-gray-700'
              } border-2 border-gray-800`}
            >
              <span className="text-sm">{step}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {currentStep === 1 && (
            <div className="bg-gray-800 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold">Account Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email * <span className="text-gray-400">(will be used as login)</span>
                  </label>
                  <input
                    {...register("email")}
                    defaultValue={validatedEmail}
                    readOnly
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 opacity-75"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      First Name *
                    </label>
                    <input
                      {...register("firstName", { required: "First name is required" })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Last Name *
                    </label>
                    <input
                      {...register("lastName", { required: "Last name is required" })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    {...register("password", { 
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    {...register("confirmPassword", {
                      validate: value => value === watch('password') || "Passwords do not match"
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-gray-800 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold">Company Profile</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-24 h-24 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-600">
                      {logoPreview ? (
                        <Image
                          src={logoPreview}
                          alt="Company Logo"
                          fill
                          style={{ objectFit: 'cover' }}
                          unoptimized
                        />
                      ) : (
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleLogoClick}
                        disabled={isUploading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isUploading 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-500'}`}
                      >
                        {isUploading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading...
                          </span>
                        ) : isLogoUploaded ? 'Replace Logo' : 'Upload Logo'}
                      </button>
                      <p className="text-xs text-gray-400">
                        Recommended: Square image, max 5MB
                      </p>
                      {uploadError && (
                        <p className="text-sm text-red-500">{uploadError}</p>
                      )}
                      {uploadSuccess && (
                        <p className="text-sm text-green-500">Logo uploaded successfully!</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Company Name *
                    </label>
                    <input
                      {...register("companyName", { required: "Company name is required" })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone *
                    </label>
                    <PhoneInput
                      value={watch('phone') || ''}
                      onChange={(phone: string) => setValue('phone', phone)}
                      onCountryChange={(country: string) => setValue('country', country)}
                      required={true}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Address *
                    </label>
                    <input
                      {...register("address1", { required: "Address is required" })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      placeholder="Enter address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        {...register("city", { required: "City is required" })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State/Province *
                      </label>
                      <input
                        {...register("stateProvince", { required: "State/Province is required" })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="Enter state/province"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Postal Code *
                      </label>
                      <input
                        {...register("postalCode", { required: "Postal code is required" })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="Enter postal code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country *
                      </label>
                      <input
                        {...register("country", { required: "Country is required" })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="Enter country"
                        list="countries"
                      />
                      <datalist id="countries">
                        <option value="Israel" />
                        <option value="United States" />
                        <option value="United Kingdom" />
                        <option value="Canada" />
                        <option value="Australia" />
                      </datalist>
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-500">{errors.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-gray-800 p-6 rounded-xl space-y-6">
              <h2 className="text-2xl font-semibold">Payment Information</h2>
              
              {/* Toggle for using same address */}
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="useSameAddress"
                  checked={useSameAddress}
                  onChange={(e) => {
                    setUseSameAddress(e.target.checked);
                    if (e.target.checked) {
                      // Copy studio address to billing address
                      setValue('billingAddress1', watch('address1'));
                      setValue('billingCity', watch('city'));
                      setValue('billingStateProvince', watch('stateProvince'));
                      setValue('billingPostalCode', watch('postalCode'));
                      setValue('billingCountry', watch('country'));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
                />
                <label htmlFor="useSameAddress" className="text-sm text-gray-300">
                  Use same address as studio details
                </label>
              </div>

              {/* Billing Address Fields - Only show if not using same address */}
              {!useSameAddress && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Billing Address *
                    </label>
                    <input
                      {...register("billingAddress1", { required: !useSameAddress && "Billing address is required" })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      placeholder="Enter billing address"
                    />
                    {errors.billingAddress1 && (
                      <p className="mt-1 text-sm text-red-500">{errors.billingAddress1.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        City *
                      </label>
                      <input
                        {...register("billingCity", { required: !useSameAddress && "City is required" })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="Enter city"
                      />
                      {errors.billingCity && (
                        <p className="mt-1 text-sm text-red-500">{errors.billingCity.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        State/Province *
                      </label>
                      <input
                        {...register("billingStateProvince", { required: !useSameAddress && "State/Province is required" })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="Enter state/province"
                      />
                      {errors.billingStateProvince && (
                        <p className="mt-1 text-sm text-red-500">{errors.billingStateProvince.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Postal Code *
                      </label>
                      <input
                        {...register("billingPostalCode", { required: !useSameAddress && "Postal code is required" })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="Enter postal code"
                      />
                      {errors.billingPostalCode && (
                        <p className="mt-1 text-sm text-red-500">{errors.billingPostalCode.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Country *
                      </label>
                      <input
                        {...register("billingCountry", { required: !useSameAddress && "Country is required" })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                        placeholder="Enter country"
                      />
                      {errors.billingCountry && (
                        <p className="mt-1 text-sm text-red-500">{errors.billingCountry.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Card Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Card Number *
                  </label>
                  <input
                    {...register("cardNumber", { required: "Card number is required" })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                    placeholder="Enter card number"
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.cardNumber.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      {...register("cardExpiry", { required: "Expiry date is required" })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      placeholder="MM/YY"
                    />
                    {errors.cardExpiry && (
                      <p className="mt-1 text-sm text-red-500">{errors.cardExpiry.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CVC *
                    </label>
                    <input
                      {...register("cardCVC", { required: "CVC is required" })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                      placeholder="Enter CVC"
                    />
                    {errors.cardCVC && (
                      <p className="mt-1 text-sm text-red-500">{errors.cardCVC.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                Previous
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg ml-auto transition-colors flex items-center space-x-2 ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                currentStep === 3 ? 'Complete Registration' : 'Next'
              )}
            </button>
          </div>

          {submitStatus.message && (
            <div className={`p-4 rounded-lg ${
              submitStatus.type === 'success' 
                ? 'bg-green-800 text-green-100' 
                : 'bg-red-800 text-red-100'
            }`}>
              {submitStatus.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
} 