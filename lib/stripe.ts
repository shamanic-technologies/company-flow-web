/**
 * Stripe API utility functions.
 * This module centralizes Stripe-related operations for customer management,
 * credit balance, subscriptions, and credit consumption.
 */
import Stripe from 'stripe';
import { ConsumeCreditsResponse } from '@agent-base/types';
import { Pricing } from '@/types/credit';

// Initialize Stripe with the secret key from environment variables.
// Throw an error if the Stripe secret key is not set, as it's crucial for operations.
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables.');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Retrieves the Stripe customer ID for a given user ID.
 * If the customer does not exist, it creates a new one and grants initial credits.
 * @param userId - The unique identifier for the user (e.g., Clerk user ID).
 * @returns The Stripe customer ID.
 * @throws Error if fetching or creating the customer fails.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<Stripe.Customer> {
  try {
    // Search for existing customers by metadata.
    const existingCustomers = await stripe.customers.list({
      limit: 100, // Fetch up to 100 customers to search through.
    });

    // Find the customer whose metadata contains the matching clerk_user_id.
    const customer = existingCustomers.data.find(
      (cust: Stripe.Customer) => cust.metadata && cust.metadata.clerk_user_id === userId
    );

    if (customer) {
      // If customer exists, check if initial credits were already granted.
      if (!customer.metadata?.initial_credits_granted) {
        console.log('[getOrCreateStripeCustomer] Granting initial credits to existing customer:', customer.id);
        await grantInitialCreditsIfNeeded(customer);
        // Update customer metadata to mark initial credits as granted.
        await stripe.customers.update(customer.id, {
          metadata: {
            ...customer.metadata,
            initial_credits_granted: 'true',
          },
        });
      }
      return customer;
    }

    // If customer does not exist, create a new one.
    console.log('[getOrCreateStripeCustomer] Creating new customer for user:', userId);
    const newCustomer = await stripe.customers.create({
      metadata: {
        clerk_user_id: userId,
        plan_type: 'free', // Default plan type for new customers.
        created_via: 'api_lazy_creation', // Tracking how the customer was created.
      },
    });

    // Grant initial credits to the newly created customer.
    await grantInitialCreditsIfNeeded(newCustomer);
    
    // Update customer metadata to mark initial credits as granted.
     await stripe.customers.update(newCustomer.id, {
        metadata: {
          ...newCustomer.metadata, // Preserve existing metadata
          initial_credits_granted: 'true',
        },
      });

    return newCustomer;
  } catch (error) {
    console.error('[getOrCreateStripeCustomer] Error:', error);
    throw new Error('Failed to get or create Stripe customer.');
  }
}

/**
 * Grants initial credits (200 cents, i.e., $2.00) to a customer by adding to their cash balance,
 * if they don't already have a positive cash balance and haven't received them before.
 * @param customerId - The Stripe customer ID.
 * @throws Error if granting credits fails.
 */
export async function grantInitialCreditsIfNeeded(stripeCustomer: Stripe.Customer): Promise<void> {
  try {
    // Retrieve the customer to check their current cash balance.
    const customer = stripeCustomer;
    if (customer.deleted) {
      console.warn('[grantInitialCreditsIfNeeded] Customer is deleted:', stripeCustomer.id);
      throw new Error('Cannot grant credits to a deleted customer.');
    }

    // Stripe's customer.balance is in cents.
    // If balance is positive, they already have funds.
    if (customer.balance > 0) {
      console.log(`[grantInitialCreditsIfNeeded] Customer ${stripeCustomer.id} already has a positive cash balance: ${customer.balance} cents. No initial credits granted.`);
      return;
    }

    const initialCreditsAmount = Pricing.COMPANY_FLOW_FREE_SIGNUP_CREDIT_AMOUNT_IN_USD_CENTS; 
    console.log(`[grantInitialCreditsIfNeeded] Granting ${initialCreditsAmount} cents to customer: ${stripeCustomer.id}`);

    await stripe.customers.createBalanceTransaction(stripeCustomer.id, {
      amount: initialCreditsAmount, // Positive amount to credit the customer
      currency: 'usd',
      description: 'Initial credits grant (welcome bonus)',
      metadata: {
        type: 'welcome_bonus',
        plan: 'free', // Or based on customer's current plan if more complex
        granted_at: new Date().toISOString(),
      },
    });

    console.log(`[grantInitialCreditsIfNeeded] Successfully granted ${initialCreditsAmount} cents to customer: ${stripeCustomer.id}`);
  } catch (error: any) {
    console.error(`[grantInitialCreditsIfNeeded] Failed to grant initial credits to customer ${stripeCustomer.id}:`, error);
    throw new Error('Failed to grant initial credits using customer balance.');
  }
}

/**
 * Retrieves the customer's current spendable cash balance from Stripe.
 * The balance is returned in cents and is always >= 0.
 * @param customerId - The Stripe customer ID.
 * @returns The spendable credit balance in cents.
 * @throws Error if fetching the customer fails (propagated from Stripe API).
 */
export async function getCustomerCreditBalance(stripeCustomer: Stripe.Customer): Promise<number> {
  try {
    if (stripeCustomer.deleted) {
      console.warn('[getCustomerCreditBalance] Customer is deleted:', stripeCustomer.id);
      return 0; // No balance for a deleted customer.
    }
    const customerCreditBalance = stripeCustomer.balance;
    return customerCreditBalance;
  } catch (error) {
    console.error(`[getCustomerCreditBalance] Error fetching customer balance for ${stripeCustomer.id}:`, error);
    // To prevent breaking flows that expect a balance, return 0 on error.
    // This matches the previous behavior of the credit grants summary if it failed.
    return 0;
  }
}

/**
 * Retrieves detailed information about a customer's active subscription, including product details.
 * @param customerId - The Stripe customer ID.
 * @returns An object with subscription details, or null if no active subscription is found.
 */
export async function getDetailedSubscriptionInfo(stripeCustomer: Stripe.Customer): Promise<any | null> {
  try {
    // List active subscriptions for the customer, expanding price and item data.
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomer.id,
      status: 'active',
      limit: 1,
      // Ensure items and their period information are expanded if not default
      // Price expansion already gets us the price object within items.
      // Accessing items.data[0].current_period_end should work if items are part of the default Subscription object.
      expand: ['data.items.data.price'], 
    });

    if (subscriptions.data.length === 0) {
      return null; // No active subscription found.
    }

    const subscription: Stripe.Subscription = subscriptions.data[0];
    
    // Ensure there is at least one subscription item
    if (!subscription.items || !subscription.items.data || subscription.items.data.length === 0) {
      console.error('[getDetailedSubscriptionInfo] Subscription has no items:', subscription.id);
      throw new Error('Subscription has no items.');
    }
    const firstItem = subscription.items.data[0];

    // Ensure price is not null before proceeding
    if (!firstItem.price || typeof firstItem.price !== 'object' || !('product' in firstItem.price)) {
        console.error('[getDetailedSubscriptionInfo] Price or product information is missing for subscription item:', firstItem.id);
        throw new Error('Subscription item price or product information is missing.');
    }
    const price = firstItem.price as Stripe.Price;

    // Retrieve the product details separately.
    const product = await stripe.products.retrieve(price.product as string);

    // Access current_period_end from the subscription item
    const currentPeriodEndTimestamp = firstItem.current_period_end;

    return {
      id: subscription.id,
      status: subscription.status,
      productName: product.name || 'Unknown Plan',
      priceFormatted: formatPrice(price.unit_amount, price.currency),
      billingPeriod: price.recurring?.interval ?? 'N/A',
      nextBilling: new Date(currentPeriodEndTimestamp * 1000).toISOString(),
      currentPeriodEnd: currentPeriodEndTimestamp,
      metadata: product.metadata,
    };
  } catch (error) {
    console.error('[getDetailedSubscriptionInfo] Error retrieving subscription info:', error);
    return null;
  }
}

/**
 * Retrieves information about a customer's active subscription, focusing on its items for period end.
 * @param customerId - The Stripe customer ID.
 * @returns An object with active subscription details, or null if none is found.
 */
export async function getActiveSubscription(stripeCustomer: Stripe.Customer): Promise<any | null> {
  try {
    // List active subscriptions for the customer.
    // The default retrieve/list for a subscription should include its items.
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomer.id,
      status: 'active',
      limit: 1,
      // No specific expand needed here for items if included by default, 
      // but ensure items are present before accessing.
    });

    if (subscriptions.data.length === 0) {
      return null; // No active subscription found.
    }
    const sub: Stripe.Subscription = subscriptions.data[0];

    // Ensure there is at least one subscription item to get period end from
    if (!sub.items || !sub.items.data || sub.items.data.length === 0) {
      console.warn('[getActiveSubscription] Subscription has no items, cannot determine currentPeriodEnd from item:', sub.id);
      // Fallback or error, depending on requirements. For now, return sub without period end from item.
      return {
        id: sub.id,
        status: sub.status,
        // currentPeriodEnd: undefined, // Or handle as error if this is critical
      };
    }
    const firstItem = sub.items.data[0];

    return {
      id: sub.id,
      status: sub.status,
      currentPeriodEnd: firstItem.current_period_end, // Access from the item
    };
  } catch (error) {
    console.error('[getActiveSubscription] Error retrieving active subscription:', error);
    return null;
  }
}

/**
 * Consumes a specified amount of credits (in cents) from a customer's cash balance.
 * @param stripeCustomerId - The Stripe customer ID.
 * @param creditsToConsumeInUSDCents - The number of credits (cents) to consume.
 * @param metadata - Additional metadata to store with the balance transaction.
 * @returns An object containing the transaction ID and remaining spendable balance after consumption.
 * @throws Error if there are insufficient credits or if consumption fails.
 */
export async function consumeStripeCredits(
  stripeCustomer: Stripe.Customer,
  creditsToConsumeInUSDCents: number, // Assumed to be in cents
  conversationId: string,
): Promise<ConsumeCreditsResponse> {
  try {
    const currentBalance = await getCustomerCreditBalance(stripeCustomer);
    // Ensure creditsToConsume is a positive integer.
    if (creditsToConsumeInUSDCents <= 0) {
      console.log(`[consumeStripeCredits] Invalid amount: ${creditsToConsumeInUSDCents} cents. No credits consumed for customer ${stripeCustomer.id}.`);
      return {
        AgentBasConsumeCreditsRequest: 'N/A_INVALID_AMOUNT',
        remainingBalanceInUSDCents: currentBalance
      };
    }
    
    // Amount for createBalanceTransaction should be negative for a debit.
    const balanceTransaction = await stripe.customers.createBalanceTransaction(stripeCustomer.id, {
      amount: -creditsToConsumeInUSDCents, // Negative to decrease (debit) balance
      currency: 'usd',
      description: `Consumption for ${conversationId}`,
      metadata: { // Pass relevant metadata, ensure it's flat key-value strings
        conversation_id: conversationId?.toString(),
        timestamp: new Date().toISOString(),
      },
    });

    const newRemainingBalance = await getCustomerCreditBalance(stripeCustomer);

    return {
      AgentBasConsumeCreditsRequest: balanceTransaction.id,
      remainingBalanceInUSDCents: newRemainingBalance,
    } as ConsumeCreditsResponse;
  } catch (error: any) {
    console.error(`[consumeStripeCredits] Error consuming credits for customer ${stripeCustomer.id}:`, error);
    throw new Error('Failed to consume credits from customer balance.');
  }
}

/**
 * Formats a numerical amount into a currency string.
 * @param unitAmount - The amount in the smallest currency unit (e.g., cents).
 * @param currency - The ISO currency code (e.g., 'usd').
 * @returns A formatted currency string (e.g., "$10.00").
 */
function formatPrice(unitAmount: number | null, currency: string): string {
  if (unitAmount === null) {
    return 'N/A'; // Handle null amounts gracefully.
  }
  const amount = unitAmount / 100; // Convert from cents to dollars/base unit.
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

/**
 * Grants monthly credits (in cents) to a customer's cash balance,
 * typically triggered by a successful subscription renewal.
 * @param customerId - The Stripe customer ID.
 * @param credits - The number of credits (cents) to grant.
 * @param subscriptionId - The ID of the subscription for which credits are being granted.
 * @param invoiceId - The ID of the invoice related to this grant.
 * @param billingPeriod - The billing period string (e.g., "YYYY-MM") for metadata.
 * @returns The created Stripe CustomerBalanceTransaction object.
 * @throws Error if granting credits fails.
 */
export async function grantMonthlyStripeCredits(
  stripeCustomer: Stripe.Customer,
  credits: number, // Assumed to be in cents
  subscriptionId: string,
  invoiceId: string,
  billingPeriod: string
): Promise<Stripe.CustomerBalanceTransaction> { // Return type changed
  try {
    // Ensure credits is a positive integer.
    if (credits <= 0) {
      console.warn(`[grantMonthlyStripeCredits] Invalid amount: ${credits} cents. No credits granted for customer ${stripeCustomer.id}, subscription ${subscriptionId}.`);
      // Consider if throwing an error or returning a specific object is better here.
      // For now, throwing an error as granting 0 or negative credits is unusual.
      throw new Error('Monthly credits to grant must be a positive amount.');
    }
    
    console.log(`[grantMonthlyStripeCredits] Granting ${credits} cents to customer ${stripeCustomer.id} for subscription ${subscriptionId}.`);

    const balanceTransaction = await stripe.customers.createBalanceTransaction(stripeCustomer.id, {
      amount: credits, // Positive amount to credit the customer
      currency: 'usd',
      description: `Monthly credit allocation for subscription ${subscriptionId}`,
      metadata: {
        type: 'monthly_allocation',
        subscription_id: subscriptionId,
        invoice_id: invoiceId,
        billing_period: billingPeriod,
        granted_at: new Date().toISOString(),
      },
    });

    console.log('[grantMonthlyStripeCredits] Successfully granted monthly credits to customer balance:', {
      stripeCustomerId: stripeCustomer.id,
      credits,
      transactionId: balanceTransaction.id,
      subscriptionId,
    });

    return balanceTransaction;
  } catch (error: any) {
    console.error(`[grantMonthlyStripeCredits] Error granting monthly credits to customer ${customerId} for subscription ${subscriptionId}:`, error);
    throw new Error('Failed to grant monthly credits to customer balance.');
  }
}