/**
 * API Route: /api/credits/validate
 * 
 * Validates if the user has enough credits to run an agent operation.
 * Returns credit balance and validation status.
 */
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createErrorResponse } from '../../utils';
import {
  getOrCreateStripeCustomer,
  getCustomerCreditBalance as getCustomerCreditBalanceInUSDCents,
  getActiveSubscription,
} from '../../../../lib/stripe'; // Adjusted path
import { CreditBalance } from '@/types/credit';
import Stripe from 'stripe';
import { ServiceResponse } from '@agent-base/types';

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // No longer needed here

/**
 * POST handler for credit validation
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const { userId } = await auth();
    
    if (!userId) {
      console.error('[API /credits/validate] User not authenticated');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // 2. Get or create Stripe customer
    const stripeCustomer: Stripe.Customer = await getOrCreateStripeCustomer(userId);

    // 3. Check credit balance (in cents)
    const creditBalanceInUSDCents = await getCustomerCreditBalanceInUSDCents(stripeCustomer);

    // 4. Get subscription info
    const subscriptionInfo = await getActiveSubscription(stripeCustomer);

    // 5. Validate if user has enough credits (comparison in cents)
    const hasCredits = creditBalanceInUSDCents > 0;

    const creditValidationResponse: CreditBalance = {
      hasCredits,
      balance: creditBalanceInUSDCents, // Balance in cents
      stripeCustomerId: stripeCustomer.id,
      subscription: subscriptionInfo
    };

    return new Response(JSON.stringify(creditValidationResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[API /credits/validate] Error:', error);
    return createErrorResponse(500, 'VALIDATION_ERROR', 'Failed to validate credits', error.message);
  }
}

// Removed getOrCreateStripeCustomer, getCustomerCreditBalance, getActiveSubscription 
// as they are now in lib/stripe.ts 