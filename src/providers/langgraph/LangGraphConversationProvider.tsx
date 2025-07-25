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
import { useLangGraphConversationsQuery } from '@/hooks/langgraph/useLangGraphConversationsQuery';
import { Conversation } from '@agent-base/types';
import { useAgentContext } from '../AgentProvider';

interface LangGraphConversationContextType {
  conversations: Conversation[];
  isLoadingConversations: boolean;
  conversationError: string | null;
  currentConversationId: string | null;
  selectConversationId: (id: string | null) => void;
}

const LangGraphConversationContext = createContext<LangGraphConversationContextType | undefined>(
  undefined
);

export function LangGraphConversationProvider({ children }: { children: ReactNode }) {
  const { selectedAgentForChat } = useAgentContext();
  const agentId = selectedAgentForChat?.id ?? null;

  const { 
    conversations, 
    isLoadingConversations, 
    conversationError 
  } = useLangGraphConversationsQuery(agentId);

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

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
    <LangGraphConversationContext.Provider value={contextValue}>
      {children}
    </LangGraphConversationContext.Provider>
  );
}

export function useLangGraphConversationContext() {
  const context = useContext(LangGraphConversationContext);
  if (context === undefined) {
    throw new Error(
      'useLangGraphConversationContext must be used within a LangGraphConversationProvider'
    );
  }
  return context;
} 