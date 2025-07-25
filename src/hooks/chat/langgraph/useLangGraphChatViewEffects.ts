import { useEffect, RefObject, useState, useCallback } from 'react';
import { Message } from '@langchain/langgraph-sdk';
import { LangGraphMessageInputRef } from '../../../components/dashboard/chat/langgraph/LangGraphMessageInput';

interface UseLangGraphChatViewEffectsParams {
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement>;
  inputRef: RefObject<LangGraphMessageInputRef>;
  scrollAreaRef: RefObject<HTMLDivElement>;
  chatIsLoading: boolean;
}

/**
 * Custom hook to manage chat view side effects like auto-scrolling and input focusing for LangGraph.
 */
export function useLangGraphChatViewEffects({
  messages,
  messagesEndRef,
  inputRef,
  scrollAreaRef,
  chatIsLoading,
}: UseLangGraphChatViewEffectsParams) {
  const [userHasScrolledUp, setUserHasScrolledUp] = useState(false);
  const [prevChatIsLoading, setPrevChatIsLoading] = useState(false);

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

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

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

  useEffect(() => {
    setPrevChatIsLoading(chatIsLoading);
  }, [chatIsLoading]);
  
  // Auto-focus input on first load
  useEffect(() => {
    setTimeout(() => {
        inputRef.current?.focus();
    }, 500); 
  }, [inputRef]);
} 