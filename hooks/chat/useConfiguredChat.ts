import { useChat, type CreateMessage, type Message, type UseChatOptions } from 'ai/react';
import { useCallback, useState, useEffect, useRef } from 'react';
import { type JSONValue } from 'ai';
import { CreditInfo, CreditDataMessagePayload, isCreditDataMessage } from '@/components/dashboard/chat/utils/chatUtils';
import { createIdGenerator } from 'ai';
import { 
  AgentBaseCreditStreamPayload, 
  AgentBaseDeductCreditRequest,
  AgentBaseCreditConsumptionItem,
  UserMessageMetadata,
  ClientUser,
  Agent,
} from '@agent-base/types';
import { useUser } from '@clerk/nextjs';


/**
 * @file useConfiguredChat.ts
 * @description Custom hook to configure and wrap Vercel AI SDK's useChat.
 */

// --- Type Definitions ---
export interface CustomChatRequestOptions extends UseChatOptions {
  agentId?: string;
  activeOrgId?: string;
}

interface UpdateOrganizationArgs {
  client_organization_id: string;
  name?: string;
  slug?: string;
}

interface DeleteOrganizationArgs {
  client_organization_id: string;
}
interface ConfiguredChatOptions extends UseChatOptions {
  activeOrgId: string | null | undefined;
  agent: Agent | undefined;
  user: ReturnType<typeof useUser>['user'];
}

/**
 * A custom hook that configures and wraps the Vercel AI SDK's useChat hook.
 * @param {ConfiguredChatOptions} params - Options for the useChat hook.
 * @returns {object} Enhanced chat helpers and state.
 */
export function useConfiguredChat(params: ConfiguredChatOptions) {
  const { 
    onFinish: callerOnFinish, 
    onError: callerOnError,   
    id: conversationIdFromParams, 
    api: apiFromParams,
    streamProtocol: streamProtocolFromParams,
    activeOrgId, 
    agent,
    user,
    ...restOfParams 
  } = params;

  // State for chat-specific errors that might occur during send/receive
  const [chatError, setChatError] = useState<string | null>(null);
  const [rawError, setRawError] = useState<any>(null); // To store raw error object
  const [errorInfo, setErrorInfo] = useState<{code: string, details?: string} | null>(null);

  const chatHelpers = useChat({
    ...restOfParams, 
    id: conversationIdFromParams, 
    api: apiFromParams,
    streamProtocol: streamProtocolFromParams,
    sendExtraMessageFields: true, // send id and createdAt for each message
    // id format for client-side messages:
    generateId: createIdGenerator({
      prefix: 'msgc',
      size: 16,
    }),
    // experimental_prepareRequestBody: prepareRequestBody, // Temporarily commented out
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === 'get_active_organization') {
        const response = await fetch('/api/organizations/get-active');
        const json = await response.json();
        return json;
      }
      if (toolCall.toolName === 'update_organization') {
        const { client_organization_id, ...updates } = toolCall.args as UpdateOrganizationArgs;
        const response = await fetch('/api/organizations/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientOrganizationId: client_organization_id, ...updates }),
        });
        const json = await response.json();
        console.debug(`[useConfiguredChat] update_organization response:`, json, null, 2);
        return json;
      }
      if (toolCall.toolName === 'delete_organization') {
        const { client_organization_id } = toolCall.args as DeleteOrganizationArgs;
        const response = await fetch('/api/organizations/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientOrganizationId: client_organization_id }),
        });
        const json = await response.json();
        console.debug(`[useConfiguredChat] delete_organization response:`, json, null, 2);
        return json;
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
   * Creates a new message object with user-specific metadata in the annotations.
   * If the message is not from a user, it returns the message as is.
   * @param {Message | CreateMessage} message - The message to add metadata to.
   * @returns {Message | CreateMessage} The message with added metadata.
   */
  const addUserMetadata = useCallback((message: Message | CreateMessage): Message | CreateMessage => {
    if (message.role !== 'user') {
      return message;
    }

    const metadata: UserMessageMetadata = {
      type: 'user',
      started_at: new Date().toISOString(),
      from_client_user: user ? {
        displayName: user.fullName || undefined,
        profileImage: user.imageUrl || undefined,
      } : {},
      to_agent: agent ? {
        id: agent.id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        profilePicture: agent.profilePicture,
      } : {},
    };
    console.debug('[useConfiguredChat] Metadata:', metadata);

    return {
      ...message,
      annotations: [
        ...(message.annotations || []),
        metadata as unknown as JSONValue,
      ],
    };
  }, [user, agent]);

  const handleSubmit = useCallback(async (
    event?: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: CustomChatRequestOptions 
  ): Promise<void> => {
    event?.preventDefault();
    setChatError(null); 

    if (chatHelpers.input === '') {
      return;
    }

    const messageToAppend: CreateMessage = {
      role: 'user',
      content: chatHelpers.input,
    };
    
    const messageWithMetadata = addUserMetadata(messageToAppend);
    
    chatHelpers.append(messageWithMetadata, chatRequestOptions as any);
    chatHelpers.setInput('');

  }, [chatHelpers, addUserMetadata, setChatError]);

  const append = useCallback(async (
    message: Message | CreateMessage, 
    chatRequestOptions?: CustomChatRequestOptions
  ): Promise<string | null | undefined> => {
    setChatError(null); 
    
    const messageWithMetadata = addUserMetadata(message);
    
    const result = chatHelpers.append(messageWithMetadata, chatRequestOptions as any); 
    return result;
  }, [chatHelpers.append, setChatError, addUserMetadata]);

  return {
    ...chatHelpers,
    handleSubmit,
    append,
    agent,
    chatError,
    rawError,
    errorInfo, 
    setChatError,
  };
} 