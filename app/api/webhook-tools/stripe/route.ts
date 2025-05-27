/**
 * Stripe Webhook Handler
 * Handles subscription events to automatically grant monthly credits
 */
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { 
  grantMonthlyStripeCredits, 
  getPlanDetails, 
  grantInitialSubscriptionCredits 
} from '../../../../lib/stripe/stripe'; // Import the new centralized function
import Stripe from 'stripe'; // Import Stripe type if not already

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


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
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, WEBHOOK_SECRET) as Stripe.Event;
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature verification failed:', err.message);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return new Response('Webhook handled successfully', { status: 200 });

  } catch (error: any) {
    console.error('[Stripe Webhook] Error handling event:', event.type, error.message);

    return new Response('Webhook handling failed with unrecoverable error', { status: 500 });
  }
}

/**
 * Handle completed checkout session (for initial subscription setup and credits).
 * This is the primary handler for granting credits for a NEW subscription.
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Received checkout.session.completed for session: ${session.id}`);

  if (session.payment_status !== 'paid') {
    console.log(`[Stripe Webhook] Checkout session ${session.id} not paid (status: ${session.payment_status}). Skipping.`);
    throw new Error(`Checkout session ${session.id} not paid. Credits not granted.`); 
  }

  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType as string | undefined;
  // Ensure subscription and customer are strings (IDs)
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (!userId || !planType || !subscriptionId || !customerId) {
    console.error('[Stripe Webhook] checkout.session.completed: Missing critical data:', { userId, planType, subscriptionId, customerId, sessionId: session.id });
    throw new Error('Missing critical data from checkout.session.completed.');
  }

  const planDetails = getPlanDetails(planType);
  if (!planDetails) {
    console.error(`[Stripe Webhook] checkout.session.completed: Invalid planType '${planType}' from session ${session.id}.`);
    throw new Error(`Invalid planType in session metadata: ${planType}`);
  }

  console.log(`[Stripe Webhook] checkout.session.completed: Granting ${planDetails.creditsInUSDCents} credits for session ${session.id}, user ${userId}, plan ${planType}.`);
  const grantResult = await grantInitialSubscriptionCredits({
    user: user,
    planDetails: planDetails,
    stripeCustomer: customerId,
    stripeSubscription: subscriptionId,
    triggeringEventId: session.id, triggeringEventType: 'checkout.session.completed',
  });

  if (grantResult.success) {
    console.log(`[Stripe Webhook] checkout.session.completed: Credits processed for ${session.id}. Awarded: ${grantResult.creditsAwarded}. Msg: ${grantResult.message}`);
  } else {
    console.error(`[Stripe Webhook] checkout.session.completed: Failed for ${session.id}: ${grantResult.error}`);
    if (grantResult.error === 'Credits already granted for this transaction.') throw new Error(grantResult.error);
    throw new Error(grantResult.error || 'Failed from checkout.session.completed.');
  }
}

/**
 * Handle successful payment (primarily for RECURRING monthly payments).
 * Initial grants are handled by checkout.session.completed.
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Received invoice.payment_succeeded for invoice: ${invoice.id}`);

  const subscriptionIdFromInvoice = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subscriptionIdFromInvoice) {
    throw new Error('Not a subscription invoice (ID missing), skipping.');
  }

  // If invoice.billing_reason is 'subscription_create', it's the first invoice of a new subscription.
  // This should have been handled by 'checkout.session.completed'.
  // We add this check to prevent potential double granting if checkout.session.completed fails or is delayed,
  // and grantInitialSubscriptionCredits has strong idempotency.
  if (invoice.billing_reason === 'subscription_create') {
    console.log(`[Stripe Webhook] Invoice ${invoice.id} (reason: ${invoice.billing_reason}). Fallback initial grant.`);
    const subDetails = await stripe.subscriptions.retrieve(subscriptionIdFromInvoice, { expand: ['metadata'] });
    const userId = subDetails.metadata?.userId;
    const planType = subDetails.metadata?.planType as string | undefined;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    if (!userId || !planType || !customerId) {
      console.error('[Stripe Webhook] invoice.payment_succeeded (subscription_create): Missing data:', { userId, planType, customerId, subId: subscriptionIdFromInvoice });
      throw new Error('Missing data for initial grant (invoice subscription_create).');
    }
    const planDetails = getPlanDetails(planType);
    if (!planDetails) {
      console.error(`[Stripe Webhook] invoice.payment_succeeded (subscription_create): Invalid planType '${planType}'.`);
      throw new Error(`Invalid planType from sub metadata: ${planType}`);
    }

    const grantResult = await grantInitialSubscriptionCredits({
      userId, planType, planName: planDetails.name, creditsToGrant: planDetails.creditsInUSDCents,
      stripeCustomerId: customerId, stripeSubscriptionId: subscriptionIdFromInvoice,
      triggeringEventId: invoice.id, triggeringEventType: 'invoice.payment_succeeded',
    });
    if (grantResult.success) {
        console.log(`[Stripe Webhook] invoice.payment_succeeded (subscription_create): Credits via invoice ${invoice.id}. Awarded: ${grantResult.creditsAwarded}.`);
    } else {
        console.error(`[Stripe Webhook] invoice.payment_succeeded (subscription_create): Failed via invoice ${invoice.id}: ${grantResult.error}`);
        if (grantResult.error === 'Credits already granted for this transaction.') throw new Error(grantResult.error);
        throw new Error(grantResult.error || 'Failed (invoice.payment_succeeded subscription_create).');
    }
    return;
  } 
  
  // For recurring payments (e.g., subscription_cycle, subscription_update)
  if (invoice.billing_reason !== 'subscription_cycle' && invoice.billing_reason !== 'subscription_update') {
     console.log(`[Stripe Webhook] Invoice ${invoice.id} reason '${invoice.billing_reason}'. Not renewal. Skipping.`);
     throw new Error(`Invoice ${invoice.id} reason (${invoice.billing_reason}) not eligible for recurring grant.`);
  }

  const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
  if (!customerId) {
    console.error('[Stripe Webhook] invoice.payment_succeeded: Customer ID missing on invoice:', invoice.id);
    throw new Error('Customer ID missing on invoice for recurring.');
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionIdFromInvoice);
  if (subscription.status !== 'active') {
    throw new Error(`Subscription ${subscriptionIdFromInvoice} not active (status: ${subscription.status}).`);
  }

  const creditsToGrant = await calculateCreditsFromSubscription(subscription);
  if (creditsToGrant > 0) {
    const stripeCustomer = await stripe.customers.retrieve(customerId);
    if (stripeCustomer.deleted) {
        console.warn(`[Stripe Webhook] Customer ${customerId} is deleted.`);
        throw new Error('Customer is deleted, cannot grant monthly credits.');
    }

    await grantMonthlyStripeCredits(
        stripeCustomer as Stripe.Customer, creditsToGrant, subscriptionIdFromInvoice, invoice.id, 
        `${new Date(subscription.current_period_start * 1000).toISOString().slice(0, 7)}`
    );
    console.log('[Stripe Webhook] invoice.payment_succeeded: Granted recurring credits:', { customerId, credits: creditsToGrant, sub: subscriptionIdFromInvoice, inv: invoice.id });
  } else {
    console.log('[Stripe Webhook] invoice.payment_succeeded: No recurring credits to grant:', { customerId, subId: subscriptionIdFromInvoice, invId: invoice.id });
  }
}

/**
 * Handle new subscription creation (logging purposes primarily)
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  // Ensure customer is an ID string for logging, or null/undefined
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  console.log('[Stripe Webhook] customer.subscription.created:', {
    subId: subscription.id, customerId, status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    metadata: subscription.metadata
  });
}

/**
 * Handle subscription updates (logging purposes or specific update logic)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  // Ensure price and product are accessed safely if they are potentially complex objects or IDs
  let newPlanProductId: string | undefined | null = null;
  if (subscription.items.data[0]?.price?.product) {
    const product = subscription.items.data[0].price.product;
    newPlanProductId = typeof product === 'string' ? product : product.id;
  }
  console.log('[Stripe Webhook] customer.subscription.updated:', {
    subId: subscription.id, customerId, status: subscription.status, newPlanProductId,
    previousAttributes: subscription.previous_attributes,
    metadata: subscription.metadata
  });
}

/**
 * Calculate credits based on subscription plan.
 * This uses metadata on the Stripe Product associated with the subscription's price.
 */
async function calculateCreditsFromSubscription(subscription: Stripe.Subscription): Promise<number> {
  try {
    if (!subscription.items?.data?.[0]?.price?.product) {
        console.warn('[Stripe Webhook] calculateCredits: Essential path item.price.product missing for sub:', subscription.id);
        return 0;
    }
    const price = subscription.items.data[0].price; // Price object
    const productId = typeof price.product === 'string' ? price.product : price.product.id;

    const product = await stripe.products.retrieve(productId);
    if (!product) {
        console.warn('[Stripe Webhook] calculateCredits: Product not found for ID:', productId);
        return 0;
    }

    if (product.metadata?.monthly_credits) {
      const credits = parseInt(product.metadata.monthly_credits, 10);
      if (!isNaN(credits) && credits > 0) return credits;
      console.warn('[Stripe Webhook] calculateCredits: Invalid monthly_credits metadata for product:', product.id, product.metadata.monthly_credits);
    }
    
    const planTypeFromSubMetadata = subscription.metadata?.planType as string | undefined;
    if(planTypeFromSubMetadata) {
        const planDetails = getPlanDetails(planTypeFromSubMetadata);
        if(planDetails?.creditsInUSDCents && planDetails.creditsInUSDCents > 0) { // Check planDetails itself is not null
            console.log(`[Stripe Webhook] calculateCredits: Using planType '${planTypeFromSubMetadata}' (metadata) for product ${product.id}. Credits: ${planDetails.creditsInUSDCents}`);
            return planDetails.creditsInUSDCents;
        }
    }

    console.warn('[Stripe Webhook] calculateCredits: No valid mapping for product:', product.name, '(ID:', product.id, '). Sub metadata:', subscription.metadata);
    return 0;
  } catch (error) {
    console.error('[Stripe Webhook] calculateCredits: Error for subscription:', subscription.id, error);
    return 0; 
  }
} 