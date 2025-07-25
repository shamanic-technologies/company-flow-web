/**
 * API Route: /api/credits/plan-info
 * 
 * Returns detailed plan information including product name, pricing, and usage
 */
import { NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createErrorResponse } from '../../utils';
// import {
//   getCustomerCreditBalance,
//   getDetailedSubscriptionInfo,
//   // grantInitialCreditsIfNeeded, // This is handled within getOrCreateStripeCustomer
// } from '../../../../lib/stripe'; // Adjusted path
import { PlanStatus, PlanInfo, Pricing } from '@/types/credit';
import { getCustomerCreditBalance as getCustomerCreditBalanceInUSDCents, getOrCreateStripeCustomer } from '@/lib/stripe/stripe';
import { getDetailedSubscriptionInfo } from '@/lib/stripe/stripe';
import Stripe from 'stripe';

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Still needed for stripe.customers.retrieve for free plan metadata


/**
 * GET handler for plan information
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Authentication check
    const user = await currentUser();
    
    if (!user) {
      console.error('[API /credits/plan-info] User not authenticated');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // 2. Get Stripe customer (this will also create if not exists and grant initial credits)
    const customer: Stripe.Customer = await getOrCreateStripeCustomer(user);

    // 3. Get subscription details with product information from centralized function
    const subscriptionInfo = await getDetailedSubscriptionInfo(customer);

    // 4. Get credit balance from centralized function
    const creditBalanceInUSDCents : number = await getCustomerCreditBalanceInUSDCents(customer);

    // 5. Handle free plan vs paid subscription
    let planInfo: PlanStatus | null = null;
    let monthlyAllocation = 0;
    let hasActiveSubscription = false;
    let planType = 'paid'; // Default to paid, will be overridden if free plan

    if (subscriptionInfo) {
      // User has a paid subscription
      hasActiveSubscription = subscriptionInfo.status === 'active';
      monthlyAllocation = getMonthlyAllocationFromSubscription(subscriptionInfo);
      
      planInfo = {
        name: subscriptionInfo.productName,
        status: subscriptionInfo.status,
        price: subscriptionInfo.priceFormatted,
        billingPeriod: subscriptionInfo.billingPeriod,
        nextBilling: subscriptionInfo.nextBilling
      };
      // planType remains 'paid' implicitly
    } else {
    
      planInfo = {
        name: 'Free Plan', // TODO: Potentially make this dynamic based on planType if more free tiers exist
        status: 'active'
      };
      
      monthlyAllocation = Pricing.COMPANY_FLOW_FREE_SIGNUP_CREDIT_AMOUNT_IN_USD_CENTS; // Default to 0 for ongoing free plan, initial grant separate.

      hasActiveSubscription = false;
    }

    const planInfoResponse: PlanInfo = {
      planStatus: planInfo,
      credits: {
        balance: creditBalanceInUSDCents,
        monthlyAllocation,
      },
      hasActiveSubscription
    };

    return new Response(JSON.stringify(planInfoResponse), {
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
