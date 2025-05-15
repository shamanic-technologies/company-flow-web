'use client';

import { useEffect, useRef } from 'react';

interface UseMessagePollingProps {
  fetchMessages: (conversationId: string) => Promise<void>; // Function to fetch messages for a given conversation ID
  currentConversationIdMiddlePanel: string | null; // The ID of the currently active conversation
  pollingInterval?: number; // in milliseconds
  isSignedIn: boolean | undefined;
  activeAgentView: string; // To ensure we only poll when in 'chat' view
}

/**
 * @description Custom hook to periodically poll for messages in the active conversation.
 * @param {UseMessagePollingProps} props - Configuration for message polling.
 * @param {(conversationId: string) => Promise<void>} props.fetchMessages - Function to fetch messages.
 * @param {string | null} props.currentConversationIdMiddlePanel - The ID of the current conversation. Polling only occurs if this is set.
 * @param {number} [props.pollingInterval=5000] - Interval in milliseconds to poll. Defaults to 5000ms.
 * @param {boolean | undefined} props.isSignedIn - Boolean indicating if the user is signed in.
 * @param {string} props.activeAgentView - The current view in the dashboard (e.g., 'chat', 'conversations'). Polling for messages only happens if view is 'chat'.
 */
export function useMessagePolling({
  fetchMessages,
  currentConversationIdMiddlePanel,
  pollingInterval = 5000,
  isSignedIn,
  activeAgentView,
}: UseMessagePollingProps): void {
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const performFetch = () => {
      if (currentConversationIdMiddlePanel) { // Should always be true due to the condition below, but good for safety
        console.log(`useMessagePolling: Polling for messages in conversation ${currentConversationIdMiddlePanel}...`);
        fetchMessages(currentConversationIdMiddlePanel).catch(error => {
          console.error('useMessagePolling: Error during polling for messages:', error);
        });
      }
    };

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // Start polling only if user is signed in, a conversation is selected, AND the view is 'chat'
    if (isSignedIn && currentConversationIdMiddlePanel && activeAgentView === 'chat') {
      performFetch(); // Initial fetch
      intervalIdRef.current = setInterval(performFetch, pollingInterval);
      console.log(`useMessagePolling: Started polling for messages every ${pollingInterval}ms for conversation ${currentConversationIdMiddlePanel}.`);
    } else {
      let reason = !isSignedIn ? "user not signed in" : !currentConversationIdMiddlePanel ? "no conversation selected" : "not in chat view";
      console.log(`useMessagePolling: Polling for messages stopped/not started (${reason}).`);
    }

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
        console.log('useMessagePolling: Stopped polling for messages.');
      }
    };
  }, [fetchMessages, currentConversationIdMiddlePanel, pollingInterval, isSignedIn, activeAgentView]);
} 