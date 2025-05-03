/**
 * Budget Utilities
 * Common utility functions for budget-related operations
 */

import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { Transaction } from './types';

/**
 * Format date string into a readable format
 * @param dateString - ISO date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss');
  } catch (e) {
    return dateString;
  }
};

/**
 * Get badge element for transaction type
 * @param type - Transaction type ('credit' or 'debit')
 * @returns Badge JSX element with appropriate styling
 */
export const getTypeBadge = (type: string) => {
  const typeColors = {
    credit: "bg-green-600",
    debit: "bg-amber-600"
  };
  
  return (
    <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-600"}>
      {type.toUpperCase()}
    </Badge>
  );
};

/**
 * Get user initials from full name
 * @param name - User's full name
 * @returns Initials (1-2 characters)
 */
export const getUserInitials = (name?: string): string => {
  if (!name) return 'U';
  
  const nameParts = name.split(' ');
  if (nameParts.length === 1) return nameParts[0].substring(0, 1).toUpperCase();
  
  return (nameParts[0].substring(0, 1) + nameParts[nameParts.length - 1].substring(0, 1)).toUpperCase();
};

/**
 * Calculate monthly usage data for visualization
 * @param transactions - Array of transactions
 * @returns Formatted data for chart visualization
 */
export const getMonthlyUsageData = (transactions?: Transaction[]) => {
  if (!transactions || transactions.length === 0) {
    return { months: [], values: [], hasData: false };
  }
  
  const debits = transactions.filter(tx => tx.type === 'debit');
  if (debits.length === 0) {
    return { months: [], values: [], hasData: false };
  }
  
  // Get date range (last 6 months)
  const today = new Date();
  const sixMonthsAgo = subMonths(today, 5); // To get 6 months total including current
  
  // Generate array of months
  const monthsRange = eachMonthOfInterval({
    start: startOfMonth(sixMonthsAgo),
    end: endOfMonth(today)
  });
  
  // Group transactions by month and sum amounts
  const monthlyData = monthsRange.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthDebits = debits.filter(tx => {
      const txDate = parseISO(tx.timestamp);
      return txDate >= monthStart && txDate <= monthEnd;
    });
    
    const totalAmount = monthDebits.reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      month: format(month, 'MMM'),
      amount: totalAmount
    };
  });
  
  // Return formatted data for chart
  return {
    months: monthlyData.map(d => d.month),
    values: monthlyData.map(d => d.amount),
    hasData: monthlyData.some(d => d.amount > 0)
  };
};

/**
 * Calculate estimated runway based on credit usage patterns
 * @param availableCredits - Current available credits
 * @param transactions - Array of transactions
 * @returns Estimated runway in days and whether it's an estimate
 */
export const calculateEstimatedRunway = (availableCredits: number, transactions?: Transaction[]) => {
  // If no transactions or no usage, return a default value
  if (!transactions || transactions.length === 0) {
    return { days: 30, isEstimate: false };
  }
  
  // Get all debit transactions
  const debits = transactions.filter(tx => tx.type === 'debit');
  
  // If no debits, return default
  if (debits.length === 0) {
    return { days: 30, isEstimate: false };
  }
  
  // Calculate average daily usage
  // Get the oldest transaction date
  const oldestTxDate = new Date(Math.min(...debits.map(d => new Date(d.timestamp).getTime())));
  const now = new Date();
  
  // Calculate days since first transaction
  const daysSinceFirst = Math.max(1, Math.ceil((now.getTime() - oldestTxDate.getTime()) / (1000 * 60 * 60 * 24)));
  
  // Calculate total usage
  const totalUsage = debits.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Calculate daily average usage
  const dailyAverage = totalUsage / daysSinceFirst;
  
  // If no daily usage, return default
  if (dailyAverage <= 0) {
    return { days: 30, isEstimate: false };
  }
  
  // Calculate how many days the current credits will last
  const estimatedDays = Math.floor(availableCredits / dailyAverage);
  
  return { 
    days: Math.min(365, Math.max(0, estimatedDays)), // Cap between 0-365 days
    isEstimate: true 
  };
}; 