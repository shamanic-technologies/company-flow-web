/**
 * Custom hook that wraps Vercel AI SDK useChat with credits management
 * Validates credits before sending messages and consumes credits after completion
 */
import { useChat, UseChatOptions, Message, CreateMessage } from 'ai/react';
import { useCallback, useRef } from 'react';
import { useCredits } from './useCredits';

interface CreditInfo {
  inputTokens?: number;
  outputTokens?: number;
  totalCredits?: number;
  operationType?: string;
}

interface UseChatWithCreditsOptions extends Omit<UseChatOptions, 'onFinish'> {
  // Custom onFinish that receives credit info
  onFinish?: (message: Message, options: { finishReason: string, creditInfo?: CreditInfo }) => void;
}

export function useChatWithCredits(options: UseChatWithCreditsOptions = {}) {
  const { validateCredits, consumeCredits, isValidating, creditBalance, error: creditError } = useCredits();
  const conversationIdRef = useRef<string | null>(null);

  // Original useChat with modified onFinish
  const chatHelpers = useChat({
    ...options,
    onFinish: async (message, { finishReason }) => {
      // Extract credit info from the message (you'll need to adapt this based on your response format)
      const creditInfo = extractCreditInfoFromMessage(message);
      
      // Consume credits after completion
      if (creditInfo && conversationIdRef.current) {
        const success = await consumeCredits(creditInfo, conversationIdRef.current);
        if (!success) {
          console.error('Failed to update credit balance');
        }
      }
      
      // Call original onFinish if provided
      if (options.onFinish) {
        options.onFinish(message, { finishReason, creditInfo: creditInfo || undefined });
      }
    },
  });

  // Enhanced handleSubmit with credit validation
  const handleSubmitWithCredits = useCallback(async (
    event?: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: {
      data?: Record<string, any>;
      allowEmptySubmit?: boolean;
      body?: object;
    }
  ) => {
    event?.preventDefault();

    // Store conversation ID for credit consumption
    conversationIdRef.current = chatHelpers.messages[0]?.id || options.id || null;

    // Validate credits before proceeding
    const hasCredits = await validateCredits(1); // Estimate 1 credit for now
    
    if (!hasCredits) {
      console.error('Insufficient credits to send message');
      alert('Insufficient credits. Please upgrade your plan.');
      return;
    }

    // Proceed with original handleSubmit
    return chatHelpers.handleSubmit(event, chatRequestOptions);
  }, [chatHelpers.handleSubmit, validateCredits, chatHelpers.messages, options.id]);

  // Enhanced append with credit validation
  const appendWithCredits = useCallback(async (
    message: Message | CreateMessage,
    chatRequestOptions?: {
      data?: Record<string, any>;
      body?: object;
    }
  ) => {
    // Store conversation ID for credit consumption
    conversationIdRef.current = chatHelpers.messages[0]?.id || options.id || null;

    // Validate credits before proceeding
    const hasCredits = await validateCredits(1);
    
    if (!hasCredits) {
      console.error('Insufficient credits to send message');
      alert('Insufficient credits. Please upgrade your plan.');
      return;
    }

    // Proceed with original append
    return chatHelpers.append(message, chatRequestOptions);
  }, [chatHelpers.append, validateCredits, chatHelpers.messages, options.id]);

  return {
    ...chatHelpers,
    // Override with credit-aware versions
    handleSubmit: handleSubmitWithCredits,
    append: appendWithCredits,
    // Credit-specific state
    isValidatingCredits: isValidating,
    creditBalance,
    creditError,
  };
}

/**
 * Extract credit information from the AI response message
 * You'll need to adapt this based on your actual response format
 */
function extractCreditInfoFromMessage(message: Message): CreditInfo | null {
  try {
    // Option 1: Parse from message content if it contains credit info
    const content = message.content;
    if (typeof content === 'string') {
      // Look for patterns like "Tokens used: input=100, output=50"
      const tokenMatch = content.match(/tokens used.*?input[=:]?\s*(\d+).*?output[=:]?\s*(\d+)/i);
      if (tokenMatch) {
        return {
          inputTokens: parseInt(tokenMatch[1], 10),
          outputTokens: parseInt(tokenMatch[2], 10),
          operationType: 'chat'
        };
      }
    }

    // Option 2: Default estimation based on message length
    const estimatedInputTokens = Math.ceil((message.content?.length || 0) / 4); // Rough estimation
    const estimatedOutputTokens = Math.ceil((message.content?.length || 0) / 4);
    
    return {
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
      operationType: 'chat'
    };

  } catch (error) {
    console.error('[extractCreditInfoFromMessage] Error:', error);
    // Return default credit usage if parsing fails
    return {
      totalCredits: 1,
      operationType: 'chat'
    };
  }
} 