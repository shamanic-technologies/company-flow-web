'use client';

import { useEffect, useState, useRef } from 'react';
import { useOrganizations } from './useOrganizations';
import { useChatContext } from '@/providers/ChatProvider';
import { useReadinessContext } from '@/providers/ReadinessProvider';

const LANDING_PAGE_MESSAGE_KEY = 'landing_page_message';

/**
 * Custom hook to manage the flow when a user arrives from the landing page with a prompt.
 * It waits for the entire system to be ready, then creates an organization and sends the message.
 * @returns {boolean} A flag indicating if the landing prompt is currently being processed.
 */
export function useLandingPrompt(): { isLandingPromptProcessing: boolean } {
  const { createPersonalOrganization } = useOrganizations();
  const { chat } = useChatContext();
  const { isSystemReady } = useReadinessContext();
  const [promptToProcess, setPromptToProcess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const didRunOnce = useRef(false);

  // Stage 1: Check localStorage on mount and store the prompt in state.
  useEffect(() => {
    // This check should only run once.
    if (didRunOnce.current) return;
    didRunOnce.current = true;
    
    const prompt = localStorage.getItem(LANDING_PAGE_MESSAGE_KEY);
    if (prompt) {
      setPromptToProcess(prompt);
      localStorage.removeItem(LANDING_PAGE_MESSAGE_KEY);
    }
  }, []);

  // Stage 2: Wait for the system to be fully ready AND for a prompt to be staged.
  useEffect(() => {
    if (promptToProcess && isSystemReady && !isProcessing) {
      // Set a lock to prevent this from running twice due to re-renders.
      setIsProcessing(true);

      const processPrompt = async () => {
        try {
          console.log('[useLandingPrompt] System is ready. Creating organization and sending message...');
          
          // First, create the new organization.
          await createPersonalOrganization();

          // Clear the prompt from state after processing
          setPromptToProcess(null);

        } catch (error) {
          console.error('[useLandingPrompt] Error processing landing prompt:', error);
          setPromptToProcess(null); // Clear on error to prevent loops
        } finally {
          // Release the lock
          setIsProcessing(false);
        }
      };

      processPrompt();

      // After creation, the other hooks will automatically create the agent and conversation.
      // Because we waited for `isSystemReady`, we know the `chatRightPanel` is now valid
      // for a *new* conversation that was just created.
      chat.append({
        role: 'user',
        content: promptToProcess,
      });
    }
    // Dependency array ensures this effect runs when the system becomes ready or when a prompt is found.
  }, [promptToProcess, isSystemReady, createPersonalOrganization, chat, isProcessing]);

  return { isLandingPromptProcessing: isProcessing };
} 