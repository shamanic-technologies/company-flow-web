import { Message } from 'ai/react';

/**
 * Represents the structure of credit consumption details.
 * This should align with what consumeCredits expects and what backend provides.
 */
export interface CreditInfo {
  inputTokens?: number;
  outputTokens?: number;
  toolCallsCount?: number;
  totalAmountInUSDCents: number;
  operationType?: string;
}

/**
 * Specific type for the data payload of a 'data' message containing credit info.
 */
export interface CreditDataMessagePayload {
  type: 'credit_info';
  success: boolean;
  data?: {
    totalAmountInUSDCents: number;
    inputTokens?: number;
    outputTokens?: number;
    toolCallsCount?: number;
    operationType?: string;
  };
  error?: string;
  details?: any;
}

/**
 * Checks if a message is a special data message containing credit information.
 * @param msg The message to check.
 * @returns True if the message is a credit data message, false otherwise.
 */
export const isCreditDataMessage = (msg: Message): boolean => {
  // A credit data message must have role 'data'.
  // Its 'data' property must be an object and not null.
  // This object (CreditDataMessagePayload) must have a boolean 'success' property.
  return msg.role === 'data' && 
         typeof msg.data === 'object' && 
         msg.data !== null &&
         typeof (msg.data as any).success === 'boolean'; // Key indicator of CreditDataMessagePayload
};

/**
 * Defines a compatible type for chatRequestOptions if not directly importable from Vercel AI SDK.
 * This should match what useChat expects for its handleSubmit and append methods.
 */
export type CustomChatRequestOptions = {
  data?: import('ai').JSONValue; 
  options?: { 
    body?: Record<string, any>; 
    headers?: Record<string, string>;
  };
  // Add other properties from Vercel SDK's internal ChatRequestOptions if needed
}; 