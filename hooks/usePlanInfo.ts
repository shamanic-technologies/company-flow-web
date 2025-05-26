/**
 * Custom hook for fetching detailed plan and credit information
 * Uses the optimized /api/credits/plan-info endpoint
 */
import { PlanInfo } from '@/types/credit';
import { useState, useEffect, useCallback } from 'react';


interface UsePlanInfoReturn {
  planInfo: PlanInfo | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export function usePlanInfo(): UsePlanInfoReturn {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanInfo = useCallback(async () => {
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

      const planInfo: PlanInfo = await response.json();
      setPlanInfo(planInfo);
    } catch (err: any) {
      console.error('[usePlanInfo] Error:', err);
      setError(err.message || 'Failed to fetch plan information');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchPlanInfo();
  }, [fetchPlanInfo]);

  return {
    planInfo,
    isLoading,
    error,
    fetch: fetchPlanInfo,
  };
} 