'use client';

import { useEffect, useRef } from 'react';

interface UseConversationPollingProps {
  refreshConversations: () => Promise<void>;
  pollingInterval?: number; // in milliseconds
  isSignedIn: boolean | undefined;
  // selectedAgentIdMiddlePanel: string | null; // Removed as polling now fetches all user conversations
}

/**
 * @description Custom hook to periodically poll for all user conversation data.
 * @param {UseConversationPollingProps} props - Configuration for conversation polling.
 * @param {() => Promise<void>} props.refreshConversations - Function to refresh all user conversations.
 * @param {number} [props.pollingInterval=5000] - Interval in milliseconds to poll. Defaults to 5000ms.
 * @param {boolean | undefined} props.isSignedIn - Boolean indicating if the user is signed in. Polling occurs if signed in.
 */
export function useConversationPolling({
  refreshConversations,
  pollingInterval = 5000,
  isSignedIn,
  // selectedAgentIdMiddlePanel, // Removed
}: UseConversationPollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      console.log('useConversationPolling: Polling for all user conversations...');
      refreshConversations().catch(error => {
        console.error('useConversationPolling: Error during polling for conversations:', error);
      });
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // Start polling only if user is signed in
    if (isSignedIn) { 
      performFetch(); // Initial fetch
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
      console.log(`useConversationPolling: Started polling for all user conversations every ${pollingInterval}ms.`);
    } else {
      console.log(`useConversationPolling: Polling for conversations stopped/not started (user not signed in).`);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        console.log('useConversationPolling: Stopped polling for all user conversations.');
      }
    };
  }, [refreshConversations, pollingInterval, isSignedIn]); // Removed selectedAgentIdMiddlePanel from dependencies
} 