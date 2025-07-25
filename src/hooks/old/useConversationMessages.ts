/*
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Message } from 'ai/react';
import { useAuth } from '@clerk/nextjs';
import { useMessagePolling } from './polling/useMessagePolling';

interface UseConversationMessagesProps {
  conversationId: string | null;
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

export interface UseConversationMessagesReturn {
  currentConversationMessages: Message[];
  isLoadingConversationMessages: boolean;
  conversationMessagesError: string | null;
  fetchConversationMessages: () => Promise<void>;
}

export function useConversationMessages({ 
  conversationId,
  handleLogout,
  activeOrgId
}: UseConversationMessagesProps): UseConversationMessagesReturn {
  const { getToken, isSignedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversationMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const messageData: Message[] = await response.json();
      setMessages(messageData);
      
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, getToken, handleLogout]);

  useMessagePolling({
    refreshMessages: fetchConversationMessages,
    isSignedIn: isSignedIn,
    activeOrgId: activeOrgId,
    conversationId: conversationId
  });

  return {
    currentConversationMessages: messages,
    isLoadingConversationMessages: isLoading,
    conversationMessagesError: error,
    fetchConversationMessages
  };
}
*/ 