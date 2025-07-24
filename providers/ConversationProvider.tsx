'use client';

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useCallback,
} from 'react';
import { useOrganizationsQuery } from '@/hooks/useOrganizationsQuery';
import { useConversationsQuery } from '@/hooks/useConversationsQuery';
import { useAuth } from '@clerk/nextjs';
import { Conversation } from '@agent-base/types';
import { useQueryClient } from '@tanstack/react-query';

interface ConversationContextType {
  // From React Query
  conversations: Conversation[];
  isLoadingConversations: boolean;
  conversationError: string | null;
  isConversationsReady: boolean;

  // Local state for managing the active conversation
  currentConversationId: string | null;
  selectConversationId: (id: string | null) => void;
  getOrCreateConversationForAgent: (agentId: string) => Promise<string | null>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const { activeOrgId } = useOrganizationsQuery();
  const { getToken } = useAuth();
  const { 
    conversations, 
    isLoadingConversations, 
    conversationError 
  } = useConversationsQuery();
  const queryClient = useQueryClient();

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const selectConversationId = useCallback((id: string | null) => {
    setCurrentConversationId(id);
  }, []);

  const getOrCreateConversationForAgent = useCallback(async (agentId: string): Promise<string | null> => {
    if (!activeOrgId) {
      console.error("Cannot create conversation without an active organization.");
      return null;
    }
    try {
      const token = await getToken();
      // This endpoint gets existing conversations or creates a new one if none exist.
      const response = await fetch(`/api/conversations/list-or-create?agent_id=${agentId}`, {
        method: 'GET', // Use GET as required by the endpoint
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Failed to get or create a conversation');
      }
      // The endpoint returns an array of conversations
      const conversations: Conversation[] = await response.json();
      
      if (conversations.length === 0) {
        // This case should ideally not be reached if the backend guarantees creation
        console.error("Backend returned an empty array, expected at least one conversation.");
        return null;
      }

      const newConversation = conversations[0]; // Get the first conversation

      // Manually update the query cache and set the new conversation as active
      queryClient.invalidateQueries({ queryKey: ['conversations', activeOrgId] });
      selectConversationId(newConversation.conversationId);
      
      return newConversation.conversationId;
    } catch (error) {
      console.error("Error in get-or-create conversation flow:", error);
      return null;
    }
  }, [activeOrgId, getToken, selectConversationId, queryClient]);

  const contextValue = useMemo(
    () => ({
      conversations,
      isLoadingConversations,
      conversationError: conversationError?.message ?? null,
      isConversationsReady: !isLoadingConversations && !conversationError,
      currentConversationId,
      selectConversationId,
      getOrCreateConversationForAgent,
    }),
    [
      conversations, 
      isLoadingConversations, 
      conversationError, 
      currentConversationId, 
      selectConversationId, 
      getOrCreateConversationForAgent
    ]
  );

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      'useConversationContext must be used within a ConversationProvider'
    );
  }
  return context;
} 