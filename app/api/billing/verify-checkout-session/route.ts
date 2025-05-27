/**
 * API Route: /api/billing/verify-checkout-session
 *
 * Verifies a Stripe checkout session status and grants initial credits upon successful subscription.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createErrorResponse } from '../../utils';
import { grantInitialSubscriptionCredits, getPlanDetails } from '@/lib/stripe/stripe'; // grantInitialSubscriptionCredits to be created/refactored
import Stripe from 'stripe';
import { PlanDetails, GrantInitialCreditsResult, VerifyCheckoutSessionResponse } from '@/types/credit';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * GET handler to verify checkout session and grant credits.
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication
    const user = await currentUser();
    if (!user) {
      console.error('[API /billing/verify-checkout-session] User not authenticated');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // 2. Get session_id from query parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return createErrorResponse(400, 'BAD_REQUEST', 'Missing session_id query parameter.');
    }

    // 3. Retrieve Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'invoice'], // Expand subscription and invoice details
    });

    if (!checkoutSession) {
      return createErrorResponse(404, 'NOT_FOUND', 'Checkout session not found.');
    }

    let response : VerifyCheckoutSessionResponse = {
        paymentStatus: checkoutSession.payment_status,
        message: 'Payment not completed for this session.',
    }
    // 4. Check payment status
    if (checkoutSession.payment_status !== 'paid') {
      console.log(`[API /billing/verify-checkout-session] Checkout session ${sessionId} not paid. Status: ${checkoutSession.payment_status}`);
      return NextResponse.json(response, { status: 200 }); // Return 200 as the request was valid, but payment wasn't complete
    }

    // 5. Extract necessary metadata and IDs
    const clerkUserId = checkoutSession.metadata?.userId;
    const planType = checkoutSession.metadata?.planType as string | undefined; // e.g., 'starter', 'pro'
    const subscriptionId = typeof checkoutSession.subscription === 'string' ? checkoutSession.subscription : checkoutSession.subscription?.id;
    const invoiceId = typeof checkoutSession.invoice === 'string' ? checkoutSession.invoice : checkoutSession.invoice?.id;

    if (clerkUserId !== user.id) {
        console.error(`[API /billing/verify-checkout-session] Mismatch: session userId ${clerkUserId} vs authenticated userId ${user.id}`);
        return createErrorResponse(403, 'FORBIDDEN', 'Session does not belong to the authenticated user.');
    }

    if (!planType || !subscriptionId || !invoiceId) {
      console.error('[API /billing/verify-checkout-session] Missing critical data from checkout session metadata or objects:', { planType, subscriptionId, invoiceId });
      return createErrorResponse(500, 'INTERNAL_ERROR', 'Critical information missing from checkout session.');
    }
    
    const planDetails : PlanDetails = getPlanDetails(planType); // Get plan details (credits, name)
    if (!planDetails) {
        console.error(`[API /billing/verify-checkout-session] Invalid planType: ${planType} from session metadata.`);
        return createErrorResponse(400, 'BAD_REQUEST', `Invalid plan type: ${planType}.`);
    }

    // Ensure stripeCustomer and stripeSubscription IDs are strings
    const stripeCustomerId = typeof checkoutSession.customer === 'string' 
        ? checkoutSession.customer 
        : checkoutSession.customer?.id;

    const stripeSubscriptionId = typeof checkoutSession.subscription === 'string' 
        ? checkoutSession.subscription 
        : (checkoutSession.subscription as Stripe.Subscription | null)?.id; // Explicit cast for subscription object

    if (!stripeCustomerId || !stripeSubscriptionId) {
      console.error('[API /billing/verify-checkout-session] Missing Stripe Customer ID or Subscription ID from checkout session.', { stripeCustomerId, stripeSubscriptionId });
      return createErrorResponse(500, 'INTERNAL_ERROR', 'Stripe Customer ID or Subscription ID missing.');
    }

    // 6. Grant initial credits (idempotently)
    const grantResult : GrantInitialCreditsResult = await grantInitialSubscriptionCredits({
      userId: user.id, // Pass Clerk User ID as string
      planId: planDetails.id, // Pass planId from planDetails
      planCreditsInUSDCents: planDetails.creditsInUSDCents, // Pass planCreditsInUSDCents from planDetails
      stripeCustomerId: stripeCustomerId, // Pass Stripe Customer ID as string
      stripeSubscriptionId: stripeSubscriptionId, // Pass Stripe Subscription ID as string
      triggeringEventId: checkoutSession.id, 
      triggeringEventType: 'checkout.session.completed',
    });

    if (grantResult.error) {
      // This case handles actual errors during the grant attempt (e.g., Stripe API down)
      console.error(`[API /billing/verify-checkout-session] Error encountered while attempting to grant initial credits for session ${sessionId}:`, grantResult.error);
      response = {
        paymentStatus: checkoutSession.payment_status, // Still paid
        message: grantResult.error || 'An error occurred while processing credits.'
      };
      // Return 200 because session verification itself was okay, but credit grant had an issue.
      // The client can decide based on the message.
      // Or, consider a 500 if this error is critical enough to halt the user flow.
      return NextResponse.json(response, { status: 200 }); 
    } 
    
    // Check if credits were actually awarded or if idempotency prevented it
    if (grantResult.creditsAwardedInUSDCents > 0) {
      response = {
        paymentStatus: checkoutSession.payment_status,
        message: grantResult.details || `Successfully processed credits for plan ${planDetails.name}.`,
      }
      console.log(`[API /billing/verify-checkout-session] Successfully verified session ${sessionId} and GRANTED ${grantResult.creditsAwardedInUSDCents} initial credits for user ${user.id}, plan ${planType}.`);
    } else {
      // Credits were not awarded in this call, likely due to idempotency (details field will explain)
      response = {
        paymentStatus: checkoutSession.payment_status,
        message: grantResult.details || 'Checkout session verified. Credits were not re-applied.',
      }
      console.log(`[API /billing/verify-checkout-session] Successfully verified session ${sessionId}. Credits NOT re-applied for user ${user.id}, plan ${planType} (Reason: ${grantResult.details}).`);
    }
    
    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[API /billing/verify-checkout-session] Error:', error);
    let statusCode = 500;
    if (error instanceof Stripe.errors.StripeInvalidRequestError && error.param === 'id') {
      statusCode = 404; // Session ID likely invalid
    }
    return createErrorResponse(
      statusCode,
      'VERIFY_SESSION_ERROR',
      'Failed to verify checkout session.',
      error.message
    );
  }
}
