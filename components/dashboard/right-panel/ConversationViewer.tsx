'use client';

import { useConversationMessagesQuery } from '@/hooks/useConversationMessagesQuery';
import { Agent, Conversation } from '@agent-base/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import ChatInterface from '../chat/ChatInterface';
import { UseChatHelpers } from 'ai/react';

interface ConversationViewerProps {
  conversation: Conversation | null;
  agent: Agent;
  userInitials: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

// This is a mock chat object that satisfies the ChatInterface props
// but is configured for read-only viewing.
const createReadOnlyChatState = (
    messages: any[], 
    isLoading: boolean, 
    error: string | null,
    agent: Agent | null
): any => ({
    messages,
    isLoading,
    error: error ? new Error(error) : undefined,
    chatAgent: agent,
    // Add dummy implementations for all other required functions/properties
    input: '',
    handleInputChange: () => {},
    handleSubmit: () => {},
    append: async () => null,
    reload: () => {},
    stop: () => {},
    setMessages: () => {},
    setInput: () => {},
    data: undefined,
});


export default function ConversationViewer({
  conversation,
  agent,
  userInitials,
  isOpen,
  onOpenChange,
}: ConversationViewerProps) {
  const { messages, isLoadingMessages, messagesError } = useConversationMessagesQuery(conversation?.conversationId);

  if (!conversation) {
    return null;
  }

  const readOnlyChat = createReadOnlyChatState(messages, isLoadingMessages, messagesError, agent);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Conversation Details</DialogTitle>
          <DialogDescription>
            Viewing conversation ID: {conversation.conversationId}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
            <ChatInterface
                chat={readOnlyChat}
                agentFirstName={agent.firstName}
                agentLastName={agent.lastName}
                userInitials={userInitials}
            />
        </div>
      </DialogContent>
    </Dialog>
  );
} 