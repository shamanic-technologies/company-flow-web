/**
 * Custom hook for managing credits in the frontend
 * Handles validation before operations and consumption after operations
 */
import { ConsumeCreditsResponse, CreditBalance } from '@/types/credit';
import { ServiceResponse } from '@agent-base/types';
import { useState, useCallback } from 'react';

interface UseCreditsProps {
  activeOrgId: string | null | undefined; // Added activeOrgId
}

interface UseCreditsReturn {
  // State
  isValidating: boolean;
  isConsuming: boolean;
  creditBalance: CreditBalance | null;
  error: string | null;
  
  // Methods
  validateCredits: (estimatedCredits?: number) => Promise<boolean>;
  consumeCredits: (totalAmountInUSDCents: number, conversationId: string) => Promise<boolean>;
  clearError: () => void;
}

export function useCredits({ activeOrgId }: UseCreditsProps): UseCreditsReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate if user has enough credits before operation
   */
  const validateCredits = useCallback(async (estimatedCredits: number = 1): Promise<boolean> => {
    if (!activeOrgId) {
      console.warn('[useCredits] Validate: activeOrgId is missing. Cannot validate credits.');
      setError('Organization context not available. Cannot validate credits.');
      return false;
    }
    console.log(`[useCredits] Validate: Validating credits for org: ${activeOrgId}`);
    setIsValidating(true);
    setError(null);

    try {
      const response = await fetch('/api/credits/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estimatedCredits }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        // Check for 402 specifically, as it's a known "insufficient credits" scenario
        if (response.status === 402) {
            setError(errorData.message || 'Insufficient credits. Please upgrade your plan.');
        } else {
            setError(errorData.message || 'Failed to validate credits');
        }
        return false; // Return false directly if not ok
      }

      const fetchedCreditBalance: CreditBalance = await response.json();
      setCreditBalance(fetchedCreditBalance);

      if (!fetchedCreditBalance.hasCredits) {
        setError('Insufficient credits. Please upgrade your plan.');
        return false;
      }
      return true;
    } catch (err: any) {
      console.error('[useCredits] Validation error:', err);
      setError(err.message || 'Failed to validate credits');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [activeOrgId]); // Added activeOrgId

  /**
   * Consume credits after operation completion
   */
  const consumeCredits = useCallback(async (
    totalAmountInUSDCents: number, 
    conversationId?: string
  ): Promise<boolean> => {
    if (!activeOrgId) {
      console.warn('[useCredits] Consume: activeOrgId is missing. Cannot consume credits.');
      setError('Organization context not available. Cannot consume credits.');
      return false;
    }
    console.log(`[useCredits] Consume: Consuming credits for org: ${activeOrgId}`);
    setIsConsuming(true);
    setError(null);

    try {
      const response = await fetch('/api/credits/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalAmountInUSDCents, conversationId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        if (response.status === 402) {
          console.error('[useCredits] Insufficient credits. Operation could not be completed.');
          setError(errorData.message || 'Insufficient credits. Operation could not be completed.');
        } else {
          setError(errorData.message || 'Failed to consume credits');
        }
        return false; // Return false directly if not ok
      }

      const { remainingBalanceInUSDCents }: ConsumeCreditsResponse = await response.json();
      
      setCreditBalance(prevBalance => ({
        ...(prevBalance || { 
          balance: 0, 
          hasCredits: false, 
          stripeCustomerId: '', // Add default empty string for required field
          subscription: null 
        }), 
        balance: remainingBalanceInUSDCents,
        hasCredits: remainingBalanceInUSDCents > 0
      }));

      return true;
    } catch (err: any) {
      console.error('[useCredits] Consumption error:', err);
      setError(err.message || 'Failed to consume credits');
      return false;
    } finally {
      setIsConsuming(false);
    }
  }, [activeOrgId]); // Added activeOrgId. Removed creditBalance from deps as we use functional update for setCreditBalance.

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isValidating,
    isConsuming,
    creditBalance,
    error,
    validateCredits,
    consumeCredits,
    clearError,
  };
} 