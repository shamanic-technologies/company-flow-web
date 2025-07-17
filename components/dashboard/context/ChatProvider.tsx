'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Message, CreateMessage } from 'ai/react';
import { useConfiguredChat, CustomChatRequestOptions } from '@/hooks/chat/useConfiguredChat';
import { useConversationContext } from './ConversationProvider';
import { useOrganizationContext } from './OrganizationProvider';
import { useCredits } from '@/hooks/useCredits';
import { useConversationMessages } from '@/hooks/useConversationMessages';
import { useUserContext } from './UserProvider';
import { usePlanInfo } from '@/hooks/usePlanInfo';
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
  chatMiddlePanel: ConfiguredChatHelpers;
  chatRightPanel: ConfiguredChatHelpers;
}

const defaultChatHelpers: ConfiguredChatHelpers = {
  messages: [],
  append: async () => null,
  reload: async () => null,
  stop: () => {},
  setMessages: () => {},
  input: '',
  setInput: () => {},
  handleInputChange: () => {},
  handleSubmit: async () => {},
  isLoading: false,
  error: undefined,
  data: undefined,
  addToolResult: () => {},
};

export const ChatContext = createContext<ChatContextType>({
  chatMiddlePanel: defaultChatHelpers,
  chatRightPanel: defaultChatHelpers,
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const { activeOrgId } = useOrganizationContext();
  const { handleClerkLogout } = useUserContext();
  const { user } = useUser();
  const { 
    agents,
    selectedAgentIdMiddlePanel,
    selectedAgentIdRightPanel
  } = useAgentContext();
  const { 
    currentConversationIdMiddlePanel, 
    currentConversationIdRightPanel,
  } = useConversationContext();
  
  const { fetch: fetchPlanInfo } = usePlanInfo({ activeOrgId });
  const creditsHook = useCredits({ activeOrgId });

  const { currentConversationMessages: initialMessagesMiddlePanel } = useConversationMessages({
    conversationId: currentConversationIdMiddlePanel,
    handleLogout: handleClerkLogout,
    activeOrgId,
  });

  const { currentConversationMessages: initialMessagesRightPanel } = useConversationMessages({
    conversationId: currentConversationIdRightPanel,
    handleLogout: handleClerkLogout,
    activeOrgId,
  });

  const creditOps = {
    validateCredits: creditsHook.validateCredits,
    consumeCredits: creditsHook.consumeCredits,
    isValidatingCredits: creditsHook.isValidating,
    creditBalance: creditsHook.creditBalance,
    creditHookError: creditsHook.error,
    clearCreditHookError: creditsHook.clearError,
    fetchPlanInfo,
  };

  const selectedAgentMiddlePanel = agents.find(agent => agent.id === selectedAgentIdMiddlePanel);
  const selectedAgentRightPanel = agents.find(agent => agent.id === selectedAgentIdRightPanel);

  const chatMiddlePanel = useConfiguredChat({
    api: '/api/agents/run',
    id: currentConversationIdMiddlePanel ?? undefined,
    initialMessages: initialMessagesMiddlePanel,
    activeOrgId: activeOrgId,
    creditOps: creditOps,
    agent: selectedAgentMiddlePanel,
    user,
  });

  const chatRightPanel = useConfiguredChat({
    api: '/api/agents/run',
    id: currentConversationIdRightPanel ?? undefined,
    initialMessages: initialMessagesRightPanel,
    activeOrgId: activeOrgId,
    creditOps: creditOps,
    agent: selectedAgentRightPanel,
    user,
  });

  const contextValue = useMemo(() => ({
    chatMiddlePanel,
    chatRightPanel,
  }), [chatMiddlePanel, chatRightPanel]);

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