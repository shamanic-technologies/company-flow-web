/*'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAgentContext } from '@/providers/AgentProvider';
import { useConversationContext } from '@/providers/ConversationProvider';
import { useChatContext } from '@/providers/ChatProvider'; // Corrected import path
import { Message, CreateMessage } from 'ai';
*/
/**
 * Custom hook for managing the landing page prompt functionality.
 * This hook will be responsible for:
 * 1. Handling the submission of the landing prompt.
 * 2. Creating a new conversation if necessary.
 * 3. Appending the message to the chat.
 */
/*
export function useLandingPrompt() {
  const [isProcessing, setIsProcessing] = useState(false);
  const chat = useChatContext();

  const submitLandingPrompt = useCallback(async (prompt: string) => {
    // If chat is not ready, do nothing.
    if (!chat) {
      console.warn("useLandingPrompt: Chat context is not available yet.");
      return;
    }

    setIsProcessing(true);
    try {
      const message: CreateMessage = {
        role: 'user',
        content: prompt,
      };
      await chat.append(message);
    } catch (error) {
      console.error('Error submitting landing prompt:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [chat]);

  return useMemo(() => ({
    isProcessing,
    submitLandingPrompt,
  }), [isProcessing, submitLandingPrompt]);
} 
*/