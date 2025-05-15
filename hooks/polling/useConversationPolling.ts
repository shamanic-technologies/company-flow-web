'use client';

import { useEffect, useRef } from 'react';

interface UseConversationPollingProps {
  refreshConversations: () => Promise<void>;
  pollingInterval?: number; // in milliseconds
  isSignedIn: boolean | undefined;
  selectedAgentId: string | null; // Only poll if an agent is selected
}

/**
 * @description Custom hook to periodically poll for conversation list data.
 * @param {UseConversationPollingProps} props - Configuration for conversation polling.
 * @param {() => Promise<void>} props.refreshConversations - Function to refresh conversation list.
 * @param {number} [props.pollingInterval=5000] - Interval in milliseconds to poll. Defaults to 5000ms.
 * @param {boolean | undefined} props.isSignedIn - Boolean indicating if the user is signed in.
 * @param {string | null} props.selectedAgentId - The ID of the currently selected agent. Polling only occurs if an agent is selected.
 */
export function useConversationPolling({
  refreshConversations,
  pollingInterval = 5000,
  isSignedIn,
  selectedAgentId,
}: UseConversationPollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      console.log('useConversationPolling: Polling for conversations...');
      refreshConversations().catch(error => {
        console.error('useConversationPolling: Error during polling for conversations:', error);
      });
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // Start polling only if user is signed in AND an agent is selected
    if (isSignedIn && selectedAgentId) {
      performFetch(); // Initial fetch
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
      console.log(`useConversationPolling: Started polling for conversations every ${pollingInterval}ms for agent ${selectedAgentId}.`);
    } else {
      let reason = !isSignedIn ? "user not signed in" : "no agent selected";
      console.log(`useConversationPolling: Polling for conversations stopped/not started (${reason}).`);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        console.log('useConversationPolling: Stopped polling for conversations.');
      }
    };
  }, [refreshConversations, pollingInterval, isSignedIn, selectedAgentId]);
} 