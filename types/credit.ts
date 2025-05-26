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
    plan: Plan | null;
    credits: Credits;
    hasActiveSubscription: boolean;
}

export interface Plan {
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

