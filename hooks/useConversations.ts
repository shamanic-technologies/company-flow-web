'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Conversation, CreateConversationInput, ServiceResponse } from '@agent-base/types';
// import { Message as VercelMessage } from 'ai/react'; // No longer directly used here
import { UserResource } from '@clerk/types';
import { useMessages } from './useMessages'; // Import the new hook
import { useAuth } from '@clerk/nextjs';

interface UseConversationsProps {
  selectedAgentIdMiddlePanel: string | null;
  selectedAgentIdRightPanel: string | null;
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
  selectedAgentIdMiddlePanel, 
  selectedAgentIdRightPanel, 
  user, 
  handleLogout, 
  activeOrgId
}: UseConversationsProps) {
  const { getToken, isLoaded } = useAuth();
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
  } = useMessages({ conversationId: currentConversationIdMiddlePanel, handleLogout, activeOrgId }); // Pass activeOrgId

  const apiRef = useRef({
    createConversation: async (agentId: string) => {
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
      try {
        const token = await getToken();
        const response = await fetch('/api/conversations/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ agentId, orgId: activeOrgId }),
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
        await fetchUserConversations();
        setCurrentConversationIdRightPanel(responseData.conversationId);
        return responseData.conversationId;
      } catch (error: any) {
        console.error("useConversations: Error creating new chat:", error);
        setConversationError(`Error creating chat: ${error.message}`);
        return null;
      } finally {
        setIsCreatingConversationRightPanel(false);
      }
    },
    listConversations: async () => {
      if (!user) return;
      if (!activeOrgId) {
        setConversationList([]);
        return;
      }
      setIsLoadingConversationsRightPanel(true);
      try {
        const token = await getToken();
        const response = await fetch(`/api/conversations/list?agentId=${selectedAgentIdRightPanel}&orgId=${activeOrgId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        if (response.status === 401) {
          console.error('🚫 useConversations - Unauthorized loading conversations');
          handleLogout();
          return;
        }
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(`Failed to list conversations: ${errData.error || response.statusText} (${response.status})`);
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
          const errorMsg = serviceResponse.error || 'API error listing conversations: Invalid data format';
          console.error(`useConversations: ${errorMsg}`);
          setConversationError(errorMsg);
          setConversationList([]); 
        }
      } catch (error: any) {
        console.error(`useConversations: Error fetching conversations:`, error);
        setConversationError(`Failed to load conversations: ${error.message}`);
        setConversationList([]);
      } finally {
        setIsLoadingConversationsRightPanel(false);
      }
    }
  });

  // --- Function to fetch ALL conversations for the user ---
  const fetchUserConversations = useCallback(async () => {
    if (!activeOrgId) {
      console.log("useConversations: Waiting for activeOrgId to fetch conversations...");
      setConversationList([]);
      setIsLoadingConversationsMiddlePanel(false);
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
  }, [activeOrgId, handleLogout, getToken]); // Added activeOrgId. conversationList removed from deps.

  // --- Effect to update currentConversationIdMiddlePanel based on selectedAgentIdMiddlePanel and conversationList ---
  useEffect(() => {
    if (!activeOrgId) { // If org changes, selection logic might need to reset or re-evaluate
        setCurrentConversationIdMiddlePanel(null);
        return;
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
        if (currentConversationIdMiddlePanel !== null) {
            setCurrentConversationIdMiddlePanel(null);
        }
      }
    } else {
      if (currentConversationIdMiddlePanel !== null) {
        setCurrentConversationIdMiddlePanel(null);
      }
    }
  }, [selectedAgentIdMiddlePanel, conversationList, currentConversationIdMiddlePanel, activeOrgId]); // Added activeOrgId

  // --- Effect to update currentConversationIdRightPanel based on selectedAgentIdRightPanel and conversationList ---
  useEffect(() => {
    if (!activeOrgId) {
        setCurrentConversationIdRightPanel(null);
        return;
    }
    if (selectedAgentIdRightPanel) {
      const agentConversations = conversationList
          .filter(convo => convo.agentId === selectedAgentIdRightPanel)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (agentConversations.length > 0) {
          const currentConvoStillValid = agentConversations.some(c => c.conversationId === currentConversationIdRightPanel);
          if (!currentConvoStillValid || currentConversationIdRightPanel === null) {
               setCurrentConversationIdRightPanel(agentConversations[0].conversationId);
          }
        } else {
          if (currentConversationIdRightPanel !== null) {
              setCurrentConversationIdRightPanel(null);
          }
        }
      } else {
        if (currentConversationIdRightPanel !== null) { // Corrected from currentConversationIdMiddlePanel
          setCurrentConversationIdRightPanel(null);
        }
      }
    }, [selectedAgentIdRightPanel, conversationList, currentConversationIdRightPanel, activeOrgId]); // Added activeOrgId

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
    const newConvId = await apiRef.current.createConversation(selectedAgentIdRightPanel);
    if (newConvId) {
      // This automatically sets the new conversation as active for the right panel
      setCurrentConversationIdRightPanel(newConvId);
      // We might not want to automatically switch the view, just prepare the new chat.
      // setActiveAgentView('chat'); // This line could be removed if view switching is handled elsewhere.
    }
    return newConvId; // Return the new ID
  }, [selectedAgentIdRightPanel, apiRef]);

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
      setIsLoadingConversationsMiddlePanel(true);
      setConversationError(null);  
      fetchUserConversations();
    } else {
      // Clear data if clerk is not loaded or no org is selected
      setConversationList([]);
      setCurrentConversationIdMiddlePanel(null);
      setCurrentConversationIdRightPanel(null);
      setIsLoadingConversationsMiddlePanel(false);
      setConversationError(null);
    }
  }, [isLoaded, activeOrgId, fetchUserConversations]);

  // --- Fetching logic using useEffect ---
  useEffect(() => {
    if (user && selectedAgentIdMiddlePanel && activeOrgId) {
      apiRef.current.listConversations();
    } else {
      setConversationList([]); // Clear list if no agent is selected
    }
  }, [user, selectedAgentIdMiddlePanel, activeOrgId]);

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