/*
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAgentContext } from './AgentProvider';
import { useConversationContext } from './ConversationProvider';
import { useOrganizationsQuery } from '@/hooks/useOrganizationsQuery';
import { useConfiguredChat } from '@/hooks/chat/useConfiguredChat';
import { useUser } from '@clerk/nextjs';

export type ConfiguredChatHelpers = ReturnType<typeof useConfiguredChat>;

const ChatContext = createContext<ConfiguredChatHelpers | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { selectedAgentForChat } = useAgentContext();
  const { activeOrgId } = useOrganizationsQuery();
  const { currentConversationId } = useConversationContext();
  const { user } = useUser();

  const chatHelpers = useConfiguredChat({
    id: currentConversationId ?? undefined,
    api: '/api/agents/run',
    body: {
      conversationId: currentConversationId,
      activeOrgId: activeOrgId,
      agent: selectedAgentForChat,
    },
    agent: selectedAgentForChat ?? undefined,
    activeOrgId: activeOrgId,
    user: user,
  });

  return (
    <ChatContext.Provider value={chatHelpers}>{children}</ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === null) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
*/ 