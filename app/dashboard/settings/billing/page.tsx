'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Crown, Zap, Loader2, Star } from 'lucide-react';
import { usePlanInfo } from '@/hooks/usePlanInfo';

/**
 * Billing Settings Page
 * 
 * This page displays custom subscription plans with checkout functionality,
 * current subscription status, and customer portal access for managing subscriptions.
 */
export default function BillingSettingsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { planInfo, isLoading: planInfoLoading } = usePlanInfo();
  const [isCreatingPortalSession, setIsCreatingPortalSession] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  /**
   * Subscription plans configuration
   */
  const subscriptionPlans = [
    {
      id: 'starter',
      name: 'Hobby',
      price: '$19',
      period: '/month',
      description: 'Perfect for personal projects',
      features: [
        '2,000 credits per month'
      ],
      popular: false,
      buttonText: 'Get Started'
    },
    {
      id: 'pro',
      name: 'Standard',
      price: '$49',
      period: '/month',
      description: 'Best for growing businesses',
      features: [
        '4,000 credits per month'
      ],
      popular: true,
      buttonText: 'Start Standard'
    },
    {
      id: 'enterprise',
      name: 'Growth',
      price: '$99',
      period: '/month',
      description: 'For scaling organizations',
      features: [
        '10,000 credits per month'
      ],
      popular: false,
      buttonText: 'Get Growth'
    }
  ];

  /**
   * Handle subscription checkout
   */
  const handleSubscriptionCheckout = async (planType: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setCheckoutLoading(planType);
    try {
      const response = await fetch('/api/billing/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // You might want to show a toast notification here
    } finally {
      setCheckoutLoading(null);
    }
  };

  /**
   * Handle customer portal access for existing subscribers
   */
  const handleManageSubscription = async () => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setIsCreatingPortalSession(true);
    try {
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const portalUrl = await response.json();
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Error creating portal session:', error);
      // You might want to show a toast notification here
    } finally {
      setIsCreatingPortalSession(false);
    }
  };

  /**
   * Check if user has an active subscription
   */
  const hasActiveSubscription = planInfo?.hasActiveSubscription || false;

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="container mx-auto py-8 px-4 md:px-6 min-h-full">
      {/* Header with return button */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" suppressHydrationWarning />
          Back
        </Button>
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Subscription Plans
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Choose the plan that best fits your needs. You can upgrade, downgrade, or manage your subscription.
        </p>
      </header>

      {/* Current Plan Status for Signed-in Users */}
      <div className="mb-8">
        {(() => {
          // If Clerk is still initializing, show the skeleton immediately.
          // We assume the middleware has ensured the user is authenticated.
          if (!isLoaded) {
            return (
              <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 min-h-[140px] flex flex-col justify-center">
                <CardHeader>
                  <div>
                    <Skeleton className="h-6 w-48 mb-2 rounded-md" />
                    <Skeleton className="h-4 w-64 rounded-md" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-40 rounded-md" />
                </CardContent>
              </Card>
            );
          }

          // Clerk has loaded. Now check isSignedIn.
          if (isSignedIn) {
            // User is signed in. Check if plan info is still loading.
            if (planInfoLoading) {
              return (
                <Card className="bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 min-h-[140px] flex flex-col justify-center">
                  <CardHeader>
                    <div>
                      <Skeleton className="h-6 w-48 mb-2 rounded-md" />
                      <Skeleton className="h-4 w-64 rounded-md" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </CardContent>
                </Card>
              );
            } else if (planInfo) {
              // Plan info has loaded, display it.
              return (
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
                          {hasActiveSubscription ? (
                            <>
                              <Crown className="h-5 w-5 text-yellow-500 dark:text-yellow-400" suppressHydrationWarning />
                              Current Plan: {planInfo.plan?.name}
                            </>
                          ) : (
                            <>
                              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" suppressHydrationWarning />
                              Free Plan
                            </>
                          )}
                        </CardTitle>
                        <CardDescription className="text-gray-700 dark:text-gray-300">
                          {hasActiveSubscription
                            ? `Status: ${planInfo.plan?.status} • ${planInfo.plan?.price} ${planInfo.plan?.billingPeriod}`
                            : "You're currently on the free plan"}
                        </CardDescription>
                      </div>
                      {hasActiveSubscription && (
                        <Button
                          onClick={handleManageSubscription}
                          disabled={isCreatingPortalSession}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isCreatingPortalSession ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" suppressHydrationWarning />
                              Loading...
                            </>
                          ) : (
                            'Manage Subscription'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  {planInfo.credits && (
                    <CardContent>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Credits Balance: </span>
                        ${(-planInfo.credits.balance / 100).toFixed(2)}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            }
            // If planInfo is null/undefined after loading, render nothing for now
            return null;
          }
          // isLoaded is true, but user is not signed in.
          // This should ideally not be reached if middleware is effective.
          // Rendering null or you could add a specific message/redirect.
          return null;
        })()}
      </div>
      
      {/* Subscription Plans */}
      <div className="mb-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700/50 border-2' 
                  : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" suppressHydrationWarning />
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" suppressHydrationWarning />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscriptionCheckout(plan.id)}
                  disabled={checkoutLoading === plan.id}
                  className={`w-full mt-6 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100'
                  }`}
                >
                  {checkoutLoading === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" suppressHydrationWarning />
                      Loading...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
} 