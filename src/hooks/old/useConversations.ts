/*
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Conversation } from '@agent-base/types';
import { useAuth, UserResource } from '@clerk/nextjs';
import { useConversationPolling } from './polling/useConversationPolling';

interface UseConversationsProps {
  selectedAgentId: string | null;
  user: UserResource | null;
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

export interface UseConversationsReturn {
  conversationList: Conversation[];
  currentConversationId: string | null;
  selectConversationId: (conversationId: string | null) => void;
  isLoadingConversationList: boolean;
  isCreatingConversation: boolean;
  conversationError: string | null;
  handleCreateNewChat: () => Promise<void>;
  refreshConversationList: () => Promise<void>;
  isConversationReady: boolean;
}

export function useConversations({
  selectedAgentId,
  user,
  handleLogout,
  activeOrgId
}: UseConversationsProps): UseConversationsReturn {
  const { getToken, isSignedIn } = useAuth();
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isReady = !isLoading && !isCreating;

  const selectConversationId = useCallback((conversationId: string | null) => {
    setCurrentConversationId(conversationId);
  }, []);

  const refreshConversationList = useCallback(async () => {
    if (!activeOrgId || !user) {
      setConversationList([]);
      if (isLoading) setIsLoading(false);
      return;
    }
    
    if (conversationList.length === 0) {
      if (!isLoading) setIsLoading(true);
    }
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`/api/conversations?organizationId=${activeOrgId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) {
        throw new Error(`Failed to fetch conversations: ${response.statusText}`);
      }

      const conversations: Conversation[] = await response.json();
      setConversationList(conversations);
      
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      if (isLoading) setIsLoading(false);
    }
  }, [activeOrgId, getToken, user, isLoading, conversationList.length, handleLogout]);

  useConversationPolling({
    refreshConversations: refreshConversationList,
    isSignedIn: isSignedIn,
    activeOrgId: activeOrgId
  });

  const handleCreateNewChat = useCallback(async () => {
    if (!selectedAgentId || !activeOrgId) {
      setError("Cannot create new chat: No agent or organization selected.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token not available.");
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          agentId: selectedAgentId,
          organizationId: activeOrgId,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create conversation: ${response.statusText}`);
      }
      
      const newConversation = await response.json();
      setConversationList(prev => [newConversation, ...prev]);
      selectConversationId(newConversation.id);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred while creating the chat.');
    } finally {
      setIsCreating(false);
    }
  }, [selectedAgentId, activeOrgId, getToken, selectConversationId]);

  useEffect(() => {
    if (activeOrgId) {
      refreshConversationList();
    } else {
      setConversationList([]);
      setCurrentConversationId(null);
      setIsLoading(false);
    }
  }, [activeOrgId, refreshConversationList]);

  const sortedConversations = useMemo(() => {
    return [...conversationList].sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [conversationList]);

  return {
    conversationList: sortedConversations,
    currentConversationId,
    selectConversationId,
    isLoadingConversationList: isLoading,
    isCreatingConversation: isCreating,
    conversationError: error,
    handleCreateNewChat,
    refreshConversationList,
    isConversationReady: isReady,
  };
}
*/ 