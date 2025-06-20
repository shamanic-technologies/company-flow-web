'use client';

import { useEffect, useRef } from 'react';

interface UseDashboardPollingProps {
  fetchDashboards: () => Promise<void>;
  pollingInterval?: number;
  isSignedIn: boolean | undefined;
  activeOrgId: string | null | undefined;
}

/**
 * @description Custom hook to periodically poll for dashboard data.
 * @param {UseDashboardPollingProps} props - Configuration for dashboard polling.
 */
export function useDashboardPolling({
  fetchDashboards,
  pollingInterval = 5000,
  isSignedIn,
  activeOrgId,
}: UseDashboardPollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      fetchDashboards().catch(error => {
        console.error('useDashboardPolling: Error during polling for dashboards:', error);
      });
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (isSignedIn && activeOrgId) {
      performFetch();
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
      console.log(`useDashboardPolling: Started polling dashboards for org ${activeOrgId} every ${pollingInterval}ms.`);
    } else {
      let reason = !isSignedIn ? "user not signed in" : "no active organization";
      console.log(`useDashboardPolling: Polling for dashboards stopped/not started (${reason}).`);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        console.log('useDashboardPolling: Stopped polling for dashboards.');
      }
    };
  }, [fetchDashboards, pollingInterval, isSignedIn, activeOrgId]);
} 