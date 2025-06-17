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
  isLoadingConversationList: boolean;
  conversationError: string | null;
  currentConversationIdRightPanel: string | null;
  isCreatingConversationRightPanel: boolean;
  selectConversationIdMiddlePanel: (conversationId: string | null) => void;
  selectConversationIdRightPanel: (conversationId: string | null) => void;
  handleCreateNewChatRightPanel: () => Promise<string | null>;
  refreshConversationList: () => Promise<void>;
  isConversationReadyRightPanel: boolean;
}

export const ConversationContext = createContext<ConversationContextType>({
  conversationList: [],
  currentConversationIdMiddlePanel: null,
  isLoadingConversationList: false,
  conversationError: null,
  currentConversationIdRightPanel: null,
  isCreatingConversationRightPanel: false,
  selectConversationIdMiddlePanel: () => {},
  selectConversationIdRightPanel: () => {},
  handleCreateNewChatRightPanel: async () => null,
  refreshConversationList: async () => {},
  isConversationReadyRightPanel: false,
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
    isLoadingConversationList,
    isCreatingConversationRightPanel,
    conversationError,
    handleCreateNewChatRightPanel,
    refreshConversationList,
    isConversationReadyRightPanel,
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
    isLoadingConversationList,
    isCreatingConversationRightPanel,
    conversationError,
    handleCreateNewChatRightPanel,
    refreshConversationList,
    isConversationReadyRightPanel,
  }), [
    conversationList,
    currentConversationIdMiddlePanel,
    currentConversationIdRightPanel,
    selectConversationIdMiddlePanel,
    selectConversationIdRightPanel,
    isLoadingConversationList,
    isCreatingConversationRightPanel,
    conversationError,
    handleCreateNewChatRightPanel,
    refreshConversationList,
    isConversationReadyRightPanel,
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