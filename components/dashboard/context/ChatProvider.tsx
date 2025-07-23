'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Message, CreateMessage } from 'ai/react';
import { useConfiguredChat, CustomChatRequestOptions } from '@/hooks/chat/useConfiguredChat';
import { useConversationContext } from './ConversationProvider';
import { useOrganizationContext } from './OrganizationProvider';
import { useConversationMessages } from '@/hooks/useConversationMessages';
import { useUserContext } from './UserProvider';
import { useAgentContext } from './AgentProvider';
import { useUser } from '@clerk/nextjs';

// This is a more accurate representation of what useConfiguredChat returns
export type ConfiguredChatHelpers = {
  messages: Message[];
  append: (message: Message | CreateMessage, chatRequestOptions?: CustomChatRequestOptions) => Promise<string | null | undefined>;
  reload: (chatRequestOptions?: CustomChatRequestOptions) => Promise<string | null | undefined>;
  stop: () => void;
  setMessages: (messages: Message[]) => void;
  input: string;
  setInput: (input: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, chatRequestOptions?: CustomChatRequestOptions) => Promise<void>;
  isLoading: boolean;
  error: Error | undefined;
  data?: any;
  addToolResult: (options: {
    toolCallId: string;
    result: any;
  }) => void;
};

interface ChatContextType {
  chat: ConfiguredChatHelpers;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { activeOrgId } = useOrganizationContext();
  const { handleClerkLogout } = useUserContext();
  const { user } = useUser();
  const { 
    agents,
    selectedAgentId,
  } = useAgentContext();
  const { 
    currentConversationId,
  } = useConversationContext();
  
  const { currentConversationMessages: initialMessages } = useConversationMessages({
    conversationId: currentConversationId,
    handleLogout: handleClerkLogout,
    activeOrgId,
  });

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  const chat = useConfiguredChat({
    api: '/api/agents/run',
    id: currentConversationId ?? undefined,
    initialMessages: initialMessages,
    activeOrgId: activeOrgId,
    agent: selectedAgent,
    user,
  });

  const contextValue = useMemo(() => ({
    chat,
  }), [chat]);

  return (
    <ChatContext.Provider value={contextValue}>
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