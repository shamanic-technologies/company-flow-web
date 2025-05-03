/**
 * Budget Component Types
 * Common types used across budget components
 */

/**
 * Transaction type
 * Represents a single transaction in the billing history
 */
export interface Transaction {
  id: string;
  customerId: string;
  userId: string;
  type: 'credit' | 'debit' | string;
  amount: number;
  description: string;
  timestamp: string;
}

/**
 * BillingData type
 * Contains customer information, transactions, and credit details
 */
export interface BillingData {
  customer?: {
    id: string;
    userId: string;
    email: string;
    name: string;
    createdAt: string;
    autoRechargeSettings?: AutoRechargeSettings;
    autoRecharge?: AutoRechargeSettings;
    credits: {
      total: number;
      used: number;
      remaining: number;
    }
  };
  transactions: Transaction[];
  credit?: {
    available: number;
    used?: number;
  };
  credits?: {
    available: number;
    used: number;
    remaining: number;
  };
}

/**
 * AutoRechargeSettings type
 * Settings for automatic recharging of credits
 */
export interface AutoRechargeSettings {
  enabled: boolean;
  thresholdAmount: number;
  rechargeAmount: number;
}

/**
 * MonthlyUsageData type
 * Data structure for monthly usage visualization
 */
export interface MonthlyUsageData {
  months: string[];
  values: number[];
  hasData: boolean;
}

/**
 * MonthlyUsageProps type
 * Props for the monthly usage component
 */
export interface MonthlyUsageProps {
  monthlyUsageData: MonthlyUsageData;
  maxMonthlyUsage: number;
} 