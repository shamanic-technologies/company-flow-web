'use client';

import { useEffect, useRef } from 'react';

interface UseAgentPollingProps {
  fetchAgents: () => Promise<void>;
  pollingInterval?: number; // in milliseconds
  isSignedIn: boolean | undefined;
}

/**
 * @description Custom hook to periodically poll for agent data.
 * @param {UseAgentPollingProps} props - Configuration for agent polling.
 * @param {() => Promise<void>} props.fetchAgents - Function to fetch agent data.
 * @param {number} [props.pollingInterval=5000] - Interval in milliseconds to poll for agents. Defaults to 5000ms.
 * @param {boolean | undefined} props.isSignedIn - Boolean indicating if the user is currently signed in. Polling only occurs if true.
 */
export function useAgentPolling({
  fetchAgents,
  pollingInterval = 5000,
  isSignedIn,
}: UseAgentPollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to perform the fetch operation
    const performFetch = () => {
      fetchAgents().catch(error => {
        console.error('useAgentPolling: Error during polling for agents:', error);
      });
    };

    // Clear any existing interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // Start polling only if the user is signed in
    if (isSignedIn) {
      // Perform an initial fetch immediately
      performFetch(); 
      // Then set up the interval
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
    }

    // Cleanup function to clear the interval when the component unmounts
    // or when dependencies change causing the effect to re-run.
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        console.log('useAgentPolling: Stopped polling for agents.');
      }
    };
  }, [fetchAgents, pollingInterval, isSignedIn]); // Re-run effect if these dependencies change
} 