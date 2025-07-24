/**
 * ChatInterface Component
 * 
 * The main chat interface that combines message display, input form,
 * and manages the chat functionality using Vercel AI SDK
 * Relies on props for initial messages, loading, and error states.
 */

'use client';

import { useRef, useCallback, useState } from 'react';
import { Message } from 'ai/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import ChatMessage from './ChatMessage';
import MessageInput, { MessageInputRef } from './MessageInput';
import ThinkingIndicator from './ThinkingIndicator';
import { useChatViewEffects } from '@/hooks/chat/useChatViewEffects';
import { ChatErrorDisplay } from './ChatErrorDisplay';
import { ConfiguredChatHelpers } from '../context/ChatProvider';

interface ChatInterfaceProps {
  userInitials: string;
  agentFirstName: string;
  agentLastName: string;
  chat: ConfiguredChatHelpers;
  isReadOnly?: boolean;
}

export default function ChatInterface({ 
  userInitials, 
  agentFirstName,
  agentLastName,
  chat,
  isReadOnly = false,
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<MessageInputRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatError,
    append,
    reload,
    stop,
    addToolResult,
    data,
  } = chat;

  console.log('ChatInterface received handleSubmit:', handleSubmit.toString());

  useChatViewEffects({
    messages,
    messagesEndRef,
    inputRef,
    scrollAreaRef,
    chatIsLoading: isLoading, 
  });

  const handleRetry = useCallback(() => {
    reload();
  }, [reload]);

  const handleDismiss = useCallback(() => {
    // A more robust solution might involve a `clearError` function from the hook
    setShowErrorDetails(false); 
  }, []);

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-background border-none shadow-none rounded-none">
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <ChatErrorDisplay 
          chatError={chatError?.message ?? null}
          errorInfo={data?.errorInfo}
          rawError={chatError}
          showErrorDetails={showErrorDetails}
          onRetry={handleRetry}
          onShowDetails={() => setShowErrorDetails(!showErrorDetails)}
          onDismiss={handleDismiss}
        />
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-2">
            <div className="space-y-4">
              {messages.map((msg: Message, index: number) => {
                const isLastMessage = index === messages.length - 1;
                // A message is streaming if it's the last one, from the assistant, and we are in a loading state.
                const isStreaming = isLastMessage && msg.role === 'assistant' && isLoading;

                return (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  userInitials={userInitials} 
                  agentFirstName={agentFirstName}
                  agentLastName={agentLastName}
                  append={append} 
                  addToolResult={addToolResult}
                  messages={messages}
                    isStreaming={isStreaming}
                />
                );
              })}
              
              {(() => {
                const shouldShowThinking = isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user';
                console.log('ThinkingIndicator condition:', {
                  isLoading,
                  messagesLength: messages.length,
                  lastMessageRole: messages[messages.length - 1]?.role,
                  shouldShowThinking
                });
                return shouldShowThinking ? <ThinkingIndicator key="thinking-indicator" /> : null;
              })()}
              
              <div key="messages-end" ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex-shrink-0">
          {!isReadOnly && (
            <MessageInput
              ref={inputRef}
              input={input}
              isLoading={isLoading}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit} 
              stop={stop}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 