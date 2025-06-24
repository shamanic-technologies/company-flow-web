'use client';

import { useEffect, useRef } from 'react';

interface UseConversationPollingProps {
  refreshConversations: () => Promise<void>;
  pollingInterval?: number; // in milliseconds
  isSignedIn: boolean | undefined;
  activeOrgId: string | null | undefined;
}

/**
 * @description Custom hook to periodically poll for all user conversation data.
 * @param {UseConversationPollingProps} props - Configuration for conversation polling.
 * @param {() => Promise<void>} props.refreshConversations - Function to refresh all user conversations.
 * @param {number} [props.pollingInterval=5000] - Interval in milliseconds to poll. Defaults to 5000ms.
 * @param {boolean | undefined} props.isSignedIn - Boolean indicating if the user is signed in.
 * @param {string | null | undefined} props.activeOrgId - The active organization ID. Polling occurs if signed in AND org is active.
 */
export function useConversationPolling({
  refreshConversations,
  pollingInterval = 5000,
  isSignedIn,
  activeOrgId,
}: UseConversationPollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      refreshConversations().catch(error => {
        console.error('useConversationPolling: Error during polling for conversations:', error);
      });
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // Start polling only if user is signed in AND an organization is active
    if (isSignedIn && activeOrgId) { 
      performFetch(); // Initial fetch
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [refreshConversations, pollingInterval, isSignedIn, activeOrgId]);
} 