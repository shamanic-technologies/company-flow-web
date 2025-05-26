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
import { useCredits } from '@/hooks/useCredits';
import { CreditDataMessagePayload, isCreditDataMessage, CreditInfo } from './utils/chatUtils';
import { useChatViewEffects } from './utils/useChatViewEffects';
import { ChatErrorDisplay } from './ChatErrorDisplay';
import { ChatInitialStateDisplay } from './ChatInitialStateDisplay';
import { useConfiguredChat } from './utils/useConfiguredChat'; 

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<MessageInputRef>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [prevChatHookIsLoading, setPrevChatHookIsLoading] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false); 
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatHookError,
    append,
    reload,
    stop,
    setMessages,
    addToolResult,
    isValidatingCredits,
    creditBalance,
    creditHookError,
    clearCreditHookError,
    chatError,
    rawError,
    errorInfo,
    setChatError,
  } = useConfiguredChat({
    api: '/api/agents/run',
    id: conversationId,
    initialMessages: initialMessages,
  });

  // Effect to update prevChatHookIsLoading for useChatViewEffects dependency
  useEffect(() => {
    setPrevChatHookIsLoading(isLoading);
  }, [isLoading]);

  // Sync initialMessages from props with the chat hook's messages state
  useEffect(() => {
    if (initialMessages) {
        setMessages(initialMessages);
    }
    setUserHasScrolledUp(false); // Reset scroll when conversation/messages change
    if (chatError) setChatError(null); // Clear previous errors from the hook if messages are reloaded
    setShowErrorDetails(false); // Reset error detail view
  }, [initialMessages, setMessages, chatError, setChatError]); // Added chatError and setChatError as deps

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
    prevChatIsLoading: prevChatHookIsLoading, // Use renamed state
    chatIsLoading: isLoading, 
    propIsLoading,
    propError,
    userHasScrolledUp,
    setUserHasScrolledUp,
    scrollToBottom,
  });

  // Display initial loading or error screens based on props
  const initialStateDisplay = (
    <ChatInitialStateDisplay isLoading={propIsLoading} error={propError} />
  );
  if (propIsLoading || propError) return initialStateDisplay;

  // Handler for the ChatErrorDisplay component to retry actions
  const handleRetryFromErrorDisplay = () => {
    if (setChatError) setChatError(null); // Clear error in useConfiguredChat state
    setShowErrorDetails(false);
    reload(); // Attempt to reload the chat state
  };

  // Handler for dismissing errors from ChatErrorDisplay
  const handleDismissFromErrorDisplay = () => {
    if (setChatError) setChatError(null); // Clear error in useConfiguredChat state
    setShowErrorDetails(false);
  };

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-gray-900 border-none shadow-none rounded-none">
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        <ChatErrorDisplay 
          chatError={chatError} 
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
              {messages.map((msg: Message) => ( // Explicitly type msg as Message
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
            isLoading={isLoading || isValidatingCredits}
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