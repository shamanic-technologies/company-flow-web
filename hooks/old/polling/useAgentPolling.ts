/*
'use client';

import { useEffect, useRef } from 'react';

interface UseAgentPollingProps {
  refreshAgents: () => Promise<void>;
  pollingInterval?: number;
  isSignedIn: boolean | undefined;
  activeOrgId: string | null | undefined;
}

export function useAgentPolling({
  refreshAgents,
  pollingInterval = 5000,
  isSignedIn,
  activeOrgId,
}: UseAgentPollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      refreshAgents().catch(error => {
        console.error('useAgentPolling: Error during polling:', error);
      });
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (isSignedIn && activeOrgId) {
      performFetch();
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [refreshAgents, pollingInterval, isSignedIn, activeOrgId]);
}
*/ 