/**
 * ChatInterface Component
 * 
 * The main chat interface that combines message display, input form,
 * and manages the chat functionality using Vercel AI SDK
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChat, Message } from 'ai/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, XCircle } from 'lucide-react';
import ChatMessage from './ChatMessage';
import MessageInput, { MessageInputRef } from './MessageInput';
import ThinkingIndicator from './ThinkingIndicator';
import { processErrorMessage, classifyError, handleToolCallError } from './utils/errorHandlers';
import { createIdGenerator } from 'ai';

interface ChatInterfaceProps {
  authToken: string;
  userInitials: string;
  initialMessages?: Message[];
  agentId: string;
  conversationId: string;
}

export const ChatInterface = ({ 
  authToken, 
  userInitials, 
  initialMessages = [],
  agentId,
  conversationId
}: ChatInterfaceProps) => {
  // Reference to the messages container bottom for auto-scrolling target
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Reference to the input field for auto-focusing
  const inputRef = useRef<MessageInputRef>(null);
  // Reference to the ScrollArea component to access the viewport
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Previous loading state to detect changes
  const [prevIsLoading, setPrevIsLoading] = useState(false);
  // Error state to display error messages to users
  const [error, setError] = useState<string | null>(null);
  // State to toggle showing technical error details
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  // Raw error object for debugging
  const [rawError, setRawError] = useState<any>(null);
  // Error classification details
  const [errorInfo, setErrorInfo] = useState<{code: string, details?: string} | null>(null);
  // State to track if the user has manually scrolled away from the bottom
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  
  // Initialize chat using Vercel AI SDK
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading: chatIsLoading, 
    stop,
    reload,
    setMessages,
    append,
    addToolResult
  } = useChat({
    id: conversationId, // Defines the Chat ID for Vercel AI SDK
    // Use the agents/run API route
    api: '/api/agents/run',
    // Include authorization header with user token from localStorage
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    // Pass conversation_id in the body
    // body: {
    //   conversation_id: conversationId
    // },
    // Use the passed initialMessages prop
    initialMessages: initialMessages,
    // Enable multi-step tool usage
    maxSteps: 25, // Allow for multi-step tool usage
    // Throttle message updates for better rendering performance
    experimental_throttle: 50,
    sendExtraMessageFields: true, // send id and createdAt for each message
    // only send the last message to the server:
    experimental_prepareRequestBody({ messages, id }) {
      return { message: messages[messages.length - 1], id };
    },
    // id format for client-side messages:
    generateId: createIdGenerator({
      prefix: 'msgc',
      size: 16,
    }),
      // Add onError handler to update local error state
    onError: (err) => {
        console.error("[useChat Error]:", err);
        // Use classifyError to get the structured error object
        const classifiedError = classifyError(err);
        // Set state using properties from the classified error object
        setError(classifiedError.message);
        setRawError(err); // Keep the original error for raw details display
        setErrorInfo({ code: classifiedError.code, details: classifiedError.details });
        setShowErrorDetails(false); // Reset detail view on new error
    }
  });
  
  // Scroll to the bottom of the chat messages smoothly
  // Use useCallback to prevent recreating the function on every render
  const scrollToBottom = useCallback(() => {
    // Use requestAnimationFrame to ensure scroll happens after render and layout calculation
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []); // No dependencies, function itself doesn't change

  // Effect to imperatively attach scroll listener to the viewport inside ScrollArea
  useEffect(() => {
    const scrollAreaElement = scrollAreaRef.current;
    // Radix UI (used by Shadcn ScrollArea) typically renders the viewport with this attribute
    const viewportElement = scrollAreaElement?.querySelector('[data-radix-scroll-area-viewport]');

    if (viewportElement) {
      // Define the scroll handler
      const handleScroll = (event: Event) => {
        const target = event.target as HTMLDivElement;
        if (target) {
          const { scrollTop, scrollHeight, clientHeight } = target;
          // Check if the user is scrolled near the bottom (within a 10px threshold)
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
          // Update the state based on whether the user is near the bottom
          // If they are at the bottom, userHasScrolledUp becomes false.
          // If they scroll up, userHasScrolledUp becomes true.
          setUserHasScrolledUp(!isAtBottom);
        }
      };

      // Attach the event listener
      viewportElement.addEventListener('scroll', handleScroll);

      // Cleanup function to remove the listener when the component unmounts
      return () => {
        viewportElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // Scroll to bottom automatically only if the user hasn't scrolled up manually
  useEffect(() => {
    // Only trigger auto-scroll if the user is considered "at the bottom"
    if (!userHasScrolledUp) {
      scrollToBottom();
    }
    // This effect depends on new messages arriving OR the user scrolling back to the bottom
  }, [messages, userHasScrolledUp, scrollToBottom]); // Add userHasScrolledUp and scrollToBottom
  
  // Focus input field when AI stops generating
  useEffect(() => {
    // If we were loading before but aren't now, focus the input
    if (prevIsLoading && !chatIsLoading) {
      // Short timeout to ensure UI has updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
    
    // Update previous loading state
    setPrevIsLoading(chatIsLoading);
  }, [chatIsLoading, prevIsLoading]);
  
  // Auto-focus input on first load 
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
  }, []);

  return (
    <Card className="flex-1 flex flex-col overflow-hidden bg-gray-900 border-gray-800">
      <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
        {/* Error message display */}
        {error && (
          <div className="mx-4 mt-3 mb-1 flex flex-col bg-red-500/10 border border-red-500/30 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-red-300">{error}</p>
                {errorInfo?.details && (
                  <p className="text-xs text-red-400/70 mt-1">{errorInfo.details}</p>
                )}
                <div className="flex gap-2 mt-2">
                  <button 
                    className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
                    onClick={() => {
                      setError(null);
                      setRawError(null);
                      setErrorInfo(null);
                      setShowErrorDetails(false);
                      reload();
                    }}
                  >
                    Retry
                  </button>
                  <button 
                    className="text-xs bg-gray-700/50 hover:bg-gray-700/70 px-2 py-1 rounded transition-colors"
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                  >
                    {showErrorDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                  <button 
                    className="text-xs bg-gray-700/50 hover:bg-gray-700/70 px-2 py-1 rounded transition-colors"
                    onClick={() => {
                      setError(null);
                      setRawError(null);
                      setErrorInfo(null);
                      setShowErrorDetails(false);
                    }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button 
                className="text-red-400 hover:text-red-300"
                onClick={() => {
                  setError(null);
                  setRawError(null);
                  setErrorInfo(null);
                  setShowErrorDetails(false);
                }}
              >
                <XCircle size={14} />
              </button>
            </div>
            
            {/* Technical error details */}
            {showErrorDetails && rawError && (
              <div className="mt-3 pt-2 border-t border-red-500/30">
                <p className="text-xs text-red-300 mb-1">Technical Details:</p>
                <pre className="text-xs bg-gray-900/80 p-2 rounded overflow-auto max-h-40 text-red-200 font-mono whitespace-pre-wrap">
                  {JSON.stringify(rawError, null, 2) || 'No additional details available'}
                </pre>
                <p className="text-xs text-red-300 mt-2">Error Code: {errorInfo?.code || 'unknown'}</p>
                {rawError.stack && (
                  <>
                    <p className="text-xs text-red-300 mt-2">Stack Trace:</p>
                    <pre className="text-xs bg-gray-900/80 p-2 rounded overflow-auto max-h-40 text-red-200 font-mono whitespace-pre-wrap">
                      {rawError.stack}
                    </pre>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Messages container - This should be scrollable */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea
            ref={scrollAreaRef}
            className="h-full px-4 py-2"
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message} 
                  userInitials={userInitials} 
                  append={append}
                  addToolResult={addToolResult}
                  messages={messages}
                />
              ))}
              
              {/* AI Thinking indicator */}
              {chatIsLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <ThinkingIndicator />
              )}
              
              {/* Empty div for scrolling to bottom */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        {/* Input form - This should be fixed at the bottom */}
        <div className="flex-shrink-0">
          <MessageInput
            ref={inputRef}
            input={input}
            isLoading={chatIsLoading}
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