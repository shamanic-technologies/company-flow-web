/**
 * API Route: /api/billing/create-portal-session
 * 
 * Creates a Stripe Billing Portal session for the authenticated user.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { getOrCreateStripeCustomer, createStripePortalSessionForUser } from '@/lib/stripe/stripe'; 
import { createErrorResponse } from '@/app/api/utils'; // Adjusted path based on typical structure

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const user = await currentUser();
    
    if (!user) {
      console.error('[API /billing/create-portal-session] User not authenticated');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }

    // 2. Get Stripe customer ID
    // The getOrCreateStripeCustomer function from stripe.ts handles finding or creating the customer.
    // It requires the Clerk userId.
    const stripeCustomer = await getOrCreateStripeCustomer(user);
    if (!stripeCustomer || !stripeCustomer.id) {
        console.error('[API /billing/create-portal-session] Failed to get or create Stripe customer for user:', user.id);
        return createErrorResponse(500, 'STRIPE_CUSTOMER_ERROR', 'Could not retrieve or create customer information.');
    }
    const stripeCustomerId = stripeCustomer.id;

    // 3. Define the return URL (where the user will be sent after leaving the portal)
    // This should be a page in your app, e.g., the billing settings page.
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'; // Fallback for local dev
    const returnUrl = `${appBaseUrl}/dashboard`; // TODO: Confirm this is the correct return path

    // 4. Create the Stripe Billing Portal session
    const portalSessionUrl = await createStripePortalSessionForUser(stripeCustomerId, returnUrl);

    // 5. Return the portal session URL
    return NextResponse.json(portalSessionUrl);

  } catch (error: any) {
    console.error('[API /billing/create-portal-session] Error:', error);
    return createErrorResponse(
        500, 
        'PORTAL_SESSION_ERROR', 
        'Failed to create billing portal session', 
        error.message
    );
  }
} 