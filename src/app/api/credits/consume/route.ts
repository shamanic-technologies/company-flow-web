/**
 * API Route: /api/credits/consume
 * 
 * Consumes credits after an agent operation based on credit_info.
 * This should be called after the streaming response is completed.
 */
import { NextRequest } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createErrorResponse } from '../../utils';
import {
  getOrCreateStripeCustomer,
  consumeStripeCredits,
  getCustomerCreditBalance as getCustomerCreditBalanceInUSDCents,
} from '../../../../lib/stripe/stripe'; // Adjusted path to lib/stripe.ts
import { ServiceResponse } from '@agent-base/types';
import Stripe from 'stripe';
import { ConsumeCreditsRequest, ConsumeCreditsResponse } from '@/types/credit';

/**
 * POST handler for credit consumption
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const user = await currentUser();
    
    if (!user) {
      console.error('[API /credits/consume] User not authenticated');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // 2. Parse request body
    const { totalAmountInUSDCents, conversationId }: ConsumeCreditsRequest = await req.json();

    if (!totalAmountInUSDCents) {
      return createErrorResponse(400, 'INVALID_REQUEST', 'Missing totalAmountInUSDCents');
    }

    if (!conversationId) {
      return createErrorResponse(400, 'INVALID_REQUEST', 'Missing conversationId');
    }

    const stripeCustomer: Stripe.Customer = await getOrCreateStripeCustomer(user);

    // If no credits to consume (e.g. 0 tokens, or free operation), return success with current balance.
    if (totalAmountInUSDCents <= 0) {
      console.log('[API /credits/consume] No credits to consume for operation:', totalAmountInUSDCents);
      const remainingBalanceInUSDCents = await getCustomerCreditBalanceInUSDCents(stripeCustomer); // Fetch fresh balance (in cents)
      const response: ConsumeCreditsResponse = {
          creditsConsumedInUSDCents: 0,
          remainingBalanceInUSDCents: remainingBalanceInUSDCents,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Consume credits from Stripe (creditsToConsume is in cents)
    const consumeResult : ConsumeCreditsResponse = await consumeStripeCredits(stripeCustomer, totalAmountInUSDCents, conversationId);

    return new Response(JSON.stringify(consumeResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[API /credits/consume] Error:', error);
    
    if (error.message === 'INSUFFICIENT_CREDITS') {
      return createErrorResponse(402, 'INSUFFICIENT_CREDITS', 'Not enough credits to complete operation');
    }
    // The 'NO_ACTIVE_GRANTS_FOUND_FOR_CONSUMPTION' error is obsolete with customer balance.
    // A general error will be caught below.

    return createErrorResponse(500, 'CONSUME_ERROR', 'Failed to consume credits', error.message);
  }
}

// /**
//  * Calculate credits to consume based on usage info.
//  * The returned value should be in cents.
//  * Example: 1 credit unit = 1 cent ($0.01).
//  */
// function calculateCreditsFromUsage(creditInfo: ConsumeCreditsRequest['creditInfo']): number {
//   // If totalCredits is provided (assumed to be in cents), use it directly.
//   if (creditInfo.totalCredits && creditInfo.totalCredits > 0) {
//     return creditInfo.totalCredits;
//   }

//   // Calculate based on tokens (example pricing in cents)
//   let credits = 0;
//   // Example: 1 cent per 1000 input tokens (0.001 cents per token, result rounded up)
//   const INPUT_TOKEN_COST_PER_TOKEN = 0.001; // 1 cent / 1000 tokens
//   // Example: 2 cents per 1000 output tokens (0.002 cents per token, result rounded up)
//   const OUTPUT_TOKEN_COST_PER_TOKEN = 0.002; // 2 cents / 1000 tokens

//   if (creditInfo.inputTokens) {
//     credits += Math.ceil(creditInfo.inputTokens * INPUT_TOKEN_COST_PER_TOKEN);
//   }
  
//   if (creditInfo.outputTokens) {
//     credits += Math.ceil(creditInfo.outputTokens * OUTPUT_TOKEN_COST_PER_TOKEN);
//   }

//   // Ensure a minimum of 0 credits (cents).
//   return Math.max(credits, 0);
// }
