'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useChat, type UseChatHelpers } from 'ai/react';
import { Agent } from '@agent-base/types';
import { useAgentContext } from './AgentProvider';
import { useConversationContext } from './ConversationProvider';
import { useOrganizationsQuery } from '@/hooks/useOrganizationsQuery';

interface ChatContextType extends UseChatHelpers {
  chatAgent: Agent | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { selectedAgentForChat } = useAgentContext();
  const { activeOrgId } = useOrganizationsQuery();
  const { currentConversationId } = useConversationContext();
  
  const chat = useChat({
    // The 'id' prop expects string | undefined, so we convert null to undefined.
    id: currentConversationId ?? undefined,
    api: '/api/agents/run',
    body: {
      // The conversationId in the body is now slightly redundant but can be useful
      // for backend logic that doesn't rely on the top-level `id`.
      conversationId: currentConversationId,
      activeOrgId: activeOrgId,
      agent: selectedAgentForChat,
    },
  });

  const chatContextValue: ChatContextType = {
    ...chat,
    chatAgent: selectedAgentForChat,
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 