'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useChat, type UseChatOptions, type UseChatHelpers } from 'ai/react';
import { Agent } from '@agent-base/types';
import { useAgentContext } from './AgentProvider';
import { useConversationContext } from './ConversationProvider';
import { useOrganizationsQuery } from '@/hooks/useOrganizationsQuery';
import { useUser } from '@clerk/nextjs';
import { useViewContext } from './ViewProvider';

interface ChatContextType extends UseChatHelpers {
  chatAgent: Agent | null;
}

const ChatContext = createContext<ChatContextType | null>(null);

function ChatInitializer({ chatAgent, children }: { chatAgent: Agent, children: ReactNode }) {
  const { activeOrgId } = useOrganizationsQuery();
  const { user } = useUser();
  const { currentConversationId } = useConversationContext();
  
  const chat = useChat({
    api: '/api/agents/run',
    body: {
      conversationId: currentConversationId,
      activeOrgId: activeOrgId,
      agent: chatAgent,
    },
  });

  const chatContextValue: ChatContextType = {
    ...chat,
    chatAgent,
  };

  return (
    <ChatContext.Provider value={chatContextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const { selectedAgentForChat, isLoadingAgents } = useAgentContext();
  const { isCreatingAgent } = useViewContext();

  if (isCreatingAgent) {
    const newAgentPlaceholder: Agent = {
      id: 'new-agent',
      firstName: 'New',
      lastName: 'Agent',
      profilePicture: '',
      gender: 'other',
      modelId: 'default',
      memory: 'none',
      jobTitle: 'New Agent',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return <ChatInitializer chatAgent={newAgentPlaceholder}>{children}</ChatInitializer>;
  }

  if (isLoadingAgents || !selectedAgentForChat) {
    return <ChatContext.Provider value={null}>{children}</ChatContext.Provider>;
  }

  return (
    <ChatInitializer chatAgent={selectedAgentForChat}>
      {children}
    </ChatInitializer>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
} 