'use client';

import { useState } from 'react';
import { useLangGraphConversationMessagesQuery } from '@/hooks/langgraph/useLangGraphConversationMessagesQuery';
import { Agent, Conversation } from '@agent-base/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLangGraphStream } from '@/hooks/chat/langgraph/useLangGraphStream';
import LangGraphChatInterface from '@/components/dashboard/chat/langgraph/LangGraphChatInterface';
import { Loader2, Copy, Check } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, formatDistanceStrict } from 'date-fns';

interface LangGraphConversationViewerProps {
  conversation: Conversation | null;
  agent: Agent;
  userInitials: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function LangGraphConversationViewer({
  conversation,
  agent,
  userInitials,
  isOpen,
  onOpenChange,
}: LangGraphConversationViewerProps) {
  const { user } = useUser();
  const { messages, isLoadingMessages, messagesError } = useLangGraphConversationMessagesQuery(conversation?.conversationId);
  const [hasCopied, setHasCopied] = useState(false);

  // Use the LangGraph stream hook for the chat interface
  const langGraphChat = useLangGraphStream({
    conversationId: conversation?.conversationId ?? null,
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
            <LangGraphChatInterface
              userInitials={userInitials}
              agentFirstName={agent.firstName}
              agentLastName={agent.lastName}
              chat={langGraphChat}
              isReadOnly={true}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 