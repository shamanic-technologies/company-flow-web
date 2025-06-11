'use client';

import { useState, useCallback, useEffect } from 'react';
import { Message as VercelMessage } from 'ai/react';

interface UseMessagesProps {
  conversationId: string | null;
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

/**
 * @description Hook to manage messages for a given conversation.
 * @param {UseMessagesProps} props - Conversation ID, logout handler, and activeOrgId.
 * @returns An object containing messages, loading/error states, and fetch function for messages.
 */
export function useMessages({ conversationId, handleLogout, activeOrgId }: UseMessagesProps) {
  const [currentMessages, setCurrentMessages] = useState<VercelMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (convId: string) => {
    if (!activeOrgId) {
      console.warn("useMessages: No activeOrgId provided. Cannot fetch messages.");
      setCurrentMessages([]);
      setIsLoadingMessages(false);
      setMessageError("Organization context not available. Cannot fetch messages.");
      return;
    }
    if (!convId) {
      console.warn("useMessages: No conversation ID provided to fetch messages.");
      setCurrentMessages([]);
      setIsLoadingMessages(false);
      setMessageError("Cannot fetch messages: Missing conversation ID.");
      return;
    }

    setMessageError(null);

    try {
      const messagesResponse = await fetch(`/api/messages/list?conversationId=${convId}`);

      if (messagesResponse.status === 401) {
        console.error('🚫 useMessages - Unauthorized loading messages');
        setMessageError('Unauthorized to load messages.');
        setCurrentMessages([]); // Clear messages
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
        setCurrentMessages([]);
        throw new Error('Invalid message data received from API');
      }
      
      // Use functional update to avoid dependency on currentMessages in useCallback
      setCurrentMessages(prevMessages => {
        if (JSON.stringify(messagesData) !== JSON.stringify(prevMessages)) {
          return messagesData;
        }
        return prevMessages;
      });

    } catch (error: any) {
      console.error(`useMessages: Error loading messages for ${convId}:`, error);
      setMessageError(`Error loading messages: ${error.message}`);
      setCurrentMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [activeOrgId, handleLogout]); // REMOVED currentMessages from dependency array

  useEffect(() => {
    if (activeOrgId && conversationId) { // Check for activeOrgId here too
      setIsLoadingMessages(true);
      setCurrentMessages([]);
      fetchMessages(conversationId);
    } else {
      setCurrentMessages([]);
      setIsLoadingMessages(false);
      setMessageError(null);
      if (!activeOrgId) console.log("useMessages: No activeOrgId, clearing messages.");
      if (!conversationId) console.log("useMessages: No conversationId, clearing messages.");
    }
  }, [activeOrgId, conversationId, fetchMessages]); // Added activeOrgId

  return {
    currentMessages,
    isLoadingMessages,
    messageError,
    fetchMessages,
  };
} 