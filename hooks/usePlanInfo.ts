/**
 * Custom hook for fetching detailed plan and credit information
 * Uses the optimized /api/credits/plan-info endpoint
 */
import { useState, useEffect, useCallback } from 'react';

interface PlanInfo {
  plan: {
    name: string;
    status: string;
    price: string;
    billingPeriod: string;
    nextBilling?: string;
  } | null;
  credits: {
    balance: number;
    monthlyAllocation?: number;
    used?: number;
  };
  hasActiveSubscription: boolean;
}

interface UsePlanInfoReturn {
  planInfo: PlanInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlanInfo(): UsePlanInfoReturn {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanInfo = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/credits/plan-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch plan information');
      }

      const data: PlanInfo = await response.json();
      setPlanInfo(data);
    } catch (err: any) {
      console.error('[usePlanInfo] Error:', err);
      setError(err.message || 'Failed to fetch plan information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  return {
    planInfo,
    isLoading,
    error,
    refetch: fetchPlanInfo,
  };
} 