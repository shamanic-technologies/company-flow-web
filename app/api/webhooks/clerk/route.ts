/**
 * Clerk Webhook Handler
 * Automatically creates Stripe customers and grants initial credits for new users
 */
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{
      email_address: string;
      id: string;
    }>;
    first_name?: string;
    last_name?: string;
    created_at: number;
  };
}

/**
 * POST handler for Clerk webhooks
 */
export async function POST(req: NextRequest) {
  // Verify webhook signature
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('[Clerk Webhook] Missing CLERK_WEBHOOK_SECRET');
    return new Response('Missing webhook secret', { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('[Clerk Webhook] Missing svix headers');
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.text();

  // Verify webhook with svix
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: ClerkWebhookEvent;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err: any) {
    console.error('[Clerk Webhook] Verification failed:', err.message);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Handle user creation
  if (evt.type === 'user.created') {
    try {
      console.log('[Clerk Webhook] Processing new user:', evt.data.id);
      
      const userId = evt.data.id;
      const email = evt.data.email_addresses[0]?.email_address;
      const firstName = evt.data.first_name || '';
      const lastName = evt.data.last_name || '';

      if (!email) {
        console.error('[Clerk Webhook] No email found for user:', userId);
        return new Response('No email found', { status: 400 });
      }

      // Create Stripe customer
      const customer = await createStripeCustomerForNewUser({
        userId,
        email,
        firstName,
        lastName
      });

      // Grant initial 200 free credits
      await grantInitialCredits(customer.id, 200);

      console.log('[Clerk Webhook] Successfully created Stripe customer and granted credits:', {
        userId,
        customerId: customer.id,
        email
      });

      return new Response('User processed successfully', { status: 200 });

    } catch (error: any) {
      console.error('[Clerk Webhook] Error processing user creation:', error);
      return new Response('Failed to process user', { status: 500 });
    }
  }

  return new Response('Event type not handled', { status: 200 });
}

/**
 * Create Stripe customer for new user
 */
async function createStripeCustomerForNewUser({
  userId,
  email,
  firstName,
  lastName
}: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}) {
  try {
    const customer = await stripe.customers.create({
      email,
      name: `${firstName} ${lastName}`.trim() || email,
      metadata: {
        clerk_user_id: userId,
        plan_type: 'free',
        created_via: 'clerk_webhook',
        initial_credits_granted: 'true'
      }
    });

    console.log('[createStripeCustomerForNewUser] Created customer:', customer.id);
    return customer;
  } catch (error) {
    console.error('[createStripeCustomerForNewUser] Error:', error);
    throw new Error('Failed to create Stripe customer');
  }
}

/**
 * Grant initial 200 free credits to new customer
 */
async function grantInitialCredits(customerId: string, amount: number) {
  try {
    // Grant 200 free credits with 5 years expiration (Stripe maximum)
    const expirationTimestamp = Math.floor(Date.now() / 1000) + (5 * 365 * 24 * 60 * 60); // 5 years
    
    const creditGrant = await stripe.billing.creditGrants.create({
      customer: customerId,
      amount: {
        type: 'monetary',
        monetary: {
          value: amount, // 200 credits
          currency: 'usd'
        }
      },
      applicability_config: {
        scope: {
          price_type: 'metered'
        }
      },
      category: 'promotional',
      expires_at: expirationTimestamp,
      metadata: {
        type: 'welcome_bonus',
        plan: 'free',
        granted_at: new Date().toISOString(),
        expires_at: new Date(expirationTimestamp * 1000).toISOString()
      }
    });

    console.log('[grantInitialCredits] Granted 200 free credits (5 years expiration):', {
      customerId,
      amount,
      grantId: creditGrant.id
    });

    return creditGrant;
  } catch (error: any) {
    console.error('[grantInitialCredits] Error granting initial credits:', error);
    throw new Error('Failed to grant initial credits');
  }
} 