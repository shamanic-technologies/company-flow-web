import { User } from "@clerk/nextjs/server";
import Stripe from "stripe";

export interface CreditBalance {
    hasCredits: boolean;
    balance: number;
    stripeCustomerId: string;
    subscription?: {
      id: string;
      status: string;
      currentPeriodEnd: number;
    } | null;
}

export interface PlanInfo {
    planStatus: PlanStatus | null;
    credits: Credits;
    hasActiveSubscription: boolean;
}

export interface PlanStatus {
  name: string;
  status: string;
  price?: string;
  billingPeriod?: string;
  nextBilling?: string;
}

export interface Credits {
  balance: number;
  monthlyAllocation?: number;
}

export enum Pricing {
    COMPANY_FLOW_FREE_SIGNUP_CREDIT_AMOUNT_IN_USD_CENTS = 200,
  }

export interface ConsumeCreditsResponse {
  creditsConsumedInUSDCents: number;
  remainingBalanceInUSDCents: number;
}

export interface ConsumeCreditsRequest {
  totalAmountInUSDCents: number;
  conversationId: string;
}

export interface PlanDetails {
  id: string;
  name: string;
  creditsInUSDCents: number;
  priceInUSDCents: number;
  priceId: string | undefined;
}
export const FreePlan: PlanDetails = {
  id: 'free',
  name: 'Free',
  creditsInUSDCents: 0,
  priceInUSDCents: 0,
  priceId: undefined,
}

export const FirstPlan: PlanDetails = {
  id: 'first',
  name: 'Hobby',
  creditsInUSDCents: 1000,
  priceInUSDCents: 1900,
  priceId: process.env.STRIPE_SUBSCRIPTION_1_PRICE_ID,
}
export const SecondPlan: PlanDetails = {
  id: 'second',
  name: 'Standard',
  creditsInUSDCents: 4000,
  priceInUSDCents: 4900,
  priceId: process.env.STRIPE_SUBSCRIPTION_2_PRICE_ID,
}
export const ThirdPlan: PlanDetails = {
  id: 'third',
  name: 'Growth',
  creditsInUSDCents: 10000,
  priceInUSDCents: 9900,
  priceId: process.env.STRIPE_SUBSCRIPTION_3_PRICE_ID,
}

export const PlansList: PlanDetails[] = [FreePlan, FirstPlan, SecondPlan, ThirdPlan];

/**
 * Interface for the parameters of grantInitialSubscriptionCredits.
 */
export interface GrantInitialCreditsParams {
  userId: string; // Clerk User ID
  planId: string;
  planCreditsInUSDCents: number;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  triggeringEventId: string; // e.g., Checkout Session ID or Invoice ID for idempotency
  triggeringEventType: 'checkout.session.completed' | 'invoice.payment_succeeded'; // e.g., Checkout Session ID or Invoice ID for idempotency
}

/**
 * Interface for the return value of grantInitialSubscriptionCredits.
 */
export interface GrantInitialCreditsResult {
  creditsAwardedInUSDCents: number; // Amount of credits actually awarded (0 if already granted or error)
  error?: string;
  details?: string;
}
export interface VerifyCheckoutSessionResponse {
  paymentStatus: string;
  message: string;
}