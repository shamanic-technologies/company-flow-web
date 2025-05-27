/**
 * API Route: /api/billing/create-subscription-checkout
 * 
 * Creates a Stripe checkout session for subscription plans.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateStripeCustomer } from '@/lib/stripe';
import { createErrorResponse } from '../../utils';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Subscription plan configurations
 */
const SUBSCRIPTION_PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_1RSvg3ARay5VoldnXxtX6j3h',
    name: 'Hobby Plan',
    amount: 1900, // $19.00 in cents
    credits: 2000, // Monthly credits
    description: 'Perfect for personal projects',
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_1RSvhXARay5VoldnfqPHzR6b',
    name: 'Standard Plan', 
    amount: 4900, // $49.00 in cents
    credits: 4000, // Monthly credits
    description: 'Best for growing businesses',
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_1RSvjMARay5VoldnfuXWTJOf',
    name: 'Growth Plan',
    amount: 9900, // $99.00 in cents
    credits: 10000, // Monthly credits
    description: 'For scaling organizations',
  },
} as const;

/**
 * Get Stripe price ID for a plan
 */
async function getStripePriceId(planType: keyof typeof SUBSCRIPTION_PLANS): Promise<string> {
  const plan = SUBSCRIPTION_PLANS[planType];
  
  // Verify the price exists in Stripe
  try {
    await stripe.prices.retrieve(plan.priceId);
    return plan.priceId;
  } catch (error) {
    console.error(`[getStripePriceId] Price ${plan.priceId} not found for ${planType}:`, error);
    throw new Error(`Price not found for ${planType} plan. Please check your Stripe configuration.`);
  }
}

export async function POST(request: NextRequest) {
  let originalBalance = 0; // Declare outside try block for error handling
  
  try {
    // 1. Authentication check
    const { userId } = await auth();
    
    if (!userId) {
      console.error('[API /billing/create-subscription-checkout] User not authenticated');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // 2. Parse request body
    const { planType } = await request.json();
    
    if (!planType || !SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS]) {
      return createErrorResponse(400, 'INVALID_PLAN', 'Invalid plan type. Must be starter, pro, or enterprise');
    }

    const selectedPlan = SUBSCRIPTION_PLANS[planType as keyof typeof SUBSCRIPTION_PLANS];

    // 3. Get or create Stripe customer
    const stripeCustomer = await getOrCreateStripeCustomer(userId);

    // 4. Check customer balance for debugging
    const customerDetails = await stripe.customers.retrieve(stripeCustomer.id);
    if (customerDetails && !customerDetails.deleted) {
      console.log(`[DEBUG] Customer balance: ${customerDetails.balance} cents`);
      console.log(`[DEBUG] Customer balance in dollars: $${(customerDetails.balance / 100).toFixed(2)}`);
      
      // If balance is positive, it means customer owes money (debt)
      // If balance is negative, it means customer has credit
      if (customerDetails.balance > 0) {
        console.log(`[DEBUG] Customer has a DEBT of $${(customerDetails.balance / 100).toFixed(2)}`);
      } else if (customerDetails.balance < 0) {
        console.log(`[DEBUG] Customer has a CREDIT of $${(Math.abs(customerDetails.balance) / 100).toFixed(2)}`);
      } else {
        console.log(`[DEBUG] Customer has no balance`);
      }
    }

    // 5. Get the price ID
    const priceId = await getStripePriceId(planType as keyof typeof SUBSCRIPTION_PLANS);

    // 5. Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/settings/billing?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/dashboard/settings/billing?status=canceled`,
      metadata: {
        userId,
        planType,
        planName: selectedPlan.name,
      },
      subscription_data: {
        metadata: {
          userId,
          planType,
          planName: selectedPlan.name,
          monthly_credits: selectedPlan.credits.toString(),
        },
      },
      // Allow promotion codes
      allow_promotion_codes: true,
      // Set billing address collection
      billing_address_collection: 'required',
    });

    console.log(`[API /billing/create-subscription-checkout] Created checkout session for user ${userId}, plan: ${planType}`);

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
    });

  } catch (error: any) {
    console.error('[API /billing/create-subscription-checkout] Error:', error);
    return createErrorResponse(
      500,
      'CHECKOUT_ERROR',
      'Failed to create subscription checkout session',
      error.message
    );
  }
} 