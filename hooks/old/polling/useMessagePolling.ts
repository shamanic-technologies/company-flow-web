/*
'use client';

import { useEffect, useRef } from 'react';

interface UseMessagePollingProps {
  refreshMessages: () => Promise<void>;
  pollingInterval?: number;
  isSignedIn: boolean | undefined;
  activeOrgId: string | null | undefined;
  conversationId: string | null;
}

export function useMessagePolling({
  refreshMessages,
  pollingInterval = 2000,
  isSignedIn,
  activeOrgId,
  conversationId,
}: UseMessagePollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      refreshMessages().catch(error => {
        console.error('useMessagePolling: Error during polling:', error);
      });
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    if (isSignedIn && activeOrgId && conversationId) {
      performFetch();
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [refreshMessages, pollingInterval, isSignedIn, activeOrgId, conversationId]);
}
*/ 