import React, { useState } from 'react';
import Link from 'next/link';

interface EmailValidationStepProps {
  onEmailValidated: (email: string) => void;
}

export default function EmailValidationStep({ onEmailValidated }: EmailValidationStepProps) {
  const [email, setEmail] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailRegistered, setIsEmailRegistered] = useState(false);

  const validateEmail = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      return;
    }

    setIsChecking(true);
    setError(null);
    setIsEmailRegistered(false);

    try {
      console.log('Sending request to check email:', email);
      const response = await fetch('/api/studio/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', {
        contentType: response.headers.get('content-type'),
        cors: response.headers.get('access-control-allow-origin')
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.message || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.available) {
        onEmailValidated(email);
      } else {
        setError('This email is already registered');
        setIsEmailRegistered(true);
      }
    } catch (error) {
      console.error('Email validation error:', error);
      setError(error instanceof Error ? error.message : 'Failed to check email availability');
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateEmail();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Start Your Registration</h2>
          <p className="text-gray-400">First, let's check if your email is available</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email * <span className="text-gray-400">(will be used as login)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
                setIsEmailRegistered(false);
              }}
              onKeyPress={handleKeyPress}
              className={`w-full bg-gray-700 border ${
                error ? 'border-red-500' : 'border-gray-600'
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your email"
            />
            {error && (
              <div className="mt-2">
                <p className="text-sm text-red-500">{error}</p>
                {isEmailRegistered && (
                  <p className="text-sm text-blue-400 mt-1">
                    Already have an account?{' '}
                    <Link href="/studio/auth/login" className="text-blue-500 hover:text-blue-400 underline">
                      Login here
                    </Link>
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={validateEmail}
            disabled={isChecking}
            className={`w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 
                     disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center
                     focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            {isChecking ? (
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
      </div>
    </div>
  );
} 