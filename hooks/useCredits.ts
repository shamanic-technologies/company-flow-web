/**
 * Custom hook for managing credits in the frontend
 * Handles validation before operations and consumption after operations
 */
import { ConsumeCreditsResponse, CreditBalance } from '@/types/credit';
import { ServiceResponse } from '@agent-base/types';
import { useState, useCallback } from 'react';


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

export function useCredits(): UseCreditsReturn {
  const [isValidating, setIsValidating] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate if user has enough credits before operation
   */
  const validateCredits = useCallback(async (estimatedCredits: number = 1): Promise<boolean> => {
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
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to validate credits');
      }

      const creditBalance: CreditBalance = await response.json();

      setCreditBalance(creditBalance);

      if (!creditBalance.hasCredits) {
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
  }, []);

  /**
   * Consume credits after operation completion
   */
  const consumeCredits = useCallback(async (
    totalAmountInUSDCents: number, 
    conversationId?: string
  ): Promise<boolean> => {
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
        const errorData = await response.json();
        if (response.status === 402) {
          console.error('[useCredits] Insufficient credits. Operation could not be completed.');
          setError('Insufficient credits. Operation could not be completed.');
          return false;
        }
        throw new Error(errorData.message || 'Failed to consume credits');
      }

      const { remainingBalanceInUSDCents }: ConsumeCreditsResponse = await response.json();
      
      // Update credit balance with remaining balance
      if (creditBalance) {
        setCreditBalance({
          ...creditBalance,
          balance: remainingBalanceInUSDCents,
          hasCredits: remainingBalanceInUSDCents > 0
        });
      }

      return true;
    } catch (err: any) {
      console.error('[useCredits] Consumption error:', err);
      setError(err.message || 'Failed to consume credits');
      return false;
    } finally {
      setIsConsuming(false);
    }
  }, [creditBalance]);

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