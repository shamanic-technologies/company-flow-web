/**
 * API Route: /api/credits/consume
 * 
 * Consumes credits after an agent operation based on credit_info.
 * This should be called after the streaming response is completed.
 */
import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createErrorResponse } from '../../utils';
import {
  getOrCreateStripeCustomer,
  consumeStripeCredits,
  getCustomerCreditBalance,
} from '../../../../lib/stripe'; // Adjusted path to lib/stripe.ts

// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // No longer needed here

interface ConsumeCreditsRequest {
  creditInfo: {
    inputTokens?: number;
    outputTokens?: number;
    totalCredits?: number;
    operationType?: string;
  };
  conversationId?: string;
}

interface ConsumeCreditsResponse {
  success: boolean;
  creditsConsumed: number;
  remainingBalance: number;
  transactionId?: string;
}

/**
 * POST handler for credit consumption
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const { userId } = await auth();
    
    if (!userId) {
      console.error('[API /credits/consume] User not authenticated');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // 2. Parse request body
    const { creditInfo, conversationId }: ConsumeCreditsRequest = await req.json();

    if (!creditInfo) {
      return createErrorResponse(400, 'INVALID_REQUEST', 'Missing creditInfo');
    }

    // 3. Calculate credits to consume (result should be in cents)
    const creditsToConsume = calculateCreditsFromUsage(creditInfo);

    // If no credits to consume (e.g. 0 tokens, or free operation), return success with current balance.
    if (creditsToConsume <= 0) {
      console.log('[API /credits/consume] No credits to consume for operation:', creditInfo.operationType);
      const customerId = await getOrCreateStripeCustomer(userId);
      const remainingBalance = await getCustomerCreditBalance(customerId); // Fetch fresh balance (in cents)
      return new Response(JSON.stringify({
        success: true,
        creditsConsumed: 0, // In cents
        remainingBalance: remainingBalance, // In cents
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Get Stripe customer ID
    const customerId = await getOrCreateStripeCustomer(userId);

    // 5. Consume credits from Stripe (creditsToConsume is in cents)
    const consumeResult = await consumeStripeCredits(customerId, creditsToConsume, {
      conversationId,
      operationType: creditInfo.operationType,
      inputTokens: creditInfo.inputTokens,
      outputTokens: creditInfo.outputTokens
    });

    const response: ConsumeCreditsResponse = {
      success: true,
      creditsConsumed: creditsToConsume, // In cents
      remainingBalance: consumeResult.remainingBalance, // In cents
      transactionId: consumeResult.transactionId
    };

    return new Response(JSON.stringify(response), {
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

/**
 * Calculate credits to consume based on usage info.
 * The returned value should be in cents.
 * Example: 1 credit unit = 1 cent ($0.01).
 */
function calculateCreditsFromUsage(creditInfo: ConsumeCreditsRequest['creditInfo']): number {
  // If totalCredits is provided (assumed to be in cents), use it directly.
  if (creditInfo.totalCredits && creditInfo.totalCredits > 0) {
    return creditInfo.totalCredits;
  }

  // Calculate based on tokens (example pricing in cents)
  let credits = 0;
  // Example: 1 cent per 1000 input tokens (0.001 cents per token, result rounded up)
  const INPUT_TOKEN_COST_PER_TOKEN = 0.001; // 1 cent / 1000 tokens
  // Example: 2 cents per 1000 output tokens (0.002 cents per token, result rounded up)
  const OUTPUT_TOKEN_COST_PER_TOKEN = 0.002; // 2 cents / 1000 tokens

  if (creditInfo.inputTokens) {
    credits += Math.ceil(creditInfo.inputTokens * INPUT_TOKEN_COST_PER_TOKEN);
  }
  
  if (creditInfo.outputTokens) {
    credits += Math.ceil(creditInfo.outputTokens * OUTPUT_TOKEN_COST_PER_TOKEN);
  }

  // Ensure a minimum of 0 credits (cents).
  return Math.max(credits, 0);
}

// Removed getStripeCustomerId and consumeStripeCredits as they are now in lib/stripe.ts
// Kept calculateCreditsFromUsage as it's specific to this endpoint's definition of credit cost.

// Removed getStripeCustomerId and consumeStripeCredits as they are now in lib/stripe.ts
// Kept calculateCreditsFromUsage as it's specific to this endpoint's definition of credit cost. 