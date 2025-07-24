'use client';

import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useConversationsQuery } from '@/hooks/useConversationsQuery';
import { Conversation } from '@agent-base/types';
import { useAgentContext } from './AgentProvider';

interface ConversationContextType {
  conversations: Conversation[];
  isLoadingConversations: boolean;
  conversationError: string | null;
  currentConversationId: string | null;
  selectConversationId: (id: string | null) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const { selectedAgentForChat } = useAgentContext();
  const agentId = selectedAgentForChat?.id ?? null;

  const { 
    conversations, 
    isLoadingConversations, 
    conversationError 
  } = useConversationsQuery(agentId);
  console.debug('[ConversationProvider] conversations', conversations);

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Step 1: When the agent changes, reset the conversation selection.
  // This cleans the slate and prepares for the new conversation list.
  useEffect(() => {
    setCurrentConversationId(null);
  }, [agentId]);

  const selectConversationId = useCallback((id: string | null) => {
    setCurrentConversationId(id);
  }, []);

  const contextValue = useMemo(
    () => ({
      conversations,
      isLoadingConversations,
      conversationError: conversationError?.message ?? null,
      currentConversationId,
      selectConversationId,
    }),
    [
      conversations, 
      isLoadingConversations, 
      conversationError, 
      currentConversationId, 
      selectConversationId, 
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