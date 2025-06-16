/**
 * Custom hook for fetching detailed plan and credit information
 * Uses the optimized /api/credits/plan-info endpoint
 */
import { PlanInfo } from '@/types/credit';
import { useState, useEffect, useCallback } from 'react';

interface UsePlanInfoProps {
  activeOrgId: string | null | undefined; // Added activeOrgId
}

interface UsePlanInfoReturn {
  planInfo: PlanInfo | null;
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export function usePlanInfo({ activeOrgId }: UsePlanInfoProps): UsePlanInfoReturn {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanInfo = useCallback(async () => {
    if (!activeOrgId) {
      console.log("usePlanInfo: Waiting for activeOrgId to fetch plan info...");
      setPlanInfo(null);
      setIsLoading(false); // Not truly loading if prerequisites aren't met
      setError("Organization not selected. Cannot fetch plan info."); // Set an error
      return;
    }
    setError(null); // Clear previous errors
    console.log(`usePlanInfo: Fetching plan info for org: ${activeOrgId}`);

    try {
      const response = await fetch('/api/credits/plan-info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        throw new Error(errorData.message || 'Failed to fetch plan information');
      }

      const fetchedPlanInfo: PlanInfo = await response.json();
      setPlanInfo(fetchedPlanInfo);
    } catch (err: any) {
      console.error('[usePlanInfo] Error:', err);
      setPlanInfo(null); // Clear planInfo on error
      setError(err.message || 'Failed to fetch plan information');
    } finally {
      setIsLoading(false);
    }
  }, [activeOrgId]); // Added activeOrgId to dependencies

  // Fetch on mount or when activeOrgId changes
  useEffect(() => {
    if (activeOrgId) { // Only fetch if activeOrgId is available
      setIsLoading(true); // Set loading true only when proceeding
      fetchPlanInfo();
    } else {
      // If activeOrgId is not available, reset state
      setPlanInfo(null);
      setIsLoading(false); // Not loading if no orgId
      setError("No active organization selected."); // Or null if you prefer no error message initially
    }
  }, [activeOrgId, fetchPlanInfo]); // Added activeOrgId dependency here as well

  return {
    planInfo,
    isLoading,
    error,
    fetch: fetchPlanInfo,
  };
}
