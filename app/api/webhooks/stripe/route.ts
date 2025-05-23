/**
 * Stripe Webhook Handler
 * Handles subscription events to automatically grant monthly credits
 */
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { grantMonthlyStripeCredits } from '../../../../lib/stripe'; // Import the new centralized function

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

/**
 * POST handler for Stripe webhooks
 */
export async function POST(req: NextRequest) {
  // Verify webhook signature
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET');
    return new Response('Missing webhook secret', { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const signature = headerPayload.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header');
    return new Response('Missing signature', { status: 400 });
  }

  // Get body
  const payload = await req.text();

  // Verify webhook
  let event: StripeWebhookEvent;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return new Response('Webhook handled successfully', { status: 200 });

  } catch (error: any) {
    console.error('[Stripe Webhook] Error handling event:', error);
    // Be careful not to return 500 for handled business logic errors (e.g. non-subscription invoice)
    // Actual unhandled errors during processing should return 500 for Stripe to retry if configured.
    if (error.message && (error.message.includes('Not a subscription invoice') || error.message.includes('Subscription not active'))) {
        console.log(`[Stripe Webhook] Skipping event: ${error.message}`);
        return new Response('Event skipped as per business logic', { status: 200 });
    }
    return new Response('Webhook handling failed with unrecoverable error', { status: 500 });
  }
}

/**
 * Handle successful payment (monthly recurring)
 */
async function handlePaymentSucceeded(invoice: any) {
  // Only process subscription invoices (not one-time payments)
  if (!invoice.subscription) {
    // Throw an error that can be caught and logged, then a 200 returned to Stripe
    throw new Error('Not a subscription invoice, skipping credit grant.');
  }

  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  // Get subscription details with reduced expansion
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['items.data.price']
  });

  if (subscription.status !== 'active') {
     // Throw an error for logging, then a 200 returned to Stripe
    throw new Error(`Subscription ${subscriptionId} not active (status: ${subscription.status}), skipping credit grant.`);
  }

  // Calculate credits based on subscription
  const creditsToGrant = await calculateCreditsFromSubscription(subscription);

  if (creditsToGrant > 0) {
    // Use the centralized function to grant monthly credits
    await grantMonthlyStripeCredits(
        customerId, 
        creditsToGrant, 
        subscriptionId, 
        invoice.id, 
        `${new Date(subscription.current_period_start * 1000).toISOString().slice(0, 7)}` // YYYY-MM
    );

    console.log('[handlePaymentSucceeded] Requested grant of monthly credits:', {
      customerId,
      credits: creditsToGrant,
      subscription: subscriptionId
    });
  } else {
    console.log('[handlePaymentSucceeded] No credits to grant for this subscription/invoice:', {
        customerId,
        subscriptionId,
        invoiceId: invoice.id
    });
  }
}

/**
 * Handle new subscription creation
 */
async function handleSubscriptionCreated(subscription: any) {
  // This function can be used for logging or initial setup if needed,
  // but credit granting for the first period is typically handled by 'invoice.payment_succeeded'.
  console.log('[handleSubscriptionCreated] New subscription created (event received):', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
  });
  // Potentially trigger welcome credits here if not handled by invoice.payment_succeeded for the *first* invoice.
  // However, `getOrCreateStripeCustomer` already handles initial welcome credits.
  // If a subscription is created *without* an immediate invoice (e.g. trial), this might be a place for trial credits.
}

/**
 * Handle subscription updates (plan changes)
 */
async function handleSubscriptionUpdated(subscription: any) {
  // This can be used to detect plan changes, cancellations, etc.
  // If a plan change results in a new billing cycle or pro-rata invoice, 
  // 'invoice.payment_succeeded' would typically handle new credit grants.
  console.log('[handleSubscriptionUpdated] Subscription updated (event received):', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
    newPlan: subscription.items.data[0]?.price?.product, // Example: extract new plan/product
    previousAttributes: subscription.previous_attributes // Useful for seeing what changed
  });
  // Add logic here if immediate actions are needed upon plan update, outside of normal billing cycle credit grants.
}

/**
 * Calculate credits based on subscription plan.
 * This remains local as it's tied to this webhook's specific mapping of plans to credits.
 */
async function calculateCreditsFromSubscription(subscription: any): Promise<number> {
  try {
    // Ensure subscription items and price data are present
    if (!subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
        console.warn('[calculateCreditsFromSubscription] Subscription has no items:', subscription.id);
        return 0;
    }
    const subscriptionItem = subscription.items.data[0];
    if (!subscriptionItem.price || !subscriptionItem.price.product) {
        console.warn('[calculateCreditsFromSubscription] Subscription item has no price or product:', subscriptionItem.id);
        return 0;
    }
    const price = subscriptionItem.price;
    
    // Get product separately to avoid deep expansion
    const product = await stripe.products.retrieve(price.product as string);
    if (!product) {
        console.warn('[calculateCreditsFromSubscription] Product not found for price:', price.id);
        return 0;
    }

    // Method 1: Use product metadata (recommended)
    if (product.metadata?.monthly_credits) {
      const credits = parseInt(product.metadata.monthly_credits, 10);
      if (!isNaN(credits)) return credits;
      console.warn('[calculateCreditsFromSubscription] Invalid monthly_credits metadata for product:', product.id, product.metadata.monthly_credits);
    }

    // Method 2: Calculate based on price amount (less reliable if prices change)
    if (price.unit_amount) {
      const priceInCents = price.unit_amount;
      // Example mapping, make this robust and configurable
      switch (priceInCents) {
        case 1900: // e.g., $19.00 Hobby
          return 1000;
        case 4900: // e.g., $49.00 Standard  
          return 4000;
        case 9900: // e.g., $99.00 Growth
          return 10000;
        default:
          // Do not log a warning here if metadata method is preferred and might have already found value
          break; 
      }
    }

    // Method 3: Based on product name (fallback, even less reliable)
    const productName = product.name.toLowerCase();
    if (productName.includes('hobby')) return 1000;
    if (productName.includes('standard')) return 4000;
    if (productName.includes('growth')) return 10000;

    console.warn('[calculateCreditsFromSubscription] No credits mapping found for product:', product.name, 'Price:', price.id);
    return 0;
  } catch (error) {
    console.error('[calculateCreditsFromSubscription] Error calculating credits from subscription:', error);
    return 0; // Return 0 on error to prevent breaking the webhook flow for this specific calculation
  }
} 