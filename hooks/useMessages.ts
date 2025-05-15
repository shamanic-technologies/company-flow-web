'use client';

import { useState, useCallback, useEffect } from 'react';
import { Message as VercelMessage } from 'ai/react';

interface UseMessagesProps {
  conversationId: string | null;
  handleLogout: () => void;
}

/**
 * @description Hook to manage messages for a given conversation.
 * @param {UseMessagesProps} props - Conversation ID and logout handler.
 * @returns An object containing messages, loading/error states, and fetch function for messages.
 */
export function useMessages({ conversationId, handleLogout }: UseMessagesProps) {
  const [currentMessages, setCurrentMessages] = useState<VercelMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (convId: string) => {
    if (!convId) {
      console.warn("useMessages: No conversation ID provided to fetch messages.");
      // Set error or clear messages? For now, just clear and set loading false.
      setCurrentMessages([]);
      setIsLoadingMessages(false);
      setMessageError("Cannot fetch messages: Missing conversation ID.");
      return;
    }

    console.log(`useMessages: Fetching messages for conversation ${convId}...`);
    setIsLoadingMessages(true);
    setCurrentMessages([]); // Clear previous messages
    setMessageError(null);    // Clear previous errors

    try {
      const messagesResponse = await fetch(`/api/messages/list?conversationId=${convId}`);

      if (messagesResponse.status === 401) {
        console.error('🚫 useMessages - Unauthorized loading messages');
        setMessageError('Unauthorized to load messages.');
        handleLogout(); // Perform logout on authorization failure
        return;
      }

      if (!messagesResponse.ok) {
        const errData = await messagesResponse.json().catch(() => ({}));
        throw new Error(`Failed to list messages: ${errData.error || messagesResponse.statusText} (${messagesResponse.status})`);
      }

      const messagesData: VercelMessage[] = await messagesResponse.json();

      if (!messagesData) {
        console.error('🚫 useMessages - Invalid message data received from API');
        setCurrentMessages([]); // Ensure messages are empty if data is invalid
        throw new Error('Invalid message data received from API');
      }

      // Only update state if the fetched data is different
      // Using a local variable for comparison to avoid dependency on currentMessages in useCallback
      setCurrentMessages(prevMessages => {
        if (JSON.stringify(messagesData) !== JSON.stringify(prevMessages)) {
          console.log(`useMessages: Messages data changed for ${convId}, updating state.`);
          return messagesData;
        }
        console.log(`useMessages: Messages data unchanged for ${convId}, skipping state update.`);
        return prevMessages;
      });

    } catch (error: any) {
      console.error(`useMessages: Error loading messages for ${convId}:`, error);
      setMessageError(`Error loading messages: ${error.message}`);
      setCurrentMessages([]); // Ensure messages are empty on error
    } finally {
      setIsLoadingMessages(false);
    }
  }, [handleLogout]); // Dependencies: handleLogout. convId is an argument.

  // Effect to Fetch Messages when Conversation ID (prop) changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId);
    } else {
      // If conversationId becomes null (e.g., no conversation selected), clear messages and error
      setCurrentMessages([]);
      setIsLoadingMessages(false); // Ensure loading is false
      setMessageError(null);      // Clear any previous message errors
    }
  }, [conversationId, fetchMessages]); // fetchMessages is stable due to useCallback

  return {
    currentMessages,
    isLoadingMessages,
    messageError,
    fetchMessages, // Expose fetchMessages for manual refresh (e.g., polling)
  };
} 