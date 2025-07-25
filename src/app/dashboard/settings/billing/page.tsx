'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Check, Crown, Zap, Loader2, Star } from 'lucide-react';
import { useBillingQuery } from '@/hooks/useBillingQuery';

/**
 * Client-side content for the Billing Settings Page.
 * This component handles all client-side logic, including hooks like useSearchParams.
 */
function BillingPageClientContent() {
  const router = useRouter();
  const { isSignedIn, isLoaded, orgId } = useAuth();
  const { planInfo, creditBalance, plans, isLoadingBilling, billingError } = useBillingQuery(orgId);
  const [isCreatingPortalSession, setIsCreatingPortalSession] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const [processedSessionId, setProcessedSessionId] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');

    if (sessionId && sessionId === processedSessionId) {
      console.log(`[BillingPage] Session ${sessionId} already processed in this client session. Skipping re-verification.`);
      return;
    }

    if (status === 'success' && sessionId) {
      const verifySessionAndRefreshData = async () => {
        try {
          console.log(`[BillingPage] Verifying session: ${sessionId}`);
          const response = await fetch(`/api/billing/verify-checkout-session?session_id=${sessionId}`);
          const data = await response.json();

          if (response.ok && data.paymentStatus === 'paid') {
            const message = data.message?.toLowerCase() || '';
            if (message.includes('granted') || message.includes('processed') || message.includes('re-applied')) {
              console.log(`[BillingPage] Session ${sessionId} verified successfully. API Message: ${data.message}. Refreshing plan info.`);
              // The useBillingQuery hook will automatically refetch data if orgId changes or if the session is verified.
              // No need to call fetchPlanInfo here directly.
              setProcessedSessionId(sessionId);
            } else {
               console.warn(`[BillingPage] Session ${sessionId} paid, but API message indicates credits might not have been processed as expected:`, data.message);
               // The useBillingQuery hook will automatically refetch data if orgId changes or if the session is verified.
               setProcessedSessionId(sessionId);
            }
          } else if (response.ok && data.paymentStatus !== 'paid') {
            console.log(`[BillingPage] Session ${sessionId} payment status: ${data.paymentStatus}. Not refreshing credits yet as payment is not complete.`);
            setProcessedSessionId(sessionId);
          } else {
            console.warn(`[BillingPage] Failed to verify session ${sessionId} or an API error occurred:`, data.message || response.statusText);
          }
        } catch (error) {
          console.error(`[BillingPage] Error calling verify-checkout-session API for session ${sessionId}:`, error);
        }
      };

      verifySessionAndRefreshData();
    }
  }, [searchParams, orgId, processedSessionId]); // Added orgId to dependency array

  /**
   * Subscription plans configuration - Now uses PlansList from types/credit.ts
   * We'll map PlansList to the structure needed by the UI if necessary,
   * or adapt the UI to directly use PlanDetails properties.
   * For simplicity, let's adapt the rendering part to use PlanDetails directly.
   * We'll need to add UI-specific properties like 'popular', 'buttonText', 'price string', 'period', 'features' to PlansList items
   * or create a mapping. For now, let's define UI-specific details here and merge.
   */
  const uiPlanDetails = {
    free: {
      priceDisplay: '$0',
      period: '/month',
      description: 'Get started for free',
      features: ['Basic access'],
      popular: false,
      buttonText: 'Current Plan' // Or not shown if it's the default free
    },
    first: { // Corresponds to 'first' ID from types/credit.ts
      priceDisplay: '$19',
      period: '/month',
      description: 'Perfect for personal projects',
      features: ['1,000 credits per month'], // This should align with PlanDetails.creditsInUSDCents
      popular: false,
      buttonText: 'Get Started'
    },
    second: { // Corresponds to 'second' ID
      priceDisplay: '$49',
      period: '/month',
      description: 'Best for growing businesses',
      features: ['4,000 credits per month'],
      popular: true,
      buttonText: 'Start Standard'
    },
    third: { // Corresponds to 'third' ID
      priceDisplay: '$99',
      period: '/month',
      description: 'For scaling organizations',
      features: ['10,000 credits per month'],
      popular: false,
      buttonText: 'Get Growth'
    }
  };

  // Combine PlanDetails from types/credit.ts with UI specific details
  const displayPlans = plans.filter(plan => plan.id !== 'free').map(plan => ({
    ...plan,
    ...(uiPlanDetails as any)[plan.id] // Type assertion for dynamic access
  }));

  /**
   * Handle subscription checkout
   */
  const handleSubscriptionCheckout = async (planId: string) => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    setCheckoutLoading(planId);
    try {
      const response = await fetch('/api/billing/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
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

  // Actual JSX for the page content
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
          if (!isLoaded || isLoadingBilling) {
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
          if (isSignedIn && planInfo) {
            // User is signed in. Check if plan info is still loading.
            return (
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-700/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
                        {hasActiveSubscription ? (
                          <>
                            <Crown className="h-5 w-5 text-yellow-500 dark:text-yellow-400" suppressHydrationWarning />
                            Current Plan: {planInfo.planStatus?.name}
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
                          ? `Status: ${planInfo.planStatus?.status} • ${planInfo.planStatus?.price} ${planInfo.planStatus?.billingPeriod}`
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
                {creditBalance && (
                  <CardContent>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Credits Balance: </span>
                      {creditBalance.balance} credits
                    </div>
                  </CardContent>
                )}
              </Card>
            );
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
          {displayPlans.map((plan) => (
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
                    {plan.priceDisplay}
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
                  {plan.features.map((feature: string, index: number) => (
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

/**
 * Main Billing Settings Page component.
 * This component acts as a wrapper and uses Suspense to handle client-side dependencies.
 */
export default function BillingSettingsPage() {
  // The 'use client' directive is in BillingPageClientContent.
  // This parent component can be a Server Component or a Client Component that doesn't directly use client-only hooks.
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center h-screen w-full">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" /> 
        <p className='text-lg text-gray-700 dark:text-gray-300'>Loading billing information...</p>
        <p className='text-sm text-gray-500 dark:text-gray-400'>Please wait a moment.</p>
      </div>
    }>
      <BillingPageClientContent />
    </Suspense>
  );
} 