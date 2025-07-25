/**
 * API Route: /api/billing/create-subscription-checkout
 * 
 * Creates a Stripe checkout session for subscription plans.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, User } from '@clerk/nextjs/server';
import { getOrCreateStripeCustomer } from '@/lib/stripe/stripe';
import { createErrorResponse } from '../../utils';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { PlansList } from '@/types/credit';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



export async function POST(request: NextRequest) {
  
  try {
    // 1. Authentication and User Details

    const user: User | null = await currentUser(); 
    if (!user) {
      console.error('[API /billing/create-subscription-checkout] Clerk user object not found for authenticated user');
      return createErrorResponse(403, 'FORBIDDEN', 'User details not found');
    }

    // 2. Parse request body
    // The 'planType' from the request should now be the plan ID (e.g., 'first', 'second')
    const { planId: requestedPlanId } = await request.json(); 
    
    const selectedPlan = PlansList.find(p => p.id === requestedPlanId);

    if (!requestedPlanId || !selectedPlan) {
      // Construct a list of valid plan IDs for the error message
      const validPlanIds = PlansList.map(p => p.id).join(', ');
      console.error(`[API /billing/create-subscription-checkout] Invalid planId: ${requestedPlanId}. Valid plan IDs are: ${validPlanIds}`);
      return createErrorResponse(400, 'INVALID_PLAN', `Invalid plan ID. Must be one of: ${validPlanIds}`);
    }

    // 3. Get or create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer(user);

    // 4. Check customer balance for debugging
    if (stripeCustomer && !stripeCustomer.deleted) {
      console.log(`[DEBUG] Customer balance: ${stripeCustomer.balance} cents`);
      console.log(`[DEBUG] Customer balance in dollars: $${(stripeCustomer.balance / 100).toFixed(2)}`);
      
      if (stripeCustomer.balance > 0) {
        console.log(`[DEBUG] Customer has a DEBT of $${(stripeCustomer.balance / 100).toFixed(2)}`);
      } else if (stripeCustomer.balance < 0) {
        console.log(`[DEBUG] Customer has a CREDIT of $${(Math.abs(stripeCustomer.balance) / 100).toFixed(2)}`);
      } else {
        console.log(`[DEBUG] Customer has no balance`);
      }
    }

    // 5. Create checkout session (Note: Renamed 'planType' to 'requestedPlanId' or 'selectedPlan.id' for clarity)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      console.error('[API /billing/create-subscription-checkout] NEXT_PUBLIC_APP_URL is not set.');
      return createErrorResponse(500, 'CONFIGURATION_ERROR', 'Application URL is not configured.');
    }
    
    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/settings/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/settings/billing?status=canceled`,
      metadata: { // Ensure metadata.planType stores the correct plan ID from types/credit.ts
        userId: user.id,
        planType: selectedPlan.id, // Use the ID from PlanDetails ('first', 'second', etc.)
        planName: selectedPlan.name,
      },
      subscription_data: {
        metadata: { // Ensure subscription_data.metadata.planType also stores the correct plan ID
          userId: user.id,
          planType: selectedPlan.id, // Use the ID from PlanDetails
          planName: selectedPlan.name,
          // Storing credits directly in subscription metadata can be useful
          // Ensure this matches how you expect to retrieve/use it later, e.g., in webhooks or product setup.
          monthly_credits: selectedPlan.creditsInUSDCents.toString(), 
        },
      },
      allow_promotion_codes: false,
      customer_update: { 
        name: 'auto',
        address: 'auto',
      },
      tax_id_collection: { 
        enabled: true,
      },
    };
    
    const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);

    // Log with the correct planId
    console.log(`[API /billing/create-subscription-checkout] Created checkout session for user ${user.id}, planId: ${selectedPlan.id}`);

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });

  } catch (error: any) {
    console.error('[API /billing/create-subscription-checkout] Error:', error);
    // Ensure the error response details do not expose sensitive configuration like price IDs
    const clientSafeErrorMessage = error.message.includes("Price ID not configured") || error.message.includes("Price not found for")
        ? "There was an issue with the selected plan's configuration. Please contact support."
        : 'Failed to create subscription checkout session';
    const internalDetails = error.message; // Keep original error for server logs

    return createErrorResponse(
      500,
      'CHECKOUT_ERROR',
      clientSafeErrorMessage,
      internalDetails // This will be logged on the server, not sent to client if your createErrorResponse handles it
    );
  }
} 