'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStudio } from '@/app/contexts/StudioContext';
import MockPaymentForm from '@/components/MockPaymentForm';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/Button';

const plans = [
  {
    name: 'Free',
    price: 0,
    features: [
      '1 Project',
      'Basic Features',
      'Community Support',
      'Limited Storage'
    ],
    buttonText: 'Current Plan',
    isCurrent: true
  },
  {
    name: 'Premium',
    price: 29.99,
    features: [
      'Unlimited Projects',
      'Advanced Features',
      'Priority Support',
      'Unlimited Storage',
      'Custom Branding'
    ],
    buttonText: 'Upgrade Now',
    isCurrent: false
  }
];

export default function UpgradePage() {
  const router = useRouter();
  const { studioData, isLoading, refreshStudioData } = useStudio();
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
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
    setIsUpgrading(true);
    try {
      // Update studio subscription in your database
      await refreshStudioData();
      
      toast.success('Subscription upgraded successfully!');
    } catch (error) {
      toast.error('Failed to update subscription. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(plans[0]);
  };

  if (showPaymentForm && selectedPlan.name !== 'Free') {
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
              {selectedPlan.name} Plan - ${selectedPlan.price}/month
            </p>
          </div>
          <MockPaymentForm onSuccess={handlePaymentSuccess} onCancel={handlePaymentCancel} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Select the plan that best fits your needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.02 }}
              className={`rounded-lg shadow-lg overflow-hidden ${
                plan.isCurrent ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="px-6 py-8 bg-white">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="ml-1 text-xl font-semibold text-gray-500">
                    /month
                  </span>
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-6 w-6 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-4 bg-gray-50">
                {plan.name === 'Free' ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={plan.isCurrent}
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <MockPaymentForm
                    amount={plan.price}
                    description={`Upgrade to ${plan.name} Plan`}
                    onSuccess={handlePaymentSuccess}
                    onError={(error) => toast.error(error)}
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/studio/dashboard">
            <Button variant="secondary">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 