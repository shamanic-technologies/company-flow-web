import { useChat, type CreateMessage, type Message, type UseChatOptions } from 'ai/react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { type JSONValue } from 'ai';
import { CreditInfo, CreditDataMessagePayload, isCreditDataMessage } from '@/components/dashboard/chat/utils/chatUtils';
import { createIdGenerator } from 'ai';
import { 
  AgentBaseCreditStreamPayload, 
  AgentBaseDeductCreditRequest,
  AgentBaseCreditConsumptionItem
} from '@agent-base/types';
import { CreditBalance } from '@/types/credit';
import { usePlanInfo } from '@/hooks/usePlanInfo';
import { useOrganization } from '@clerk/nextjs';

/**
 * @file useConfiguredChat.ts
 * @description Custom hook to configure and wrap Vercel AI SDK's useChat with credit validation and consumption.
 */

// Props for the credit functionalities needed by this hook
interface CreditFunctionsAndState {
  validateCredits: (estimatedCredits?: number) => Promise<boolean>;
  consumeCredits: (totalAmountInUSDCents: number, conversationId: string) => Promise<boolean>;
  isValidatingCredits: boolean;
  creditBalance: CreditBalance | null;
  creditHookError: string | null;
  clearCreditHookError: () => void;
  fetchPlanInfo: () => Promise<void>;
}

// Extend UseChatOptions to include activeOrgId and credit functions/state
interface ConfiguredChatOptions extends UseChatOptions {
  activeOrgId: string | null | undefined;
  creditOps: CreditFunctionsAndState;
}

// --- Type Definitions ---
export interface CustomChatRequestOptions extends UseChatOptions {
  agentId?: string;
  activeOrgId?: string;
}

/**
 * A custom hook that configures and wraps the Vercel AI SDK's useChat hook 
 * with upfront credit validation and downstream credit consumption.
 * @param {ConfiguredChatOptions} params - Options for the useChat hook, including activeOrgId and credit operations.
 * @returns {object} Enhanced chat helpers and credit-related states/functions.
 */
export function useConfiguredChat(params: ConfiguredChatOptions) {
  const { 
    onFinish: callerOnFinish, 
    onError: callerOnError,   
    id: conversationIdFromParams, 
    api: apiFromParams, 
    streamProtocol: streamProtocolFromParams,
    activeOrgId, 
    creditOps,
    ...restOfParams 
  } = params;

  const { organization } = useOrganization();

  const { 
    validateCredits, 
    consumeCredits,
    isValidatingCredits, 
    creditBalance,
    creditHookError,
    clearCreditHookError,
    fetchPlanInfo,
  } = creditOps;

  const [lastProcessedTransactionId, setLastProcessedTransactionId] = useState<string | null>(null);

  // State for chat-specific errors that might occur during send/receive
  const [chatError, setChatError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<any>(null); // To store raw error object
  const [errorInfo, setErrorInfo] = useState<{code: string, details?: string} | null>(null);

  /**
   * Prepares the request body for the chat API.
   * @param {object} params - Parameters including messages, id, and data.
   * @param {Message[]} params.messages - Array of messages.
   * @param {string} [params.id] - Conversation ID.
   * @param {Record<string, string>} [params.data] - Additional data.
   * @returns {object} The request body.
   */
  const prepareRequestBody = ({ messages, id, data }: {
    messages: Message[]; 
    id?: string; 
    data?: Record<string, string>; 
  }) => {
    if (messages.length === 0) {
      throw new Error("Attempted to send a request with no messages.");
    }
    // Send the entire message history, not just the last message.
    return { messages, id, ...data }; 
  };

  const chatHelpers = useChat({
    ...restOfParams, 
    id: conversationIdFromParams, 
    api: apiFromParams,
    streamProtocol: streamProtocolFromParams, 
    experimental_prepareRequestBody: prepareRequestBody,
    onToolCall: ({ toolCall }) => {
      if (toolCall.toolName === 'get_active_organization') {
        if (organization) {
          return {
            toolCallId: toolCall.toolCallId,
            result: {
              id: organization.id,
              name: organization.name,
              slug: organization.slug,
              imageUrl: organization.imageUrl,
              createdAt: organization.createdAt,
              updatedAt: organization.updatedAt,
            },
          };
        } else {
          return {
            toolCallId: toolCall.toolCallId,
            result: { error: "User is not currently in an active organization." },
          };
        }
      }
    },
    onFinish: callerOnFinish, // Pass through original onFinish
    onError: (err) => { 
      console.error("[useConfiguredChat Error]:", err);
      setChatError(typeof err === 'string' ? err : (err as Error).message || 'An unknown chat error occurred');
      setRawError(err);
      
      if (callerOnError) {
        callerOnError(err);
      }
    },
  });

  /**
   * useEffect hook to process credit consumption based on data streamed from the backend.
   * It looks for 'credit_info' payloads in chatHelpers.data.
   * If a payload with 'costInUSDCents' is found and not yet processed (using transactionId),
   * it calls 'consumeCredits' and then 'fetchPlanInfo'.
   */
  useEffect(() => {
    if (chatHelpers.data && chatHelpers.data.length > 0 && conversationIdFromParams) {
        let latestCreditInfoPayload: AgentBaseCreditStreamPayload | null = null;
        
        for (let i = chatHelpers.data.length - 1; i >= 0; i--) {
            const item = chatHelpers.data[i];
            if (typeof item === 'string') {
                try {
                    const parsedItem = JSON.parse(item);
                    if (parsedItem && typeof parsedItem === 'object' && parsedItem.type === 'credit_info' && parsedItem.data) {
                        latestCreditInfoPayload = parsedItem as AgentBaseCreditStreamPayload;
                        break; 
                    }
                } catch (e) {
                    // Not the JSON string we are looking for, or malformed.
                }
            }
        }

        if (latestCreditInfoPayload && latestCreditInfoPayload.data) {
            // Destructure with optional chaining for safety
            const costInUSDCents = latestCreditInfoPayload.data?.creditConsumption?.totalAmountInUSDCents;
            // const newBalanceInUSDCents = latestCreditInfoPayload.data?.newBalanceInUSDCents;
            // Use assistantMessageId as a proxy for transactionId if actual transactionId isn't in this payload
            const currentMessageTransactionId = latestCreditInfoPayload.data?.assistantMessageId;
            
            // Check for consumption data and if it's a new transaction (based on assistantMessageId)
            if (typeof costInUSDCents === 'number' && costInUSDCents > 0 && currentMessageTransactionId && currentMessageTransactionId !== lastProcessedTransactionId) {
                console.log(`🔵 [useConfiguredChat useEffect] Found credit_info with cost: ${costInUSDCents} cents, assistantMessageId: ${currentMessageTransactionId}. Attempting to consume.`);
                consumeCredits(costInUSDCents, conversationIdFromParams)
                    .then(consumedSuccessfully => {
                        if (consumedSuccessfully) {
                            console.log('🟢 [useConfiguredChat useEffect] Credits consumed successfully. Fetching updated plan info for assistantMessageId:', currentMessageTransactionId);
                            fetchPlanInfo(); 
                            setLastProcessedTransactionId(currentMessageTransactionId); // Mark as processed using assistantMessageId
                        } else {
                            console.error('🔴 [useConfiguredChat useEffect] Failed to consume credits for assistantMessageId:', currentMessageTransactionId);
                        }
                    })
                    .catch(error => {
                        console.error('🔴 [useConfiguredChat useEffect] Error during credit consumption or plan info fetch for assistantMessageId:', currentMessageTransactionId, error);
                    });
            }

            if (latestCreditInfoPayload.error) {
                 console.error('🔴 [useConfiguredChat useEffect] credit_info failure reported by backend:', latestCreditInfoPayload.error, latestCreditInfoPayload.details);
            }
        }
    }
  }, [chatHelpers.data, consumeCredits, fetchPlanInfo, conversationIdFromParams, lastProcessedTransactionId, setLastProcessedTransactionId]);

  /**
   * Handles form submission with credit validation.
   * @param {React.FormEvent<HTMLFormElement>} [event] - The form submission event.
   * @param {CustomChatRequestOptions} [chatRequestOptions] - Options for the chat request.
   */
  const handleSubmitWithCredits = useCallback(async (
    event?: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: CustomChatRequestOptions 
  ): Promise<void> => {
    event?.preventDefault();
    // Validate for a nominal amount, actual cost determined by backend stream
    const hasSufficientCredits = await validateCredits(1); 
    if (!hasSufficientCredits) {
      setChatError('Insufficient credits. Please upgrade your plan.'); 
      return;
    }
    setChatError(null); 
    chatHelpers.handleSubmit(event, chatRequestOptions as any); 
  }, [chatHelpers.handleSubmit, validateCredits, setChatError]);

  /**
   * Appends a message with credit validation.
   * @param {Message | CreateMessage} message - The message to append.
   * @param {CustomChatRequestOptions} [chatRequestOptions] - Options for the chat request.
   * @returns {Promise<string | null | undefined>} The result of the append operation.
   */
  const appendWithCredits = useCallback(async (
    message: Message | CreateMessage, 
    chatRequestOptions?: CustomChatRequestOptions
  ): Promise<string | null | undefined> => {
    // Validate for a nominal amount, actual cost determined by backend stream
    const hasSufficientCredits = await validateCredits(1); 
    if (!hasSufficientCredits) {
      setChatError('Insufficient credits. Please upgrade your plan.'); 
      return null;
    }
    setChatError(null); 
    const result = chatHelpers.append(message, chatRequestOptions as any); 
    return result;
  }, [chatHelpers.append, validateCredits, setChatError]);

  return {
    ...chatHelpers,
    handleSubmit: handleSubmitWithCredits,
    append: appendWithCredits,
    isValidatingCredits,
    creditBalance,
    creditHookError,
    clearCreditHookError,
    chatError,
    rawError,
    errorInfo, 
    setChatError,
  };
} 