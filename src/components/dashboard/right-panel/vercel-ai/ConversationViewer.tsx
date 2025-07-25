/*'use client';

import { useState } from 'react';
import { useConversationMessagesQuery } from '@/hooks/useConversationMessagesQuery';
import { Agent, Conversation } from '@agent-base/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useConfiguredChat } from '@/hooks/chat/useConfiguredChat';
import ChatInterface from '../chat/vercel-ai/ChatInterface';
import { Loader2, Copy, Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, formatDistanceStrict } from 'date-fns';

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
  const { user } = useUser();
  const { messages, isLoadingMessages, messagesError } = useConversationMessagesQuery(conversation?.conversationId);
  const [hasCopied, setHasCopied] = useState(false);

  // Create a "mock" chat object to pass to the ChatInterface
  const mockChat = useConfiguredChat({
    initialMessages: messages,
    // Provide empty stubs for functions that won't be used in this read-only view
    onFinish: () => {},
    onError: () => {},
    // Pass required props for useConfiguredChat
    id: conversation?.conversationId,
    api: '/api/mock-chat', // This won't be called, but is required by the hook
    body: {},
    agent: agent,
    user: user,
    activeOrgId: null, // This is a mock chat, so no real org is needed.
  });

  const handleCopy = () => {
    if (conversation?.conversationId) {
      navigator.clipboard.writeText(conversation.conversationId);
      setHasCopied(true);
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    }
  };

  if (!conversation) {
    return null;
  }

  const relativeTime = formatDistanceToNow(new Date(conversation.createdAt), { addSuffix: true });
  const duration = formatDistanceStrict(new Date(conversation.updatedAt), new Date(conversation.createdAt));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-row items-center justify-between pr-4 pt-4">
          <div>
            <DialogTitle>Execution Details</DialogTitle>
            <DialogDescription className="mt-1">
              Execution started {relativeTime}. Duration: {duration}.
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground">
            {hasCopied ? (
              <div className="flex items-center text-green-500">
                <span>Copied</span>
                <Check className="h-3 w-3 ml-2" />
              </div>
            ) : (
              <div className="flex items-center">
                <span>Copy ID</span>
                <Copy className="h-3 w-3 ml-2" />
              </div>
            )}
          </Button>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messagesError ? (
            <div className="p-4 text-red-500 text-sm">Error: {messagesError}</div>
          ) : (
            // We can now remove this ts-ignore because the types should match
            <ChatInterface
              userInitials={userInitials}
              agentFirstName={agent.firstName}
              agentLastName={agent.lastName}
              chat={mockChat}
              isReadOnly={true}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
*/