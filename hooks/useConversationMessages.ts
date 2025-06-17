'use client';

import { useState, useCallback, useEffect } from 'react';
import { Message as VercelMessage } from 'ai/react';
import { useAuth } from '@clerk/nextjs';

interface UseConversationMessagesProps {
  conversationId: string | null;
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

/**
 * @description Hook to manage messages for a given conversation.
 * @param {UseConversationMessagesProps} props - Conversation ID, logout handler, and activeOrgId.
 * @returns An object containing messages, loading/error states, and fetch function for messages.
 */
export function useConversationMessages({ conversationId, handleLogout, activeOrgId }: UseConversationMessagesProps) {
  const { getToken } = useAuth();
  const [currentConversationMessages, setCurrentConversationMessages] = useState<VercelMessage[]>([]);
  const [isLoadingConversationMessages, setIsLoadingConversationMessages] = useState<boolean>(false);
  const [conversationMessagesError, setConversationMessagesError] = useState<string | null>(null);

  const fetchConversationMessages = useCallback(async (convId: string) => {
    if (!activeOrgId) {
      console.warn("useConversationMessages: No activeOrgId provided. Cannot fetch messages.");
      setCurrentConversationMessages([]);
      setIsLoadingConversationMessages(false);
      setConversationMessagesError("Organization context not available. Cannot fetch messages.");
      return;
    }
    if (!convId) {
      console.warn("useConversationMessages: No conversation ID provided to fetch messages.");
      setCurrentConversationMessages([]);
      setIsLoadingConversationMessages(false);
      setConversationMessagesError("Cannot fetch messages: Missing conversation ID.");
      return;
    }

    setConversationMessagesError(null);

    try {
      const token = await getToken();
      const messagesResponse = await fetch(`/api/messages/list?conversationId=${convId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (messagesResponse.status === 401) {
        console.error('🚫 useConversationMessages - Unauthorized loading messages');
        setConversationMessagesError('Unauthorized to load messages.');
        setCurrentConversationMessages([]); // Clear messages
        handleLogout();
        return;
      }

      if (!messagesResponse.ok) {
        const errData = await messagesResponse.json().catch(() => ({}));
        throw new Error(`Failed to list messages: ${errData.error || messagesResponse.statusText} (${messagesResponse.status})`);
      }

      const messagesData: VercelMessage[] = await messagesResponse.json();

      if (!messagesData) {
        console.error('🚫 useMessages - Invalid message data received from API');
        setCurrentConversationMessages([]);
        throw new Error('Invalid message data received from API');
      }
      
      // Use functional update to avoid dependency on currentMessages in useCallback
      setCurrentConversationMessages(prevConversationMessages => {
        if (JSON.stringify(messagesData) !== JSON.stringify(prevConversationMessages)) {
          return messagesData;
        }
        return prevConversationMessages;
      });

    } catch (error: any) {
      console.error(`useMessages: Error loading messages for ${convId}:`, error);
      setConversationMessagesError(`Error loading messages: ${error.message}`);
      setCurrentConversationMessages([]);
    } finally {
      setIsLoadingConversationMessages(false);
    }
  }, [activeOrgId, handleLogout, getToken]); // REMOVED currentMessages from dependency array

  useEffect(() => {
    if (activeOrgId && conversationId) { // Check for activeOrgId here too
      setIsLoadingConversationMessages(true);
      setCurrentConversationMessages([]);
      fetchConversationMessages(conversationId);
    } else {
      setCurrentConversationMessages([]);
      setIsLoadingConversationMessages(false);
      setConversationMessagesError(null);
      if (!activeOrgId) console.log("useMessages: No activeOrgId, clearing messages.");
      if (!conversationId) console.log("useMessages: No conversationId, clearing messages.");
    }
  }, [activeOrgId, conversationId, fetchConversationMessages]); // Added activeOrgId

  return {
    currentConversationMessages,
    isLoadingConversationMessages,
    conversationMessagesError,
    fetchConversationMessages,
  };
} 