'use client';

import { useEffect, useRef } from 'react';

interface UseMessagePollingProps {
  fetchMessages: (conversationId: string) => Promise<void>; // Function to fetch messages for a given conversation ID
  currentConversationIdMiddlePanel: string | null; // The ID of the currently active conversation
  pollingInterval?: number; // in milliseconds
  isSignedIn: boolean | undefined;
  activeAgentView: string; // To ensure we only poll when in 'chat' view
  activeOrgId: string | null | undefined; // Added activeOrgId
}

/**
 * @description Custom hook to periodically poll for messages in the active conversation.
 * @param {UseMessagePollingProps} props - Configuration for message polling.
 * @param {(conversationId: string) => Promise<void>} props.fetchMessages - Function to fetch messages.
 * @param {string | null} props.currentConversationIdMiddlePanel - The ID of the current conversation. Polling only occurs if this is set.
 * @param {number} [props.pollingInterval=5000] - Interval in milliseconds to poll. Defaults to 5000ms.
 * @param {boolean | undefined} props.isSignedIn - Boolean indicating if the user is signed in.
 * @param {string} props.activeAgentView - The current view in the dashboard (e.g., 'chat', 'conversations'). Polling for messages only happens if view is 'chat'.
 * @param {string | null | undefined} props.activeOrgId - Active organization ID. Polling occurs if set.
 */
export function useMessagePolling({
  fetchMessages,
  currentConversationIdMiddlePanel,
  pollingInterval = 5000,
  isSignedIn,
  activeAgentView,
  activeOrgId, // Added activeOrgId
}: UseMessagePollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      if (currentConversationIdMiddlePanel) { // Should always be true due to the condition below, but good for safety
        fetchMessages(currentConversationIdMiddlePanel).catch(error => {
          console.error('useMessagePolling: Error during polling for messages:', error);
        });
      }
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // Start polling only if user is signed in, an org is active, a conversation is selected, AND the view is 'chat'
    if (isSignedIn && activeOrgId && currentConversationIdMiddlePanel && activeAgentView === 'chat') {
      performFetch(); // Initial fetch
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
    } else {
      let reason = "unknown";
      if (!isSignedIn) reason = "user not signed in";
      else if (!activeOrgId) reason = "no active organization";
      else if (!currentConversationIdMiddlePanel) reason = "no conversation selected";
      else if (activeAgentView !== 'chat') reason = "not in chat view";
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [fetchMessages, currentConversationIdMiddlePanel, pollingInterval, isSignedIn, activeAgentView, activeOrgId]); // Added activeOrgId
} 