'use client';

import { useConversationMessagesQuery } from '@/hooks/useConversationMessagesQuery';
import { Agent, Conversation } from '@agent-base/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useChat } from 'ai/react';
import ChatInterface from '../chat/ChatInterface';
import { Loader2 } from 'lucide-react';

interface ConversationViewerProps {
  conversation: Conversation | null;
  agent: Agent;
  userInitials: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function ConversationViewer({
  conversation,
  agent,
  userInitials,
  isOpen,
  onOpenChange,
}: ConversationViewerProps) {
  const { messages, isLoadingMessages, messagesError } = useConversationMessagesQuery(conversation?.conversationId);

  // Create a "mock" chat object to pass to the ChatInterface
  const mockChat = useChat({
    initialMessages: messages,
  });

  if (!conversation) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Conversation Details</DialogTitle>
          <DialogDescription>
            Viewing conversation ID: {conversation.conversationId}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messagesError ? (
            <div className="p-4 text-red-500 text-sm">Error: {messagesError}</div>
          ) : (
            // @ts-ignore - We are knowingly passing a slightly mismatched type
            // for the sake of reusing the component. The core properties (messages, isLoading) are correct.
            <ChatInterface
              userInitials={userInitials}
              agentFirstName={agent.firstName}
              agentLastName={agent.lastName}
              chat={mockChat}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 