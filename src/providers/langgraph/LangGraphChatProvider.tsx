'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLangGraphConversationContext } from './LangGraphConversationProvider';
import { useLangGraphStream } from '../../hooks/chat/langgraph/useLangGraphStream';

export type LangGraphChatHelpers = ReturnType<typeof useLangGraphStream>;

const LangGraphChatContext = createContext<LangGraphChatHelpers | undefined>(undefined);

export function LangGraphChatProvider({ children }: { children: ReactNode }) {
  const { currentConversationId } = useLangGraphConversationContext();

  const chatHelpers = useLangGraphStream({
    conversationId: currentConversationId,
  });

  return (
    <LangGraphChatContext.Provider value={chatHelpers}>
      {children}
    </LangGraphChatContext.Provider>
  );
}

export function useLangGraphChatContext() {
  const context = useContext(LangGraphChatContext);
  if (context === undefined) {
    throw new Error('useLangGraphChatContext must be used within a LangGraphChatProvider');
  }
  return context;
} 