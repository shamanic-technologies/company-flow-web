'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Conversation } from '@agent-base/types';
import { useConversations } from '@/hooks/useConversations';
import { useAgentContext } from './AgentProvider';
import { useUserContext } from './UserProvider';
import { useOrganizationContext } from './OrganizationProvider';

interface ConversationContextType {
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

export const ConversationContext = createContext<ConversationContextType>({
  conversationList: [],
  currentConversationId: null,
  selectConversationId: () => {},
  isLoadingConversationList: false,
  isCreatingConversation: false,
  conversationError: null,
  handleCreateNewChat: async () => {},
  refreshConversationList: async () => {},
  isConversationReady: false,
});

export function ConversationProvider({ children }: { children: ReactNode }) {
  const { clerkUser, handleClerkLogout } = useUserContext();
  const { activeOrgId } = useOrganizationContext();
  const { selectedAgentId } = useAgentContext();

  const {
    conversationList,
    currentConversationId,
    selectConversationId,
    isLoadingConversationList,
    isCreatingConversation,
    conversationError,
    handleCreateNewChat,
    refreshConversationList,
    isConversationReady,
  } = useConversations({
    selectedAgentId: selectedAgentId,
    user: clerkUser,
    handleLogout: handleClerkLogout,
    activeOrgId,
  });

  const contextValue = useMemo(() => ({
    conversationList,
    currentConversationId,
    selectConversationId,
    isLoadingConversationList,
    isCreatingConversation,
    conversationError,
    handleCreateNewChat,
    refreshConversationList,
    isConversationReady,
  }), [
    conversationList,
    currentConversationId,
    selectConversationId,
    isLoadingConversationList,
    isCreatingConversation,
    conversationError,
    handleCreateNewChat,
    refreshConversationList,
    isConversationReady,
  ]);

  return (
    <ConversationContext.Provider value={contextValue}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversationContext() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversationContext must be used within a ConversationProvider');
  }
  return context;
} 