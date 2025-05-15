'use client';

import { useState, useCallback, useEffect } from 'react';
import { Conversation, CreateConversationInput, ServiceResponse } from '@agent-base/types';
// import { Message as VercelMessage } from 'ai/react'; // No longer directly used here
import { UserResource } from '@clerk/types';
import { useMessages } from './useMessages'; // Import the new hook

interface UseConversationsProps {
  selectedAgentIdMiddlePanel: string | null;
  selectedAgentIdRightPanel: string | null;
  user: UserResource | null | undefined;
  handleLogout: () => void;
}

/**
 * @description Hook to manage all user conversations.
 * Message-related logic is handled by the useMessages hook.
 * @param {UseConversationsProps} props - Selected agent ID, Clerk user object, and logout handler.
 * @returns An object containing all user conversations, loading/error states for conversations,
 * and message-related states/functions from useMessages.
 */
export function useConversations({ selectedAgentIdMiddlePanel, selectedAgentIdRightPanel, user, handleLogout }: UseConversationsProps) {
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [currentConversationIdMiddlePanel, setCurrentConversationIdMiddlePanel] = useState<string | null>(null);
  const [currentConversationIdRightPanel, setCurrentConversationIdRightPanel] = useState<string | null>(null);
  // isLoadingConversationsMiddlePanel is for the conversation LIST
  const [isLoadingConversationsMiddlePanel, setIsLoadingConversationsMiddlePanel] = useState<boolean>(false);
  const [isLoadingConversationsRightPanel, setIsLoadingConversationsRightPanel] = useState<boolean>(false);
  // isCreatingConversationRightPanel is for creating a NEW conversation
  const [isCreatingConversationRightPanel, setIsCreatingConversationRightPanel] = useState<boolean>(false);
  // conversationError is for errors related to fetching/creating conversation LIST
  const [conversationError, setConversationError] = useState<string | null>(null);

  // --- Instantiate useMessages hook ---
  const {
    currentMessages,
    isLoadingMessages,
    messageError,
    fetchMessages, // This is fetchMessages from useMessages
  } = useMessages({ conversationId: currentConversationIdMiddlePanel, handleLogout });

  // --- Function to fetch ALL conversations for the user ---
  const fetchUserConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations/list-all-for-user', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.status === 401) {
        console.error('🚫 useConversations - Unauthorized fetching all user conversations');
        handleLogout();
        return;
      }
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(`Failed to list all user conversations: ${errData.error || response.statusText} (${response.status})`);
      }
      const serviceResponse: ServiceResponse<Conversation[]> = await response.json();
      if (serviceResponse.success && serviceResponse.data) {
        const sortedConversations = serviceResponse.data.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        if (JSON.stringify(sortedConversations) !== JSON.stringify(conversationList)) {
            setConversationList(sortedConversations);
        }
      } else {
        const errorMsg = serviceResponse.error || 'API error listing all user conversations: Invalid data format';
        console.error(`useConversations: ${errorMsg}`);
        setConversationError(errorMsg);
        setConversationList([]); 
      }
    } catch (error: any) {
      console.error(`useConversations: Error fetching all user conversations:`, error);
      setConversationError(`Failed to load conversations: ${error.message}`);
      setConversationList([]);
    } finally {
      setIsLoadingConversationsMiddlePanel(false);
    }
  }, [handleLogout]);

  // --- Effect to update currentConversationIdMiddlePanel based on selectedAgentIdMiddlePanel and conversationList ---
  useEffect(() => {
    if (selectedAgentIdMiddlePanel) {
      const agentConversations = conversationList
        .filter(convo => convo.agentId === selectedAgentIdMiddlePanel)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (agentConversations.length > 0) {
        const currentConvoStillValid = agentConversations.some(c => c.conversationId === currentConversationIdMiddlePanel);
        if (!currentConvoStillValid) {
          setCurrentConversationIdMiddlePanel(agentConversations[0].conversationId);
        } else if (currentConversationIdMiddlePanel === null) {
             setCurrentConversationIdMiddlePanel(agentConversations[0].conversationId);
        }
      } else {
        if (currentConversationIdMiddlePanel !== null) {
            setCurrentConversationIdMiddlePanel(null);
        }
      }
    } else {
      if (currentConversationIdMiddlePanel !== null) {
        console.log("useConversations: No agent selected, clearing current conversation ID.");
        setCurrentConversationIdMiddlePanel(null);
      }
    }
  }, [selectedAgentIdMiddlePanel, conversationList, currentConversationIdMiddlePanel]);

  // --- Effect to update currentConversationIdRightPanel based on selectedAgentIdRightPanel and conversationList ---
  useEffect(() => {
    if (selectedAgentIdRightPanel) {
      const agentConversations = conversationList
          .filter(convo => convo.agentId === selectedAgentIdRightPanel)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (agentConversations.length > 0) {
          const currentConvoStillValid = agentConversations.some(c => c.conversationId === currentConversationIdRightPanel);
          if (!currentConvoStillValid) {
            setCurrentConversationIdRightPanel(agentConversations[0].conversationId);
          } else if (currentConversationIdRightPanel === null) {
               setCurrentConversationIdRightPanel(agentConversations[0].conversationId);
          }
        } else {
          if (currentConversationIdRightPanel !== null) {
              setCurrentConversationIdRightPanel(null);
          }
        }
      } else {
        if (currentConversationIdMiddlePanel !== null) {
          console.log("useConversations: No agent selected, clearing current conversation ID.");
          setCurrentConversationIdRightPanel(null);
        }
      }
    }, [selectedAgentIdRightPanel, conversationList, currentConversationIdRightPanel]);

  // --- Refresh all user conversations (used by polling for conversation list) ---
  const refreshConversationList = useCallback(async () => {
    await fetchUserConversations();
  }, [fetchUserConversations]);

  // --- Handler to Create New Chat --- 
  const handleCreateNewChatRightPanel = useCallback(async (): Promise<string | null> => {
    if (!selectedAgentIdRightPanel || !user) {
      console.warn("useConversations: Agent ID or user info missing for creating chat.");
      setConversationError("Cannot create chat: missing required information.");
      return null;
    }
    setIsCreatingConversationRightPanel(true);
    setConversationError(null); // Clear conversation list error
    try {
      const newConversationId = crypto.randomUUID();
      const channelId = 'web';
      const requestBody: CreateConversationInput = {
        agentId: selectedAgentIdRightPanel,
        channelId: channelId,
        conversationId: newConversationId,
      };
      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (response.status === 401) {
        console.error('🚫 useConversations - Unauthorized creating conversation');
        handleLogout();
        return null;
      }
      const responseDataUntyped = await response.json();
      if (!response.ok) {
        console.error('🚫 useConversations - API error creating conversation:', responseDataUntyped);
        throw new Error(responseDataUntyped.error || `Failed to create conversation (HTTP ${response.status})`);
      }
      const responseData = responseDataUntyped as Conversation;
      if (!responseData || !responseData.conversationId) {
        console.error('🚫 useConversations - Invalid conversation data received from API after create');
        throw new Error('Invalid conversation data received from API');
      }
      console.log("useConversations: New chat created successfully, fetching all user conversations to update list.");
      await fetchUserConversations(); // Refresh the conversation list
      // Set the new conversation as current. This will trigger useMessages to fetch its messages.
      setCurrentConversationIdRightPanel(responseData.conversationId);
      return responseData.conversationId;
    } catch (error: any) {
      console.error("useConversations: Error creating new chat:", error);
      setConversationError(`Error creating chat: ${error.message}`);
      return null;
    } finally {
      setIsCreatingConversationRightPanel(false);
    }
  }, [selectedAgentIdRightPanel, user, handleLogout, fetchUserConversations]);

  // --- Simple setter for selecting a conversation ID --- 
  const selectConversationIdMiddlePanel = useCallback((conversationId: string | null) => {
    console.log(`useConversations: Setting current conversation ID to: ${conversationId}`);
    if (conversationId !== currentConversationIdMiddlePanel) {
      setCurrentConversationIdMiddlePanel(conversationId);
    }
  }, [currentConversationIdMiddlePanel]);

  const selectConversationIdRightPanel = useCallback((conversationId: string | null) => {
    if (conversationId !== currentConversationIdRightPanel) {
      setCurrentConversationIdRightPanel(conversationId);
    }
  }, [currentConversationIdRightPanel]);

  // --- Initial fetch of all conversations when the hook mounts and user is available ---
  useEffect(() => {
    // Load the conversation list
    setIsLoadingConversationsMiddlePanel(true);
    setConversationError(null);  
    // Fetch the conversation list
    fetchUserConversations();
  }, [fetchUserConversations]);

  return {
    // Conversation list related
    conversationList,
    currentConversationIdMiddlePanel, // Renamed for clarity in return
    currentConversationIdRightPanel, // Renamed for clarity in return
    selectConversationIdMiddlePanel,
    selectConversationIdRightPanel,
    isLoadingConversationsMiddlePanel,
    isLoadingConversationsRightPanel,
    isCreatingConversationRightPanel,
    conversationError, // Error related to conversation list/creation
    handleCreateNewChatRightPanel,
    refreshConversationList, // Function to refresh the conversation list

    // Message related (from useMessages hook)
    currentMessages, // Renamed from currentMessagesMiddlePanel
    isLoadingMessages,
    messageError, // Error specific to messages
    fetchMessages, // Function to fetch/refresh messages for currentConversationId
  };
} 