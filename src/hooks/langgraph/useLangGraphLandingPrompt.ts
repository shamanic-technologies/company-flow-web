'use client';

import { useCallback, useMemo } from 'react';
import { useLangGraphChatContext } from '../../providers/langgraph/LangGraphChatProvider';

/**
 * Custom hook for managing the landing page prompt functionality with LangGraph.
 */
export function useLangGraphLandingPrompt() {
  const chat = useLangGraphChatContext();

  const submitLandingPrompt = useCallback(async (prompt: string) => {
    if (!chat || !chat.handleSubmit) {
      console.warn("useLangGraphLandingPrompt: Chat context is not available yet.");
      return;
    }
    
    // The handleSubmit function from useStream is designed to be called from a form's onSubmit event.
    // We can create a mock event to call it programmatically.
    const mockEvent = {
      preventDefault: () => {},
      target: {
        elements: {
          message: {
            value: prompt,
          },
        },
      },
    } as unknown as React.FormEvent<HTMLFormElement>;

    chat.handleSubmit(mockEvent);
    
  }, [chat]);

  return useMemo(() => ({
    // We get the processing state directly from the chat context.
    isProcessing: chat?.isLoading ?? false,
    submitLandingPrompt,
  }), [chat?.isLoading, submitLandingPrompt]);
} 