import { useEffect, RefObject } from 'react';
import { Message } from 'ai/react';
import { MessageInputRef } from '../MessageInput'; // Corrected path

interface UseChatViewEffectsParams {
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<MessageInputRef>;
  scrollAreaRef: RefObject<HTMLDivElement>;
  prevChatIsLoading: boolean;
  chatIsLoading: boolean;
  propIsLoading?: boolean;
  propError?: string | null;
  userHasScrolledUp: boolean;
  setUserHasScrolledUp: (value: boolean) => void;
  scrollToBottom: () => void;
}

/**
 * Custom hook to manage chat view side effects like auto-scrolling and input focusing.
 */
export function useChatViewEffects({
  messages,
  messagesEndRef,
  inputRef,
  scrollAreaRef,
  prevChatIsLoading,
  chatIsLoading,
  propIsLoading,
  propError,
  userHasScrolledUp,
  setUserHasScrolledUp,
  scrollToBottom,
}: UseChatViewEffectsParams) {

  // Effect to imperatively attach scroll listener to the viewport inside ScrollArea
  useEffect(() => {
    const scrollAreaElement = scrollAreaRef.current;
    const viewportElement = scrollAreaElement?.querySelector('[data-radix-scroll-area-viewport]');

    if (viewportElement) {
      const handleScroll = (event: Event) => {
        const target = event.target as HTMLDivElement;
        if (target) {
          const { scrollTop, scrollHeight, clientHeight } = target;
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
          setUserHasScrolledUp(!isAtBottom);
        }
      };
      viewportElement.addEventListener('scroll', handleScroll);
      return () => {
        viewportElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollAreaRef, setUserHasScrolledUp]);

  // Scroll to bottom automatically only if the user hasn't scrolled up manually
  useEffect(() => {
    if (!userHasScrolledUp) {
      scrollToBottom();
    }
  }, [messages, userHasScrolledUp, scrollToBottom]);
  
  // Focus input field when AI stops generating
  useEffect(() => {
    if (prevChatIsLoading && !chatIsLoading) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [chatIsLoading, prevChatIsLoading, inputRef]);
  
  // Auto-focus input on first load 
  useEffect(() => {
    if (!propIsLoading && !propError) {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 500); 
    }
  }, [propIsLoading, propError, inputRef]);
} 