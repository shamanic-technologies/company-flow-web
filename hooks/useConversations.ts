'use client';

import { useState, useCallback, useEffect } from 'react';
import { Conversation, CreateConversationInput, ServiceResponse } from '@agent-base/types';
import { Message as VercelMessage } from 'ai/react';
import { UserResource } from '@clerk/types';

interface UseConversationsProps {
  selectedAgentIdMiddlePanel: string | null;
  user: UserResource | null | undefined;
  handleLogout: () => void;
}

/**
 * @description Hook to manage conversation list, current conversation, messages, and related actions for the selected agent.
 * @param {UseConversationsProps} props - Selected agent ID, Clerk user object, and logout handler.
 * @returns An object containing conversation and message state, loading/error states, and related functions.
 */
export function useConversations({ selectedAgentIdMiddlePanel, user, handleLogout }: UseConversationsProps) {
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [currentConversationIdMiddlePanel, setCurrentConversationIdMiddlePanel] = useState<string | null>(null);
  const [currentMessagesMiddlePanel, setCurrentMessagesMiddlePanel] = useState<VercelMessage[]>([]);
  const [isLoadingConversationsMiddlePanel, setIsLoadingConversationsMiddlePanel] = useState<boolean>(false);
  const [isLoadingMessagesMiddlePanel, setIsLoadingMessagesMiddlePanel] = useState<boolean>(false);
  const [isCreatingConversationRightPanel, setIsCreatingConversationRightPanel] = useState<boolean>(false);
  const [conversationError, setConversationError] = useState<string | null>(null);

  // --- Function to load conversation LIST for the selected agent --- 
  const loadConversationListForAgent = useCallback(async (agentId: string) => {
    if (!agentId) {
        // This case should ideally be handled by the effect watching selectedAgentId
        console.log("useConversations: No agent ID provided to loadConversationListForAgent.");
        setConversationList([]);
        setCurrentConversationIdMiddlePanel(null);
        setIsLoadingConversationsMiddlePanel(false);
        setConversationError(null);
        return;
    }

    console.log(`useConversations: Loading conversation list for agent ${agentId}...`);
    setIsLoadingConversationsMiddlePanel(true);
    setConversationError(null);
    // Clear previous list and selected ID while loading new list
    setConversationList([]);
    setCurrentConversationIdMiddlePanel(null); 
    // Messages will be cleared by the effect watching currentConversationId

    try {
      // Using list-or-create ensures we have one if possible, simplifying UI states
      // Note: The API endpoint might need adjustment if it strictly lists vs. list-or-create
      // Switched to /api/conversations/list-or-create as per original context logic
      const listResponse = await fetch(`/api/conversations/list-or-create?agent_id=${agentId}`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      if (listResponse.status === 401) {
        console.error('🚫 useConversations - Unauthorized loading conversations');
        return;
      }
      if (!listResponse.ok) {
        const errData = await listResponse.json().catch(() => ({}));
        throw new Error(`Failed to list conversations: ${errData.error || listResponse.statusText} (${listResponse.status})`);
      }
      const listData: Conversation[] = await listResponse.json();

      if (!listData) {
        throw new Error(`API error listing conversations: ${listData || 'Invalid data format'}`);
      }

      // Sort conversations by updatedAt descending (most recent first)
      const sortedConversations = listData.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Only update state if the fetched data is different
      if (JSON.stringify(sortedConversations) !== JSON.stringify(conversationList)) {
        console.log("useConversations: Conversation list data changed, updating state.");
        setConversationList(sortedConversations);
        // If the list changes, re-evaluate auto-selection based on the new list
        if (sortedConversations.length > 0) {
          const latestConversationId = sortedConversations[0].conversationId;
          if (currentConversationIdMiddlePanel !== latestConversationId) {
            console.log(`useConversations: Auto-selecting latest conversation after list update: ${latestConversationId}`);
            setCurrentConversationIdMiddlePanel(latestConversationId);
          }
        } else {
          if (currentConversationIdMiddlePanel !== null) {
            console.log("useConversations: Conversation list empty after update, clearing current conversation ID.");
            setCurrentConversationIdMiddlePanel(null); 
          }
        }
      } else {
        console.log("useConversations: Conversation list data unchanged, skipping state update.");
        // Even if list is same, ensure currentConversationId is valid if not already set from a previous list load
        if (sortedConversations.length > 0 && currentConversationIdMiddlePanel === null) {
            const latestConversationId = sortedConversations[0].conversationId;
            console.log(`useConversations: Auto-selecting latest conversation (list unchanged, ID was null): ${latestConversationId}`);
            setCurrentConversationIdMiddlePanel(latestConversationId);
        } else if (sortedConversations.length === 0 && currentConversationIdMiddlePanel !== null) {
            console.log("useConversations: Conversation list empty (list unchanged, ID was not null), clearing current conversation ID.");
            setCurrentConversationIdMiddlePanel(null); 
        }
      }
    } catch (error: any) {
      console.error(`useConversations: Error loading conversation list for agent ${agentId}:`, error);
      setConversationError(`Failed to load conversation list: ${error.message}`);
      setConversationList([]);
      setCurrentConversationIdMiddlePanel(null); // Clear ID on error
    } finally {
      setIsLoadingConversationsMiddlePanel(false);
    }
  }, [handleLogout]);

  // --- Effect to Load Conversation List when Selected Agent Changes --- 
  useEffect(() => {
    if (selectedAgentIdMiddlePanel) {
      loadConversationListForAgent(selectedAgentIdMiddlePanel);
    } else {
      // If agent is deselected or token disappears, clear conversation state
      setConversationList([]);
      setCurrentConversationIdMiddlePanel(null); // This will trigger message clearing via the other effect
      setIsLoadingConversationsMiddlePanel(false);
      setConversationError(null);
    }
    // Only trigger when agent ID changes or token appears/disappears
  }, [selectedAgentIdMiddlePanel, loadConversationListForAgent]);

  // --- Define refreshConversationList with useCallback for stability ---
  const refreshConversationList = useCallback(async () => {
    if (selectedAgentIdMiddlePanel) {
      // loadConversationListForAgent is already a useCallback
      await loadConversationListForAgent(selectedAgentIdMiddlePanel);
    } else {
      // This matches the previous behavior for the "else" case of the ternary operator
      console.warn("Cannot refresh conversation list without selected agent.");
      // Optionally, you might want to clear the list here if that was the implicit behavior:
      // setConversationList([]);
      // setCurrentConversationId(null);
    }
  }, [selectedAgentIdMiddlePanel, loadConversationListForAgent]);

  // --- Function to Fetch Messages for a Specific Conversation ID --- 
  const fetchMessages = useCallback(async (convId: string) => {
    if (!convId) {
      console.warn("useConversations: No conversation ID provided to fetch messages.");
      setConversationError("Cannot fetch messages: Missing conversation ID.");
      setCurrentMessagesMiddlePanel([]);
      setIsLoadingMessagesMiddlePanel(false);
      return;
    }

    setIsLoadingMessagesMiddlePanel(true);
    setCurrentMessagesMiddlePanel([]); // Clear previous messages
    setConversationError(null); // Clear previous errors

    try {
      const messagesResponse = await fetch(`/api/messages/list?conversationId=${convId}`);

      if (messagesResponse.status === 401) {
        console.error('🚫 useConversations - Unauthorized loading messages.');
        return;
      }
      if (!messagesResponse.ok) {
        console.error('🚫 useConversations - Unauthorized loading messages');
        const errData = await messagesResponse.json().catch(() => ({}));
        throw new Error(`Failed to list messages: ${errData.error || messagesResponse.statusText} (${messagesResponse.status})`);
      }

      const messagesData: VercelMessage[] = await messagesResponse.json();

      if (!messagesData) {
        console.error('🚫 useConversations - Invalid message data received from API');
        if (currentMessagesMiddlePanel.length > 0) setCurrentMessagesMiddlePanel([]); // Clear if previously had messages
        throw new Error('Invalid message data received from API');
      }

      // Only update state if the fetched data is different
      if (JSON.stringify(messagesData) !== JSON.stringify(currentMessagesMiddlePanel)) {
        console.log(`useConversations: Messages data changed for ${convId}, updating state.`);
        setCurrentMessagesMiddlePanel(messagesData);
      } else {
        console.log(`useConversations: Messages data unchanged for ${convId}, skipping state update.`);
      }

    } catch (error: any) {
      console.error(`useConversations: Error loading messages for ${convId}:`, error);
      setConversationError(`Error loading messages: ${error.message}`);
      setCurrentMessagesMiddlePanel([]); // Ensure messages are empty on error
    } finally {
      setIsLoadingMessagesMiddlePanel(false);
    }
  }, [handleLogout]);

  // --- Effect to Fetch Messages when Current Conversation ID changes --- 
  useEffect(() => {
    if (currentConversationIdMiddlePanel) {
       fetchMessages(currentConversationIdMiddlePanel);
    } else {
      // If conversationId becomes null (e.g., agent change, list empty), clear messages
      setCurrentMessagesMiddlePanel([]);
      setIsLoadingMessagesMiddlePanel(false);
      // Don't clear conversationError here, might be relevant from list loading
    }
  }, [currentConversationIdMiddlePanel, fetchMessages]);

  // --- Handler to Create New Chat --- 
  const handleCreateNewChat = useCallback(async (): Promise<string | null> => { // Return new ID or null
    if (!selectedAgentIdMiddlePanel || !user) {
      console.warn("useConversations: Agent ID or user info missing for creating chat.");
      setConversationError("Cannot create chat: missing required information.");
      return null;
    }

    setIsCreatingConversationRightPanel(true);
    setConversationError(null);

    try {
      const newConversationId = crypto.randomUUID();
      const channelId = 'web';

      const requestBody: CreateConversationInput = {
        agentId: selectedAgentIdMiddlePanel,
        channelId: channelId,
        conversationId: newConversationId
      };

      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 401) {
        console.error('🚫 useConversations - Unauthorized creating conversation');
        return null;
      }

      const responseData: Conversation = await response.json();
      
      if (!responseData) {
        console.error('🚫 useConversations - Invalid conversation data received from API');
        throw new Error(`Failed to create conversation (HTTP ${response.status})`);
      }
      // Add to list (most recent first)
      setConversationList(prevList => [responseData, ...prevList]);
      // Set as current (will trigger message fetch effect)
      setCurrentConversationIdMiddlePanel(newConversationId);

      return newConversationId; // Return the ID

    } catch (error: any) {
      console.error("useConversations: Error creating new chat:", error);
      setConversationError(`Error creating chat: ${error.message}`);
      return null;
    } finally {
      setIsCreatingConversationRightPanel(false);
    }
  }, [selectedAgentIdMiddlePanel, user, handleLogout, loadConversationListForAgent]);

  // --- Simple setter for selecting a conversation ID --- 
  // This just updates the state; the message fetch effect handles the rest.
  const selectConversationId = useCallback((conversationId: string | null) => {
    console.log(`useConversations: Setting current conversation ID to: ${conversationId}`);
    if (conversationId !== currentConversationIdMiddlePanel) {
      setCurrentConversationIdMiddlePanel(conversationId);
    }
  }, [currentConversationIdMiddlePanel]);

  return {
    conversationList,
    currentConversationId: currentConversationIdMiddlePanel,
    selectConversationId,
    currentMessages: currentMessagesMiddlePanel,
    isLoadingConversations: isLoadingConversationsMiddlePanel,
    isLoadingMessages: isLoadingMessagesMiddlePanel,
    isCreatingConversation: isCreatingConversationRightPanel,
    conversationError,
    handleCreateNewChat,
    // Expose main loading function if manual refresh is desired for conversation list
    refreshConversationList, // Use the stable useCallback version
    fetchMessages,
  };
} 