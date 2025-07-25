/**
 * LangGraphChatInterface Component
 * 
 * The main chat interface that combines message display, input form,
 * and manages the chat functionality using the LangGraph SDK.
 */

'use client';

import { useRef } from 'react';
import { Message } from "@langchain/langgraph-sdk";
import { ScrollArea } from '../../../ui/scroll-area';
import { Card, CardContent } from '../../../ui/card';
import LangGraphChatMessage from './LangGraphChatMessage';
import LangGraphMessageInput, { LangGraphMessageInputRef } from './LangGraphMessageInput';
import LangGraphThinkingIndicator from './LangGraphThinkingIndicator';
import { LangGraphChatErrorDisplay } from './LangGraphChatErrorDisplay';
import { useLangGraphChatViewEffects } from '../../../../hooks/chat/langgraph/useLangGraphChatViewEffects';
import { LangGraphChatHelpers } from '../../../../providers/langgraph/LangGraphChatProvider';

interface LangGraphChatInterfaceProps {
  userInitials: string;
  agentFirstName: string;
  agentLastName: string;
  chat: LangGraphChatHelpers;
  isReadOnly?: boolean;
}

export default function LangGraphChatInterface({ 
  userInitials, 
  agentFirstName,
  agentLastName,
  chat,
  isReadOnly = false,
}: LangGraphChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<LangGraphMessageInputRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
  } = chat;

  useLangGraphChatViewEffects({
    messages,
    messagesEndRef,
    inputRef,
    scrollAreaRef,
    chatIsLoading: isLoading, 
  });

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-background border-none shadow-none rounded-none">
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <LangGraphChatErrorDisplay error={error as Error | null} />
        <div className="flex-1 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-2">
            <div className="space-y-4">
              {messages.map((msg: Message, index: number) => {
                console.log('Rendering message with key:', msg.id);
                const isLastMessage = index === messages.length - 1;
                const isStreaming = isLastMessage && msg.type === 'ai' && isLoading;

                return (
                <div key={index}>
                  <LangGraphChatMessage
                    message={msg}
                    userInitials={userInitials} 
                    agentFirstName={agentFirstName}
                    agentLastName={agentLastName}
                    isStreaming={isStreaming}
                  />
                </div>
                );
              })}
              
              {(() => {
                const shouldShowThinking = isLoading && messages.length > 0 && messages[messages.length - 1].type === 'human';
                return shouldShowThinking ? <LangGraphThinkingIndicator key="thinking-indicator" /> : null;
              })()}
              
              <div key="messages-end" ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex-shrink-0">
          {!isReadOnly && (
            <LangGraphMessageInput
              ref={inputRef}
              input={input}
              isLoading={isLoading}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 