/*
'use client'

import { useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { CreditBalance, ConsumeCreditsResponse } from '@/types/credit';

interface UseCreditsProps {
  activeOrgId: string | null | undefined;
}

export function useCredits({ activeOrgId }: UseCreditsProps) {
  const { getToken } = useAuth();
  
  const [isValidating, setIsValidating] = useState(false);
  const [isConsuming, setIsConsuming] = useState(false);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const validateCredits = useCallback(async (estimatedCredits?: number): Promise<boolean> => {
    if (!activeOrgId) {
      setError('No active organization.');
      return false;
    }
    
    setIsValidating(true);
    clearError();
    
    try {
      const token = await getToken();
      const response = await fetch('/api/credits/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          organizationId: activeOrgId,
          estimatedCredits,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Credit validation failed.');
        return false;
      }

      setCreditBalance(data as CreditBalance);
      return true;

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during validation.');
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [activeOrgId, getToken, clearError]);
  
  const consumeCredits = useCallback(async (totalAmountInUSDCents: number, conversationId: string): Promise<boolean> => {
    if (!activeOrgId) {
      setError('No active organization for credit consumption.');
      return false;
    }
    
    setIsConsuming(true);
    clearError();

    try {
      const token = await getToken();
      const response = await fetch('/api/credits/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          organizationId: activeOrgId,
          totalAmountInUSDCents,
          conversationId,
        }),
      });

      const data: ConsumeCreditsResponse = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to consume credits.');
        if(data.creditBalance) {
          setCreditBalance(data.creditBalance);
        }
        return false;
      }
      
      setCreditBalance(data.creditBalance!);
      return true;

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during consumption.');
      return false;
    } finally {
      setIsConsuming(false);
    }
  }, [activeOrgId, getToken, clearError]);

  return {
    isValidating,
    isConsuming,
    creditBalance,
    error,
    validateCredits,
    consumeCredits,
    clearError
  };
}
*/ 