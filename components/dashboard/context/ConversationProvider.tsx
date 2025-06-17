'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Conversation } from '@agent-base/types';
import { useConversations } from '../../../hooks/useConversations';
import { useAgentContext } from './AgentProvider';
import { useUserContext } from './UserProvider';
import { useOrganizationContext } from './OrganizationProvider';

interface ConversationContextType {
  conversationList: Conversation[]; 
  currentConversationIdMiddlePanel: string | null;
  isLoadingConversationsMiddlePanel: boolean;
  conversationError: string | null;
  currentConversationIdRightPanel: string | null;
  isCreatingConversationRightPanel: boolean;
  selectConversationIdMiddlePanel: (conversationId: string | null) => void;
  selectConversationIdRightPanel: (conversationId: string | null) => void;
  handleCreateNewChatRightPanel: () => Promise<string | null>;
  refreshConversationList: () => Promise<void>;
}

export const ConversationContext = createContext<ConversationContextType>({
  conversationList: [],
  currentConversationIdMiddlePanel: null,
  isLoadingConversationsMiddlePanel: false,
  conversationError: null,
  currentConversationIdRightPanel: null,
  isCreatingConversationRightPanel: false,
  selectConversationIdMiddlePanel: () => {},
  selectConversationIdRightPanel: () => {},
  handleCreateNewChatRightPanel: async () => null,
  refreshConversationList: async () => {},
});

export function ConversationProvider({ children }: { children: ReactNode }) {
  const { clerkUser, handleClerkLogout } = useUserContext();
  const { activeOrgId } = useOrganizationContext();
  const { selectedAgentIdMiddlePanel, selectedAgentIdRightPanel } = useAgentContext();

  const {
    conversationList,
    currentConversationIdMiddlePanel,
    currentConversationIdRightPanel,
    selectConversationIdMiddlePanel,
    selectConversationIdRightPanel,
    isLoadingConversationsMiddlePanel,
    isCreatingConversationRightPanel,
    conversationError,
    handleCreateNewChatRightPanel,
    refreshConversationList,
  } = useConversations({
    selectedAgentIdMiddlePanel,
    selectedAgentIdRightPanel,
    user: clerkUser,
    handleLogout: handleClerkLogout,
    activeOrgId,
  });

  const contextValue = useMemo(() => ({
    conversationList,
    currentConversationIdMiddlePanel,
    currentConversationIdRightPanel,
    selectConversationIdMiddlePanel,
    selectConversationIdRightPanel,
    isLoadingConversationsMiddlePanel,
    isCreatingConversationRightPanel,
    conversationError,
    handleCreateNewChatRightPanel,
    refreshConversationList,
  }), [
    conversationList,
    currentConversationIdMiddlePanel,
    currentConversationIdRightPanel,
    selectConversationIdMiddlePanel,
    selectConversationIdRightPanel,
    isLoadingConversationsMiddlePanel,
    isCreatingConversationRightPanel,
    conversationError,
    handleCreateNewChatRightPanel,
    refreshConversationList,
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