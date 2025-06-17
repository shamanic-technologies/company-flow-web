/**
 * ChatInterface Component
 * 
 * The main chat interface that combines message display, input form,
 * and manages the chat functionality using Vercel AI SDK
 * Relies on props for initial messages, loading, and error states.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from 'ai/react'; // Removed CreateMessage as it might be inferred or part of Message
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import MessageInput, { MessageInputRef } from './MessageInput';
import ThinkingIndicator from './ThinkingIndicator';
import { classifyError } from './utils/errorHandlers';
import { createIdGenerator } from 'ai';
import { CreditDataMessagePayload, isCreditDataMessage, CreditInfo } from './utils/chatUtils';
import { useChatViewEffects } from './utils/useChatViewEffects';
import { ChatErrorDisplay } from './ChatErrorDisplay';
import { ChatInitialStateDisplay } from './ChatInitialStateDisplay';
import { useConfiguredChat } from './utils/useConfiguredChat'; 
import { useDashboard } from '@/components/dashboard/context/DashboardContext'; // Import useDashboard

interface ChatInterfaceProps {
  userInitials: string;
  initialMessages?: Message[];
  agentId: string | null;
  agentFirstName: string;
  agentLastName: string;
  conversationId: string;
  isLoading?: boolean;
  error?: string | null;
}

export const ChatInterface = ({ 
  userInitials, 
  initialMessages = [],
  agentId,
  agentFirstName,
  agentLastName,
  conversationId,
  isLoading: propIsLoading = false,
  error: propError = null,
}: ChatInterfaceProps) => {
  
  const {
    activeOrgId,
    validateCredits,
    consumeCredits,
    isValidating,
    isConsuming,
    creditBalance,
    error: directErrorFromCreditsHook,
    clearError: directClearErrorFromCreditsHook,
    initialPrompt,
    setInitialPrompt,
  } = useDashboard();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<MessageInputRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [prevChatHookIsLoading, setPrevChatHookIsLoading] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false); 
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  const creditOpsForChat = {
    validateCredits,
    consumeCredits,
    isValidatingCredits: isValidating,
    creditBalance,
    creditHookError: directErrorFromCreditsHook,
    clearCreditHookError: directClearErrorFromCreditsHook,
  };

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatHookErrorFromVercel,
    append,
    reload,
    stop,
    setMessages,
    addToolResult,
    chatError,
    rawError,
    errorInfo,
    setChatError,
  } = useConfiguredChat({
    api: '/api/agents/run',
    id: conversationId,
    initialMessages: initialMessages,
    activeOrgId: activeOrgId,
    creditOps: creditOpsForChat,
  });

  useEffect(() => {
    if (initialPrompt && conversationId && append) {
      append({
        role: 'user',
        content: initialPrompt,
      });
      setInitialPrompt(null);
    }
  }, [initialPrompt, conversationId, append, setInitialPrompt]);

  useEffect(() => {
    setPrevChatHookIsLoading(isLoading);
  }, [isLoading]);

  useEffect(() => {
    if (initialMessages && Array.isArray(initialMessages)) {
        setMessages(initialMessages);
    }
    setUserHasScrolledUp(false);
    if (chatError && setChatError) setChatError(null);
    setShowErrorDetails(false);
  }, [initialMessages, setMessages, chatError, setChatError]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  useChatViewEffects({
    messages,
    messagesEndRef,
    inputRef,
    scrollAreaRef,
    prevChatIsLoading: prevChatHookIsLoading,
    chatIsLoading: isLoading, 
    propIsLoading,
    propError,
    userHasScrolledUp,
    setUserHasScrolledUp,
    scrollToBottom,
  });

  const initialStateDisplay = (
    <ChatInitialStateDisplay isLoading={propIsLoading} error={propError} />
  );
  if (propIsLoading || propError) return initialStateDisplay;

  const handleRetryFromErrorDisplay = () => {
    if (setChatError) setChatError(null);
    setShowErrorDetails(false);
    reload();
  };

  const handleDismissFromErrorDisplay = () => {
    if (setChatError) setChatError(null);
    setShowErrorDetails(false);
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-gray-900 border-none shadow-none rounded-none">
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <ChatErrorDisplay 
          chatError={chatError || directErrorFromCreditsHook}
          errorInfo={errorInfo}
          rawError={rawError}
          showErrorDetails={showErrorDetails}
          onRetry={handleRetryFromErrorDisplay}
          onShowDetails={() => setShowErrorDetails(!showErrorDetails)}
          onDismiss={handleDismissFromErrorDisplay}
        />
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full px-4 py-2">
            <div className="space-y-4">
              {messages.map((msg: Message) => (
                <ChatMessage 
                  key={msg.id} 
                  message={msg} 
                  userInitials={userInitials} 
                  agentFirstName={agentFirstName}
                  agentLastName={agentLastName}
                  append={append} 
                  addToolResult={addToolResult}
                  messages={messages}
                />
              ))}
              
              {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <ThinkingIndicator />
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex-shrink-0">
          <MessageInput
            ref={inputRef}
            input={input}
            isLoading={isLoading || isValidating}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit} 
            stop={stop}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatInterface; 