/*
'use client'

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { PlanInfo } from '@/types/credit';

interface UsePlanInfoProps {
  activeOrgId: string | null | undefined;
}

export function usePlanInfo({ activeOrgId }: UsePlanInfoProps) {
  const { getToken } = useAuth();
  
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlanInfo = useCallback(async () => {
    if (!activeOrgId) {
      setError('No active organization.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`/api/billing/plan-info?organizationId=${activeOrgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch plan info.');
      }

      const data: PlanInfo = await response.json();
      setPlanInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrgId, getToken]);

  useEffect(() => {
    fetchPlanInfo();
  }, [fetchPlanInfo]);
  
  return { planInfo, isLoading, error, fetch: fetchPlanInfo };
}
*/ 