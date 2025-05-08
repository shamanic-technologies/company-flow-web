'use client';

import { useState, useCallback, useEffect } from 'react';
import { Conversation, CreateConversationInput, ServiceResponse } from '@agent-base/types';
import { Message as VercelMessage } from 'ai/react';
import { UserResource } from '@clerk/types';

interface UseConversationsProps {
  selectedAgentId: string | null;
  user: UserResource | null | undefined;
  handleLogout: () => void;
}

/**
 * @description Hook to manage conversation list, current conversation, messages, and related actions for the selected agent.
 * @param {UseConversationsProps} props - Selected agent ID, Clerk user object, and logout handler.
 * @returns An object containing conversation and message state, loading/error states, and related functions.
 */
export function useConversations({ selectedAgentId, user, handleLogout }: UseConversationsProps) {
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<VercelMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState<boolean>(false);
  const [conversationError, setConversationError] = useState<string | null>(null);

  // --- Function to load conversation LIST for the selected agent --- 
  const loadConversationListForAgent = useCallback(async (agentId: string) => {
    if (!agentId) {
        // This case should ideally be handled by the effect watching selectedAgentId
        console.log("useConversations: No agent ID provided to loadConversationListForAgent.");
        setConversationList([]);
        setCurrentConversationId(null);
        setIsLoadingConversations(false);
        setConversationError(null);
        return;
    }

    console.log(`useConversations: Loading conversation list for agent ${agentId}...`);
    setIsLoadingConversations(true);
    setConversationError(null);
    // Clear previous list and selected ID while loading new list
    setConversationList([]);
    setCurrentConversationId(null); 
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

      setConversationList(sortedConversations);

      // --- Auto-select the latest conversation --- 
      if (sortedConversations.length > 0) {
        const latestConversationId = sortedConversations[0].conversationId;
        // Setting the ID here will trigger the message fetching effect
        setCurrentConversationId(latestConversationId);
      } else {
        console.log(`useConversations: No conversations found for agent ${agentId}.`);
        // Ensure ID is null if no conversations exist
        setCurrentConversationId(null); 
      }
      // --- End auto-select --- 

    } catch (error: any) {
      console.error(`useConversations: Error loading conversation list for agent ${agentId}:`, error);
      setConversationError(`Failed to load conversation list: ${error.message}`);
      setConversationList([]);
      setCurrentConversationId(null); // Clear ID on error
    } finally {
      setIsLoadingConversations(false);
    }
  }, [handleLogout]);

  // --- Effect to Load Conversation List when Selected Agent Changes --- 
  useEffect(() => {
    if (selectedAgentId) {
      loadConversationListForAgent(selectedAgentId);
    } else {
      // If agent is deselected or token disappears, clear conversation state
      setConversationList([]);
      setCurrentConversationId(null); // This will trigger message clearing via the other effect
      setIsLoadingConversations(false);
      setConversationError(null);
    }
    // Only trigger when agent ID changes or token appears/disappears
  }, [selectedAgentId, loadConversationListForAgent]);


  // --- Function to Fetch Messages for a Specific Conversation ID --- 
  const fetchMessages = useCallback(async (convId: string) => {
    if (!convId) {
      console.warn("useConversations: No conversation ID provided to fetch messages.");
      setConversationError("Cannot fetch messages: Missing conversation ID.");
      setCurrentMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    setIsLoadingMessages(true);
    setCurrentMessages([]); // Clear previous messages
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
        throw new Error('Invalid message data received from API');
      }

      setCurrentMessages(messagesData);

    } catch (error: any) {
      console.error(`useConversations: Error loading messages for ${convId}:`, error);
      setConversationError(`Error loading messages: ${error.message}`);
      setCurrentMessages([]); // Ensure messages are empty on error
    } finally {
      setIsLoadingMessages(false);
    }
  }, [handleLogout]);

  // --- Effect to Fetch Messages when Current Conversation ID changes --- 
  useEffect(() => {
    if (currentConversationId) {
       fetchMessages(currentConversationId);
    } else {
      // If conversationId becomes null (e.g., agent change, list empty), clear messages
      setCurrentMessages([]);
      setIsLoadingMessages(false);
      // Don't clear conversationError here, might be relevant from list loading
    }
  }, [currentConversationId, fetchMessages]);

  // --- Handler to Create New Chat --- 
  const handleCreateNewChat = useCallback(async (): Promise<string | null> => { // Return new ID or null
    if (!selectedAgentId || !user) {
      console.warn("useConversations: Agent ID or user info missing for creating chat.");
      setConversationError("Cannot create chat: missing required information.");
      return null;
    }

    setIsCreatingConversation(true);
    setConversationError(null);

    try {
      const newConversationId = crypto.randomUUID();
      const channelId = 'web';

      const requestBody: CreateConversationInput = {
        agentId: selectedAgentId,
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
      setCurrentConversationId(newConversationId);

      return newConversationId; // Return the ID

    } catch (error: any) {
      console.error("useConversations: Error creating new chat:", error);
      setConversationError(`Error creating chat: ${error.message}`);
      return null;
    } finally {
      setIsCreatingConversation(false);
    }
  }, [selectedAgentId, user, handleLogout, loadConversationListForAgent]);

  // --- Simple setter for selecting a conversation ID --- 
  // This just updates the state; the message fetch effect handles the rest.
  const selectConversationId = useCallback((conversationId: string | null) => {
    console.log(`useConversations: Setting current conversation ID to: ${conversationId}`);
    if (conversationId !== currentConversationId) {
      setCurrentConversationId(conversationId);
    }
  }, [currentConversationId]);

  return {
    conversationList,
    currentConversationId,
    selectConversationId,
    currentMessages,
    isLoadingConversations,
    isLoadingMessages,
    isCreatingConversation,
    conversationError,
    handleCreateNewChat,
    // Expose main loading function if manual refresh is desired for conversation list
    refreshConversationList: selectedAgentId ? () => loadConversationListForAgent(selectedAgentId) : async () => { console.warn("Cannot refresh conversation list without selected agent."); },
  };
} 