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
  getCustomerCreditBalance,
  getActiveSubscription,
} from '../../../../lib/stripe'; // Adjusted path

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // No longer needed here

interface CreditValidationResponse {
  hasCredits: boolean;
  balance: number; // Balance in cents
  customerId: string;
  subscription?: {
    id: string;
    status: string;
    currentPeriodEnd: number;
  } | null;
}

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

    // 2. Get request body (optional - for future cost estimation)
    // estimatedCredits should be in cents. Defaults to 1 cent if not provided.
    const { estimatedCredits = 1 } = await req.json().catch(() => ({ estimatedCredits: 1 })); 

    // 3. Get or create Stripe customer
    const customerId = await getOrCreateStripeCustomer(userId);

    // 4. Check credit balance (in cents)
    const creditBalance = await getCustomerCreditBalance(customerId);

    // 5. Get subscription info
    const subscriptionInfo = await getActiveSubscription(customerId);

    // 6. Validate if user has enough credits (comparison in cents)
    const hasCredits = creditBalance >= estimatedCredits;

    const response: CreditValidationResponse = {
      hasCredits,
      balance: creditBalance, // Balance in cents
      customerId,
      subscription: subscriptionInfo
    };

    return new Response(JSON.stringify(response), {
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