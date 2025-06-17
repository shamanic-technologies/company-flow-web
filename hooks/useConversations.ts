'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Conversation, ConversationId, CreateConversationInput, ServiceResponse } from '@agent-base/types';
// import { Message as VercelMessage } from 'ai/react'; // No longer directly used here
import { UserResource } from '@clerk/types';
import { useConversationMessages } from './useConversationMessages'; // Import the new hook
import { useAuth } from '@clerk/nextjs';

interface UseConversationsProps {
  selectedAgentIdMiddlePanel: string | null;
  selectedAgentIdRightPanel: string | null;
  user: UserResource | null | undefined;
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

interface UseConversationsReturn {
  conversationList: Conversation[];
  currentConversationIdMiddlePanel: string | null;
  currentConversationIdRightPanel: string | null;
  selectConversationIdMiddlePanel: (conversationId: string | null) => void;
  selectConversationIdRightPanel: (conversationId: string | null) => void;
  isLoadingConversationList: boolean;
  isCreatingConversationRightPanel: boolean;
  isConversationReadyRightPanel: boolean;
  conversationError: string | null;
  handleCreateNewChatRightPanel: () => Promise<string | null>;
  refreshConversationList: () => Promise<void>;
  currentMessagesMiddlePanel: any[]; // Consider using a more specific type
  isLoadingMessagesMiddlePanel: boolean;
  messageErrorMiddlePanel: string | null;
  fetchMessagesMiddlePanel: (conversationId: string) => Promise<void>;
  currentMessagesRightPanel: any[]; // Consider using a more specific type
  isLoadingMessagesRightPanel: boolean;
  messageErrorRightPanel: string | null;
  fetchMessagesRightPanel: (conversationId: string) => Promise<void>;
}

/**
 * @description Hook to manage all user conversations.
 * Message-related logic is handled by the useMessages hook.
 * @param {UseConversationsProps} props - Selected agent ID, Clerk user object, logout handler, and activeOrgId.
 * @returns An object containing all user conversations, loading/error states for conversations,
 * and message-related states/functions from useMessages.
 */
export function useConversations({ 
  selectedAgentIdMiddlePanel, 
  selectedAgentIdRightPanel, 
  user, 
  handleLogout, 
  activeOrgId
}: UseConversationsProps): UseConversationsReturn {
  const { getToken, isLoaded } = useAuth();
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [currentConversationIdMiddlePanel, setCurrentConversationIdMiddlePanel] = useState<string | null>(null);
  const [currentConversationIdRightPanel, setCurrentConversationIdRightPanel] = useState<string | null>(null);
  // A single loading state for the conversation LIST
  const [isLoadingConversationList, setIsLoadingConversationList] = useState<boolean>(false);
  // isCreatingConversationRightPanel is for creating a NEW conversation
  const [isCreatingConversationRightPanel, setIsCreatingConversationRightPanel] = useState<boolean>(false);
  // conversationError is for errors related to fetching/creating conversation LIST
  const [conversationError, setConversationError] = useState<string | null>(null);

  // The right panel conversation is "ready" when an agent is selected, a conversation has been
  // successfully selected or created for it, and no creation process is ongoing.
  const isConversationReadyRightPanel = 
    !!selectedAgentIdRightPanel &&
    !!currentConversationIdRightPanel &&
    !isCreatingConversationRightPanel;

  // --- Instantiate useMessages hook for Middle Panel ---
  const {
    currentConversationMessages: currentMessagesMiddlePanel,
    isLoadingConversationMessages: isLoadingMessagesMiddlePanel,
    conversationMessagesError: messageErrorMiddlePanel,
    fetchConversationMessages: fetchMessagesMiddlePanel,
  } = useConversationMessages({ conversationId: currentConversationIdMiddlePanel, handleLogout, activeOrgId });

  // --- Instantiate useMessages hook for Right Panel ---
  const {
    currentConversationMessages: currentMessagesRightPanel,
    isLoadingConversationMessages: isLoadingMessagesRightPanel,
    conversationMessagesError: messageErrorRightPanel,
    fetchConversationMessages: fetchMessagesRightPanel,
  } = useConversationMessages({ conversationId: currentConversationIdRightPanel, handleLogout, activeOrgId });

  // --- Function to fetch ALL conversations for the user ---
  const fetchUserConversations = useCallback(async () => {
    if (!activeOrgId) {
      console.log("useConversations: Waiting for activeOrgId to fetch conversations...");
      setConversationList([]);
      setIsLoadingConversationList(false);
      // setConversationError("Organization not selected. Cannot fetch conversations.");
      return;
    }
    console.log(`useConversations: Fetching conversations for org: ${activeOrgId}`);
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
    setIsCreatingConversationRightPanel(true);
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
      
      setCurrentConversationIdRightPanel(createdConversationId);
      return createdConversationId;
    } catch (error: any) {
      console.error("useConversations: Error creating new chat:", error);
      setConversationError(`Error creating chat: ${error.message}`);
      return null;
    } finally {
      setIsCreatingConversationRightPanel(false);
    }
  }, [user, activeOrgId, getToken, handleLogout, fetchUserConversations]);

  // Effect to update currentConversationIdMiddlePanel based on selectedAgentIdMiddlePanel and conversationList
  useEffect(() => {
    if (!activeOrgId) { // If org changes, selection logic might need to reset or re-evaluate
      setCurrentConversationIdMiddlePanel(null);
      setCurrentConversationIdRightPanel(null);
      return; // Exit early if no org
    }
    if (selectedAgentIdMiddlePanel) {
      const agentConversations = conversationList
        .filter(convo => convo.agentId === selectedAgentIdMiddlePanel)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (agentConversations.length > 0) {
        const currentConvoStillValid = agentConversations.some(c => c.conversationId === currentConversationIdMiddlePanel);
        if (!currentConvoStillValid || currentConversationIdMiddlePanel === null) {
          setCurrentConversationIdMiddlePanel(agentConversations[0].conversationId);
        }
      } else {
        // If an agent is selected but has no conversations, do not create one for the middle panel.
        if (currentConversationIdMiddlePanel !== null) {
            setCurrentConversationIdMiddlePanel(null);
        }
      }
    } else {
      if (currentConversationIdMiddlePanel !== null) {
        setCurrentConversationIdMiddlePanel(null);
      }
    }
  }, [selectedAgentIdMiddlePanel, conversationList, currentConversationIdMiddlePanel, activeOrgId]); // createConversation removed

  // --- Effect to update currentConversationIdRightPanel based on selectedAgentIdRightPanel and conversationList ---
  useEffect(() => {
    // Guard against running this logic too early.
    // Wait for the initial conversation list to load, and ensure we're not already creating one.
    if (!activeOrgId || !selectedAgentIdRightPanel || isLoadingConversationList || isCreatingConversationRightPanel) {
        return;
    }

    const agentConversations = conversationList
        .filter(convo => convo.agentId === selectedAgentIdRightPanel)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    if (agentConversations.length > 0) {
      const currentConvoStillValid = agentConversations.some(c => c.conversationId === currentConversationIdRightPanel);
      if (!currentConvoStillValid || currentConversationIdRightPanel === null) {
            setCurrentConversationIdRightPanel(agentConversations[0].conversationId);
      }
    } else {
      // If we have finished loading and there are still no conversations, create one.
      console.log(`useConversations: No conversations found for agent ${selectedAgentIdRightPanel} in right panel. Creating one.`);
      createConversation(selectedAgentIdRightPanel);
    }
  }, [
    selectedAgentIdRightPanel, 
    conversationList, 
    currentConversationIdRightPanel, 
    activeOrgId, 
    createConversation, 
    isLoadingConversationList,
    isCreatingConversationRightPanel
  ]);

  // --- Refresh all user conversations (used by polling for conversation list) ---
  const refreshConversationList = useCallback(async () => {
    if (!activeOrgId) {
        console.log("useConversations: Cannot refresh list, no active org.");
        return; 
    }
    await fetchUserConversations();
  }, [activeOrgId, fetchUserConversations]); // Added activeOrgId

  // --- Handler to Create New Chat --- 
  const handleCreateNewChatRightPanel = useCallback(async () => {
    if (!selectedAgentIdRightPanel) {
      console.error("No agent selected in the right panel to create a chat for.");
      return null;
    }
    const newConvId = await createConversation(selectedAgentIdRightPanel);
    if (newConvId) {
      // This automatically sets the new conversation as active for the right panel
      setCurrentConversationIdRightPanel(newConvId);
      // We might not want to automatically switch the view, just prepare the new chat.
      // setActiveAgentView('chat'); // This line could be removed if view switching is handled elsewhere.
    }
    return newConvId; // Return the new ID
  }, [selectedAgentIdRightPanel, createConversation]);

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
    // Only fetch if Clerk is loaded and an active organization is selected
    if (isLoaded && activeOrgId) {
      setIsLoadingConversationList(true);
      setConversationError(null);  
      fetchUserConversations();
    } else {
      // Clear data if clerk is not loaded or no org is selected
      setConversationList([]);
      setCurrentConversationIdMiddlePanel(null);
      setCurrentConversationIdRightPanel(null);
      setIsLoadingConversationList(false);
      setConversationError(null);
    }
  }, [isLoaded, activeOrgId, fetchUserConversations]);

  return {
    // Conversation list related
    conversationList,
    currentConversationIdMiddlePanel, // Renamed for clarity in return
    currentConversationIdRightPanel, // Renamed for clarity in return
    selectConversationIdMiddlePanel,
    selectConversationIdRightPanel,
    isLoadingConversationList,
    isCreatingConversationRightPanel,
    isConversationReadyRightPanel,
    conversationError, // Error related to conversation list/creation
    handleCreateNewChatRightPanel,
    refreshConversationList, // Function to refresh the conversation list

    // --- Messages for Middle Panel ---
    currentMessagesMiddlePanel,
    isLoadingMessagesMiddlePanel,
    messageErrorMiddlePanel,
    fetchMessagesMiddlePanel,

    // --- Messages for Right Panel ---
    currentMessagesRightPanel,
    isLoadingMessagesRightPanel,
    messageErrorRightPanel,
    fetchMessagesRightPanel,
  };
} 