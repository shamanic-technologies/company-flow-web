/**
 * API Route: /api/credits/plan-info
 * 
 * Returns detailed plan information including product name, pricing, and usage
 */
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createErrorResponse } from '../../utils';
import {
  getOrCreateStripeCustomer, 
  getCustomerCreditBalance,
  getDetailedSubscriptionInfo,
  // grantInitialCreditsIfNeeded, // This is handled within getOrCreateStripeCustomer
} from '../../../../lib/stripe'; // Adjusted path

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Still needed for stripe.customers.retrieve for free plan metadata

interface PlanInfoResponse {
  plan: {
    name: string;
    status: string;
    price: string;
    billingPeriod: string;
    nextBilling?: string;
  } | null;
  credits: {
    balance: number;
    monthlyAllocation?: number;
    used?: number;
  };
  hasActiveSubscription: boolean;
}

/**
 * GET handler for plan information
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentication check
    const { userId } = await auth();
    
    if (!userId) {
      console.error('[API /credits/plan-info] User not authenticated');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // 2. Get Stripe customer (this will also create if not exists and grant initial credits)
    const customerId = await getOrCreateStripeCustomer(userId);

    // 3. Get subscription details with product information from centralized function
    const subscriptionInfo = await getDetailedSubscriptionInfo(customerId);

    // 4. Get credit balance from centralized function
    const creditBalance = await getCustomerCreditBalance(customerId);

    // 5. Handle free plan vs paid subscription
    let planInfo = null;
    let monthlyAllocation = 0;
    let creditsUsed = 0;
    let hasActiveSubscription = false;
    let planType = 'paid'; // Default to paid, will be overridden if free plan

    if (subscriptionInfo) {
      // User has a paid subscription
      hasActiveSubscription = subscriptionInfo.status === 'active';
      monthlyAllocation = getMonthlyAllocationFromSubscription(subscriptionInfo);
      // Ensure creditsUsed is not negative if balance exceeds monthly allocation (e.g. from top-ups)
      creditsUsed = Math.max(0, monthlyAllocation - creditBalance);
      
      planInfo = {
        name: subscriptionInfo.productName,
        status: subscriptionInfo.status,
        price: subscriptionInfo.priceFormatted,
        billingPeriod: subscriptionInfo.billingPeriod,
        nextBilling: subscriptionInfo.nextBilling
      };
      // planType remains 'paid' implicitly
    } else {
      // User is on free plan (no active subscription)
      // We might still have customer metadata for plan_type if set elsewhere
      const customer = await stripe.customers.retrieve(customerId) as any; // Using 'any' due to dynamic metadata
      planType = customer.metadata?.plan_type || 'free'; // Set planType for free plan
      
      planInfo = {
        name: 'Free Plan', // TODO: Potentially make this dynamic based on planType if more free tiers exist
        status: 'active',
        price: '$0.00',
        billingPeriod: 'monthly', // Or as defined for free plans
        nextBilling: undefined // No next billing for a typical free plan
      };
      
      // Free plan allocation (example: 200 initial credits, then 0 monthly unless topped up)
      // The initial 200 credits are handled by grantInitialCreditsIfNeeded via getOrCreateStripeCustomer.
      // Monthly allocation for free plan is typically 0 unless specific promotions are active.
      monthlyAllocation = 0; // Default to 0 for ongoing free plan, initial grant separate.
      // If they have a balance, it implies they are using their initial grant or topped up.
      // Used credits calculation for free plan might be less relevant than just showing balance.
      // Let's show balance as allocation if it's from initial grant, and 0 used, or refine this.
      if (creditBalance > 0 && planType === 'free') {
        // For simplicity, if they have a balance on free plan, consider it their current "allocation"
        monthlyAllocation = creditBalance; 
        creditsUsed = 0; // They haven't "used" against a recurring monthly amount
      } else {
        creditsUsed = 0; // No recurring monthly allocation to be used against.
      }
      hasActiveSubscription = false;
    }

    const response: PlanInfoResponse = {
      plan: planInfo,
      credits: {
        balance: creditBalance,
        // Only show monthlyAllocation if it's meaningful (e.g., paid plan or specific free allocation)
        monthlyAllocation: (hasActiveSubscription || (planType === 'free' && monthlyAllocation > 0) ) ? monthlyAllocation : undefined,
        used: (hasActiveSubscription && creditsUsed > 0) ? creditsUsed : undefined
      },
      hasActiveSubscription
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[API /credits/plan-info] Error:', error);
    return createErrorResponse(500, 'PLAN_INFO_ERROR', 'Failed to get plan information', error.message);
  }
}


/**
 * Get monthly credit allocation based on subscription product metadata or name.
 * This function remains local as it depends on product naming conventions or specific metadata fields 
 * that are part of this application's business logic for plans.
 */
function getMonthlyAllocationFromSubscription(subscriptionInfo: any): number {
  // Check product metadata first (recommended approach for flexibility)
  if (subscriptionInfo.metadata?.monthly_credits) {
    const credits = parseInt(subscriptionInfo.metadata.monthly_credits, 10);
    if (!isNaN(credits)) return credits;
  }
  
  // Fallback: Calculate based on product name (less flexible)
  const productName = subscriptionInfo.productName.toLowerCase();
  if (productName.includes('hobby')) return 1000;
  if (productName.includes('standard')) return 4000;
  if (productName.includes('growth')) return 10000;
  
  // Calculate based on price if no metadata or name match
  const priceString = subscriptionInfo.priceFormatted;
  if (priceString.includes('$19')) return 1000; // Hobby
  if (priceString.includes('$49')) return 4000; // Standard
  if (priceString.includes('$99')) return 10000; // Growth
  
  console.warn('[getMonthlyAllocationFromSubscription] No monthly credit allocation found for product:', subscriptionInfo.productName, 'Fallback to 0.');
  return 0; // Default to 0 if no specific allocation is found
}
