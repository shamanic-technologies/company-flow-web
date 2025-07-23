'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Conversation, ConversationId, CreateConversationInput, ServiceResponse } from '@agent-base/types';
// import { Message as VercelMessage } from 'ai/react'; // No longer directly used here
import { useAuth } from '@clerk/nextjs';
import { UserResource } from '@clerk/types';
import { useConversationMessages } from './useConversationMessages';

interface UseConversationsProps {
  selectedAgentId: string | null;
  user: UserResource | null | undefined;
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

/**
 * @description Hook to manage all user conversations.
 * Message-related logic is handled by the useMessages hook.
 * @param {UseConversationsProps} props - Selected agent ID, Clerk user object, logout handler, and activeOrgId.
 * @returns An object containing all user conversations, loading/error states for conversations,
 * and message-related states/functions from useMessages.
 */
export function useConversations({ 
  selectedAgentId, 
  user, 
  handleLogout, 
  activeOrgId
}: UseConversationsProps) {
  const { getToken, isLoaded } = useAuth();
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  // A single loading state for the conversation LIST
  const [isLoadingConversationList, setIsLoadingConversationList] = useState<boolean>(false);
  // isCreatingConversation is for creating a NEW conversation
  const [isCreatingConversation, setIsCreatingConversation] = useState<boolean>(false);
  // conversationError is for errors related to fetching/creating conversation LIST
  const [conversationError, setConversationError] = useState<string | null>(null);

  // The conversation is "ready" when an agent is selected, a conversation has been
  // successfully selected or created for it, and no creation process is ongoing.
  const isConversationReady = !isLoadingConversationList && !isCreatingConversation;

  const {
    currentConversationMessages,
    isLoadingConversationMessages,
    conversationMessagesError,
    fetchConversationMessages,
  } = useConversationMessages({ conversationId: currentConversationId, handleLogout, activeOrgId });

  const selectConversationId = useCallback((conversationId: string | null) => {
    console.log(`useConversations: Setting current conversation to: ${conversationId ?? 'None'}`);
    setCurrentConversationId(conversationId);
  }, []);

  const fetchUserConversations = useCallback(async () => {
    // This function can be called on mount or for a refresh.
    // Don't show loader on background refresh, only on initial load.
    // The caller will set isLoadingConversationList to true if it's an initial load.
    console.log("useConversations: Fetching all user conversations...");
    setConversationError(null);

    try {
      const token = await getToken();
      const response = await fetch('/api/conversations/list-all-for-user', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        console.error('🚫 useConversations - Unauthorized fetching all user conversations');
        setConversationList([]);
        handleLogout();
        return;
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Failed to list all user conversations: ${errData.error || response.statusText} (${response.status})`);
      }
      const serviceResponse: ServiceResponse<Conversation[]> = await response.json();
      if (serviceResponse.success && serviceResponse.data) {
        const sortedConversations = serviceResponse.data.sort((a: Conversation, b: Conversation) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setConversationList(prevList => {
          if (JSON.stringify(sortedConversations) !== JSON.stringify(prevList)) {
            return sortedConversations;
          }
          return prevList;
        });
      } else {
        // If success is false, there should be a message property
        const errorMsg = (serviceResponse as any).message || 'API error listing all user conversations: Invalid data format';
        console.error(`useConversations: ${errorMsg}`);
        setConversationError(errorMsg);
        setConversationList([]);
      }
    } catch (error: any) {
      console.error(`useConversations: Error fetching all user conversations:`, error);
      setConversationError(`Failed to load conversations: ${error.message}`);
      setConversationList([]);
    } finally {
      setIsLoadingConversationList(false);
    }
  }, [activeOrgId, handleLogout, getToken]);

  const createConversation = useCallback(async (agentId: string) => {
    if (!user) {
      console.error("useConversations.createConversation: User not available.");
      return null;
    }
    if (!activeOrgId) {
      console.error("useConversations.createConversation: activeOrgId not available.");
      return null;
    }
    setIsCreatingConversation(true);
    setConversationError(null);

    const newConversationId = crypto.randomUUID();
    const body = {
        agentId: agentId,
        channelId: 'web',
        conversationId: newConversationId,
    };

    try {
      const token = await getToken();
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        console.error('🚫 useConversations - Unauthorized creating conversation');
        handleLogout();
        return null;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🚫 useConversations - API error creating conversation:', errorData);
        throw new Error(errorData.error || `Failed to create conversation (HTTP ${response.status})`);
      }
      
      // Since the API returns the ID on success, we can use it.
      const responseData: ConversationId = await response.json();
      const createdConversationId = responseData.conversationId;
      
      if (!createdConversationId) {
        console.error('🚫 useConversations - Invalid data received from API after create');
        throw new Error('Invalid conversation data received from API');
      }

      console.log("useConversations: New chat created successfully, fetching all user conversations to update list.");
      await fetchUserConversations();

      // Automatically select the new conversation
      console.log(`useConversations: Automatically selecting new conversation ${createdConversationId}`);
      setCurrentConversationId(createdConversationId);
      
      return createdConversationId;

    } catch (error) {
      const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
      console.error(`🚫 useConversations - Error in createConversation: ${errorMessage}`);
      setConversationError(errorMessage);
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  }, [user, getToken, handleLogout, fetchUserConversations, activeOrgId]);


  const handleCreateNewChat = useCallback(async () => {
    if (!selectedAgentId) {
      console.error("useConversations.handleCreateNewChat: Cannot create chat without a selected agent.");
      // Optionally, set an error state to inform the user
      setConversationError("Please select an agent before starting a new chat.");
      return;
    }
    console.log(`useConversations: handleCreateNewChat called for agent ${selectedAgentId}`);
    await createConversation(selectedAgentId);
  }, [createConversation, selectedAgentId]);

  const refreshConversationList = useCallback(async () => {
    // This is a manual refresh, so we don't need to set the loading state.
    // It will just update the list in the background.
    await fetchUserConversations();
  }, [fetchUserConversations]);

  // --- Utility to select the first conversation if none is selected ---
  useEffect(() => {
    if (currentConversationId === null && conversationList.length > 0) {
      console.log(`useConversations: No conversation selected, defaulting to the first one: ${conversationList[0].conversationId}`);
      setCurrentConversationId(conversationList[0].conversationId);
    }
  }, [conversationList, currentConversationId]);

  // --- Initial fetch of all conversations when the hook mounts and user is available ---
  useEffect(() => {
    // Only fetch if Clerk is loaded and an active organization is selected
    if (isLoaded && activeOrgId) {
      setIsLoadingConversationList(true);
      setConversationError(null);  
      fetchUserConversations();
    } else {
      // Clear data if clerk is not loaded or no org is selected
      setConversationList([]);
      setCurrentConversationId(null);
      setIsLoadingConversationList(false);
      setConversationError(null);
    }
  }, [isLoaded, activeOrgId, fetchUserConversations]);

  return {
    // Conversation list related
    conversationList,
    currentConversationId,
    selectConversationId,
    isLoadingConversationList,
    isCreatingConversation,
    isConversationReady,
    conversationError, // Error related to conversation list/creation
    handleCreateNewChat,
    refreshConversationList, // Function to refresh the conversation list

    // --- Messages ---
    currentConversationMessages,
    isLoadingConversationMessages,
    conversationMessagesError,
    fetchMessagesForCurrentConversation: fetchConversationMessages,
  };
} 