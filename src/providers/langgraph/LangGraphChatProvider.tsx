'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useConversationContext } from '../ConversationProvider';
import { useLangGraphStream } from '@/hooks/chat/useLangGraphStream';

export type LangGraphChatHelpers = ReturnType<typeof useLangGraphStream>;

const LangGraphChatContext = createContext<LangGraphChatHelpers | null>(null);

export function LangGraphChatProvider({ children }: { children: ReactNode }) {
  const { currentConversationId } = useConversationContext();

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
  if (context === null) {
    throw new Error('useLangGraphChatContext must be used within a LangGraphChatProvider');
  }
  return context;
} 