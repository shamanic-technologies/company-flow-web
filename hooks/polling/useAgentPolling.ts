'use client';

import { useEffect, useRef } from 'react';

interface UseAgentPollingProps {
  fetchAgents: () => Promise<void>;
  pollingInterval?: number; // in milliseconds
  isSignedIn: boolean | undefined;
  activeOrgId: string | null | undefined;
}

/**
 * @description Custom hook to periodically poll for agent data.
 * @param {UseAgentPollingProps} props - Configuration for agent polling.
 * @param {() => Promise<void>} props.fetchAgents - Function to fetch agent data.
 * @param {number} [props.pollingInterval=5000] - Interval in milliseconds to poll for agents. Defaults to 5000ms.
 * @param {boolean | undefined} props.isSignedIn - Boolean indicating if the user is currently signed in.
 * @param {string | null | undefined} props.activeOrgId - The active organization ID. Polling only occurs if signed in AND org is active.
 */
export function useAgentPolling({
  fetchAgents,
  pollingInterval = 5000,
  isSignedIn,
  activeOrgId,
}: UseAgentPollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      fetchAgents().catch(error => {
        console.error('useAgentPolling: Error during polling for agents:', error);
      });
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (isSignedIn && activeOrgId) {
      performFetch(); 
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
      console.log(`useAgentPolling: Started polling agents for org ${activeOrgId} every ${pollingInterval}ms.`);
    } else {
      let reason = !isSignedIn ? "user not signed in" : "no active organization";
      console.log(`useAgentPolling: Polling for agents stopped/not started (${reason}).`);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        console.log('useAgentPolling: Stopped polling for agents.');
      }
    };
  }, [fetchAgents, pollingInterval, isSignedIn, activeOrgId]);
} 