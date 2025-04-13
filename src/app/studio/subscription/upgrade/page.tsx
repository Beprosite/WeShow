'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStudio } from '@/app/contexts/StudioContext';
import MockPaymentForm from '@/components/MockPaymentForm';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/Button';

const pricingTiers = [
  {
    name: 'Starter',
    price: 16,
    yearlyPrice: 154,
    storage: '5 GB',
    clients: '5 clients',
    projects: 'Unlimited projects',
    description: 'For freelancers / beginners',
    color: 'text-green-500',
    features: [
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
    yearlyPrice: 374,
    storage: '20 GB',
    clients: '20 clients',
    projects: 'Unlimited projects',
    description: 'For small studios',
    color: 'text-blue-500',
    popular: true,
    features: [
      'Branded project pages',
      'File preview & cloud uploads',
      'Email notifications',
      'Project status tracking',
      'One-Link Client Hubs',
      'Studio-Centric Client Structure'
    ],
  },
  {
    name: 'Pro',
    price: 78,
    yearlyPrice: 748,
    storage: '100 GB',
    clients: 'Unlimited clients',
    projects: 'Unlimited projects',
    description: 'For active studios',
    color: 'text-purple-500',
    features: [
      'Branded project pages',
      'File preview & cloud uploads',
      'Email notifications',
      'Project status tracking',
      'One-Link Client Hubs',
      'Studio-Centric Client Structure'
    ],
  },
];

export default function UpgradePage() {
  const router = useRouter();
  const { studioData, isLoading, refreshStudioData } = useStudio();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async (tier: string) => {
    try {
      setIsUpgrading(true);
      
      // Don't allow upgrading to the same tier
      if (studioData?.subscription?.tier.toLowerCase() === tier.toLowerCase()) {
        toast.error("You are already on this plan");
        return;
      }

      const response = await fetch('/api/studio/subscription/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studioId: studioData?.id,
          tier: tier,
          currentTier: studioData?.subscription?.tier
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success('Subscription updated successfully');
        router.push('/studio/settings');
      } else {
        toast.error(data.message || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to update subscription. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      const response = await fetch('/api/studio/subscription/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: selectedTier?.toLowerCase(),
          billingPeriod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage;
        try {
          const jsonError = JSON.parse(errorData);
          errorMessage = jsonError.error || 'Failed to update subscription';
        } catch (e) {
          errorMessage = errorData || 'Failed to update subscription';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Refresh the studio data to show the new subscription
      await refreshStudioData();
      
      // Redirect to settings page
      router.push('/studio/settings');
    } catch (error) {
      console.error('Subscription update error:', error);
      setError(error instanceof Error ? error.message : 'Failed to update subscription');
      setShowPaymentForm(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedTier(null);
  };

  if (showPaymentForm && selectedTier) {
    const tier = pricingTiers.find(t => t.name.toLowerCase() === selectedTier);
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="mb-8">
            <ol className="flex items-center space-x-2 text-sm font-light">
              <li>
                <Link href="/studio/dashboard/clients" className="text-white/60 hover:text-white">
                  Back to Clients
                </Link>
              </li>
              <li className="text-white/60">/</li>
              <li>
                <Link href="/studio/settings" className="text-white/60 hover:text-white">
                  Settings
                </Link>
              </li>
              <li className="text-white/60">/</li>
              <li className="text-white">Subscription</li>
            </ol>
          </nav>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-light mb-4 text-white">Confirm Your Subscription</h1>
            <p className="text-xl text-white/60 font-light">
              {tier?.name} Plan - ${billingPeriod === 'yearly' ? tier?.yearlyPrice : tier?.price}/{billingPeriod}
            </p>
          </div>
          <MockPaymentForm onSuccess={handlePaymentSuccess} onCancel={handlePaymentCancel} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm font-light">
            <li>
              <Link href="/studio/dashboard/clients" className="text-white/60 hover:text-white">
                Back to Clients
              </Link>
            </li>
            <li className="text-white/60">/</li>
            <li>
              <Link href="/studio/settings" className="text-white/60 hover:text-white">
                Settings
              </Link>
            </li>
            <li className="text-white/60">/</li>
            <li className="text-white">Subscription</li>
          </ol>
        </nav>

        {/* Subscription Cancellation Banner */}
        {studioData?.subscription?.status === 'cancelled' && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-500">
                  Your subscription has been cancelled
                </h3>
                <div className="mt-2 text-sm text-amber-500/80">
                  <p>
                    Your access will end on{' '}
                    <span className="font-medium">
                      {new Date(studioData?.subscription?.currentPeriodEnd || '').toLocaleDateString()}
                    </span>
                    . Choose a new plan to continue using our platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light mb-4 text-white">
            {studioData?.subscription?.status === 'cancelled' ? 'Renew Your Subscription' : 'Upgrade Your Plan'}
          </h1>
          <p className="text-xl text-white/60 font-light">
            {studioData?.subscription?.status === 'cancelled' 
              ? 'Choose a plan to continue using our platform'
              : 'Select the plan that best fits your needs'}
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-12">
          <div className="relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0">
            <div className="bg-gradient-to-b from-[#0A0A0A] to-black border border-white/10 p-1 rounded-lg inline-flex">
              <button 
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-md transition-colors font-light ${
                  billingPeriod === 'monthly' ? 'bg-black hover:bg-[#222222] text-white' : 'text-white/40'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-md transition-colors font-light ${
                  billingPeriod === 'yearly' ? 'bg-black hover:bg-[#222222] text-white' : 'text-white/40'
                }`}
              >
                Yearly (Save up to 20%)
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Current Plan Card */}
          {!isLoading && studioData?.subscription && (
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0`}
            >
              <div className="bg-gradient-to-b from-[#0A0A0A] to-black border-2 border-amber-500/30 rounded-2xl p-6 flex flex-col h-full relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-black text-amber-500 px-4 py-1 rounded-full text-xs font-light border-2 border-amber-500/30">
                    Current Plan
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-light mb-3 text-amber-500">
                    {studioData?.subscription?.tier}
                  </h3>
                  <p className="text-white/60 mb-4 font-light">Your current subscription</p>
                  <div className="mb-4">
                    <span className="text-4xl font-light text-white">
                      ${pricingTiers.find(t => t.name.toLowerCase() === studioData?.subscription?.tier?.toLowerCase())?.price || 0}
                    </span>
                    <span className="text-white/60 font-light">
                      /{studioData?.subscription?.billingPeriod}
                    </span>
                  </div>
                  
                  <div className="mb-6 p-4 bg-black/20 rounded-lg border border-white/5">
                    <p className="text-white/60 font-light mb-2">Renewal Date:</p>
                    <p className="text-white font-light">
                      {new Date(studioData?.subscription?.currentPeriodEnd || '').toLocaleDateString()}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-white/60 font-light mb-2">Storage Limit:</p>
                      <p className="text-white font-light">
                        {pricingTiers.find(t => t.name.toLowerCase() === studioData?.subscription?.tier?.toLowerCase())?.storage || 'Storage'}
                      </p>
                      <p className="text-white/40 text-sm font-light mt-1">
                        Free tier: 1 GB
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60 font-light mb-2">Client Limit:</p>
                      <p className="text-white font-light">
                        {pricingTiers.find(t => t.name.toLowerCase() === studioData?.subscription?.tier?.toLowerCase())?.clients || 'Clients'}
                      </p>
                      <p className="text-white/40 text-sm font-light mt-1">
                        Free tier: 1 client
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  className="w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/30 text-amber-500 rounded-lg py-3 px-4 text-center font-light transition-all duration-200 mt-6 backdrop-blur-sm shadow-lg cursor-not-allowed opacity-50"
                  disabled
                >
                  Current Plan
                </button>
              </div>
            </motion.div>
          )}

          {/* Other Plans */}
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-[1px] before:absolute before:w-[10px] before:h-[10px] before:border-t before:border-l before:border-white/20 before:top-0 before:left-0 after:absolute after:w-[10px] after:h-[10px] after:border-b after:border-r after:border-white/20 after:bottom-0 after:right-0 ${
                tier.popular ? 'transform scale-105' : ''
              }`}
            >
              <div className="bg-gradient-to-b from-[#0A0A0A] to-black border border-white/10 rounded-2xl p-6 flex flex-col min-h-[450px]">
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-black text-blue-500 px-4 py-1 rounded-full text-xs font-light border-2 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                      Most Popular
                    </div>
                  </div>
                )}
                <div>
                  <h3 className={`text-2xl font-light mb-3 ${tier.color}`}>{tier.name}</h3>
                  <p className="text-white/60 mb-4 font-light">{tier.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-light text-white">
                      ${billingPeriod === 'yearly' ? tier.yearlyPrice : tier.price}
                    </span>
                    <span className="text-white/60 font-light">
                      /{billingPeriod}
                    </span>
                    {billingPeriod === 'yearly' && tier.price > 0 && (
                      <div className="text-sm text-white/40 mt-1 font-light">
                        (${(tier.yearlyPrice / 12).toFixed(0)}/month)
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center font-light text-white/60">
                      <svg className="w-4 h-4 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {tier.storage} Storage
                    </li>
                    <li className="flex items-center font-light text-white/60">
                      <svg className="w-4 h-4 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {tier.clients}
                    </li>
                    <li className="flex items-center font-light text-white/60">
                      <svg className="w-4 h-4 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {tier.projects}
                    </li>
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center font-light text-white/60">
                        <svg className="w-4 h-4 text-white/60 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={() => handleUpgrade(tier.name.toLowerCase())}
                  disabled={isUpgrading || (studioData?.subscription?.tier?.toLowerCase() || '') === tier.name.toLowerCase()}
                  className={`w-full bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/30 text-white rounded-lg py-3 px-4 text-center font-light transition-all duration-200 mt-6 backdrop-blur-sm shadow-lg ${
                    studioData?.subscription?.tier === tier.name ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUpgrading ? 'Upgrading...' : studioData?.subscription?.tier === tier.name ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {error && (
          <div className="mt-8 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 