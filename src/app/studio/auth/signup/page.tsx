'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const DESIGN_PATTERNS = {
  // Container Patterns
  CARD: {
    wrapper: "relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0",
    inner: "bg-gradient-to-b from-[#0A0A0A] to-black border border-white/10",
  },

  // Background Colors
  COLORS: {
    background: "bg-black",
    card: "bg-gradient-to-b from-[#0A0A0A] to-black",
    hover: "hover:bg-[#222222]",
    border: "border-white/10",
    borderHover: "hover:border-white/20",
  },

  // Typography
  TEXT: {
    primary: "text-white",
    secondary: "text-white/60",
    tertiary: "text-white/40",
    heading: "font-light",
  },

  // Button Styles
  BUTTON: {
    primary: "flex items-center gap-1 px-2.5 py-0.5 bg-black hover:bg-[#222222] rounded-full border border-white/10 transition-all duration-300 text-xs text-white",
    secondary: "flex items-center gap-1 px-2.5 py-0.5 text-white/40 hover:text-white transition-colors text-xs",
  },

  // Icon Sizes
  ICON: {
    small: "w-3.5 h-3.5",
    medium: "w-4 h-4",
    large: "w-5 h-5",
  },

  // Loading States
  LOADING: {
    spinner: "animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white",
  },

  // Layout
  LAYOUT: {
    maxWidth: "max-w-[1490px]",
    padding: "px-5",
    gap: "gap-6",
  }
} as const;

const pricingTiers = [
  {
    name: 'Free Trial',
    price: 0,
    yearlyPrice: 0,
    storage: '100 GB',
    clients: 'Unlimited clients',
    projects: 'Unlimited projects',
    description: 'No credit card required',
    color: 'border-gray-600',
    buttonColor: 'bg-gray-600 hover:bg-gray-700',
    features: [
      '100 GB Storage',
      'Unlimited Clients',
      'Unlimited Projects',
      'Branded project pages',
      'File preview & cloud uploads',
      'Email notifications',
      'Project status tracking',
      'One-Link Client Hubs',
      'Studio-Centric Client Structure'
    ],
  },
  {
    name: 'Starter',
    price: 16,
    yearlyPrice: Math.round(16 * 12 * 0.8),
    storage: '2 GB',
    clients: '5 clients',
    projects: 'Up to 10 projects',
    projectsSubtext: 'across all clients',
    description: 'For freelancers / beginners',
    color: 'border-green-500/20',
    buttonColor: 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/30',
    features: [
      '2 GB Storage',
      '5 Clients Limit',
      'Up to 10 Projects',
      'Branded project pages',
      'File preview & cloud uploads',
      'Email notifications',
      'Project status tracking',
      'One-Link Client Hubs',
      'Studio-Centric Client Structure'
    ],
  },
  {
    name: 'Standard',
    price: 39,
    yearlyPrice: Math.round(39 * 12 * 0.8),
    storage: '20 GB',
    clients: '20 clients',
    projects: 'Up to 50 projects',
    projectsSubtext: 'across all clients',
    description: 'For small studios',
    color: 'border-blue-500/20',
    buttonColor: 'bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/30',
    features: [
      '20 GB Storage',
      '20 Clients Limit',
      'Up to 50 Projects',
      'Branded project pages',
      'File preview & cloud uploads',
      'Email notifications',
      'Project status tracking',
      'One-Link Client Hubs',
      'Studio-Centric Client Structure'
    ],
    popular: true
  },
  {
    name: 'Pro',
    price: 78,
    yearlyPrice: Math.round(78 * 12 * 0.8),
    storage: '100 GB',
    clients: 'Unlimited clients',
    projects: 'Unlimited projects',
    description: 'For active studios',
    color: 'border-purple-500/20',
    buttonColor: 'bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30',
    features: [
      '100 GB Storage',
      'Unlimited Clients',
      'Unlimited Projects',
      'Branded project pages',
      'File preview & cloud uploads',
      'Email notifications',
      'Project status tracking',
      'One-Link Client Hubs',
      'Studio-Centric Client Structure'
    ],
  }
];

export default function SignupPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className={`min-h-screen ${DESIGN_PATTERNS.COLORS.background} text-white py-12 px-4 sm:px-6 lg:px-8`}>
      {/* Header with Logo */}
      <div className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto mb-8`}>
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/Weshow-logo-white_300px.webp" 
              alt="WeShow Logo" 
              width={120} 
              height={40} 
              className="object-contain"
            />
          </Link>
          <Link 
            href="/studio/auth/login"
            className={`${DESIGN_PATTERNS.TEXT.secondary} hover:text-white transition-colors flex items-center`}
          >
            <span>Already have an account?</span>
            <span className="ml-2 text-[#00A3FF] hover:text-[#00C2FF]">Login</span>
          </Link>
        </div>
      </div>

      <div className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto`}>
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className={`text-3xl md:text-4xl ${DESIGN_PATTERNS.TEXT.heading} mb-4`}>Choose Your Plan</h1>
          <p className={`text-lg md:text-xl ${DESIGN_PATTERNS.TEXT.secondary}`}>Start managing your projects with our powerful platform</p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex justify-center mb-8 md:mb-12">
          <div className={`${DESIGN_PATTERNS.COLORS.card} p-1 rounded-lg inline-flex border ${DESIGN_PATTERNS.COLORS.border}`}>
            <button 
              onClick={() => setIsYearly(false)}
              className={`px-3 md:px-4 py-2 rounded-md transition-colors text-sm md:text-base ${
                !isYearly 
                  ? 'bg-[#00A3FF]/20 backdrop-blur-sm text-white shadow-lg shadow-[#00A3FF]/20 border border-[#00A3FF]/30' 
                  : DESIGN_PATTERNS.TEXT.tertiary
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              className={`px-3 md:px-4 py-2 rounded-md transition-colors text-sm md:text-base ${
                isYearly 
                  ? 'bg-[#00A3FF]/20 backdrop-blur-sm text-white shadow-lg shadow-[#00A3FF]/20 border border-[#00A3FF]/30' 
                  : DESIGN_PATTERNS.TEXT.tertiary
              }`}
            >
              Yearly (Save up to 20%)
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={DESIGN_PATTERNS.CARD.wrapper}
            >
              <div className={`${DESIGN_PATTERNS.CARD.inner} flex flex-col h-full p-4 md:p-6`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-[#00A3FF]/20 backdrop-blur-sm text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium shadow-lg shadow-[#00A3FF]/20 border border-[#00A3FF]/30">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className={`text-xl md:text-2xl ${DESIGN_PATTERNS.TEXT.heading} mb-3`}>
                    {tier.name}
                    {tier.name === 'Free Trial' && (
                      <span className={`ml-2 text-xs md:text-sm ${DESIGN_PATTERNS.TEXT.tertiary}`}>(14-day free trial)</span>
                    )}
                  </h3>
                  <p className={`${DESIGN_PATTERNS.TEXT.secondary} mb-4 text-sm md:text-base`}>{tier.description}</p>
                  <div className="mb-4">
                    <span className="text-3xl md:text-4xl font-bold">
                      ${isYearly ? tier.yearlyPrice : tier.price}
                    </span>
                    <span className={`${DESIGN_PATTERNS.TEXT.secondary} text-sm md:text-base`}>
                      /{isYearly ? 'year' : 'month'}
                    </span>
                    {isYearly && tier.price > 0 && (
                      <div className={`text-xs md:text-sm ${DESIGN_PATTERNS.TEXT.tertiary} mt-1`}>
                        (${(tier.yearlyPrice / 12).toFixed(0)}/month)
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-2 md:space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className={`flex items-center text-sm md:text-base ${DESIGN_PATTERNS.TEXT.secondary}`}>
                        <svg className={`${DESIGN_PATTERNS.ICON.medium} text-[#00A3FF] mr-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link 
                  href={`/studio/auth/register?plan=${tier.name.toLowerCase()}&billing=${isYearly ? 'yearly' : 'monthly'}`}
                  className={`w-full bg-[#00A3FF]/10 hover:bg-[#00A3FF]/20 border border-[#00A3FF]/20 hover:border-[#00A3FF]/30 text-white rounded-lg py-2 md:py-3 px-4 text-center text-sm md:text-base font-medium hover:opacity-90 transition-opacity mt-6`}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Included in All Plans */}
        <div className="mt-16 md:mt-20">
          <h2 className={`text-2xl md:text-3xl ${DESIGN_PATTERNS.TEXT.heading} mb-8 text-center`}>
            Included in All Plans
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4">
            {[
              {
                title: 'Branded Project Pages',
                description: 'Customize your project pages with your brand colors and logo'
              },
              {
                title: 'File Preview & Cloud Uploads',
                description: 'Preview files directly in the browser and upload to cloud storage'
              },
              {
                title: 'Email Notifications',
                description: 'Get notified when clients upload files or leave comments'
              },
              {
                title: 'Project Status Tracking',
                description: 'Track the status of your projects and keep clients updated'
              },
              {
                title: 'One-Link Client Hubs',
                description: 'Share a single link with clients to access all their projects'
              },
              {
                title: 'Studio-Centric Client Structure',
                description: 'Organize your clients and projects in a studio-centric way'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={DESIGN_PATTERNS.CARD.wrapper}
              >
                <div className={`${DESIGN_PATTERNS.CARD.inner} flex flex-col h-full p-4 md:p-6`}>
                  <div className="flex-1">
                    <h3 className={`text-lg md:text-xl ${DESIGN_PATTERNS.TEXT.heading} mb-2`}>
                      {feature.title}
                    </h3>
                    <p className={`${DESIGN_PATTERNS.TEXT.secondary} text-sm md:text-base`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Powered by AWS */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16 md:mt-20 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#00A3FF]/10 backdrop-blur-sm border border-[#00A3FF]/20 shadow-lg shadow-[#00A3FF]/10">
            <span className={`text-sm font-medium ${DESIGN_PATTERNS.TEXT.secondary}`}>Powered by</span>
            <Image 
              src="/Powered-By_logo-stack_CMYK.webp" 
              alt="AWS" 
              width={120} 
              height={40} 
              className="object-contain"
            />
          </div>
          <div className="mt-8 max-w-3xl mx-auto">
            <p className={`${DESIGN_PATTERNS.TEXT.secondary} text-sm md:text-base leading-relaxed`}>
              All your files — images, videos, and project materials — are stored securely on Amazon Web Services (AWS), the same infrastructure trusted by Netflix, Airbnb, and NASA.
            </p>
            <p className={`mt-4 ${DESIGN_PATTERNS.TEXT.secondary} text-sm md:text-base leading-relaxed`}>
              With WeShow, you're not just uploading files — you're delivering them through one of the fastest and most reliable cloud platforms in the world.
            </p>
          </div>
          <div className="mt-6 flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className={`text-sm ${DESIGN_PATTERNS.TEXT.secondary}`}>99.9% Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className={`text-sm ${DESIGN_PATTERNS.TEXT.secondary}`}>Global CDN</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#00A3FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className={`text-sm ${DESIGN_PATTERNS.TEXT.secondary}`}>Enterprise Security</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}