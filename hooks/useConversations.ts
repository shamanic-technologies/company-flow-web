'use client';

import { useState, useCallback, useEffect } from 'react';
import { Conversation, CreateConversationInput, ServiceResponse, PlatformUser } from '@agent-base/types';
import { Message as VercelMessage } from 'ai/react';

interface UseConversationsProps {
  authToken: string;
  selectedAgentId: string | null;
  user: PlatformUser | null; // Needed for creating new conversations
  handleLogout: () => void;
}

/**
 * @description Hook to manage conversation list, current conversation, messages, and related actions for the selected agent.
 * @param {UseConversationsProps} props - Auth token, selected agent ID, user object, and logout handler.
 * @returns An object containing conversation and message state, loading/error states, and related functions.
 */
export function useConversations({ authToken, selectedAgentId, user, handleLogout }: UseConversationsProps) {
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<VercelMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState<boolean>(false);
  const [conversationError, setConversationError] = useState<string | null>(null);

  // --- Function to load conversation LIST for the selected agent --- 
  const loadConversationListForAgent = useCallback(async (agentId: string) => {
    if (!authToken) {
      console.warn("useConversations: Auth token missing, cannot load conversation list.");
      setConversationError("Authentication required.");
      setConversationList([]);
      setCurrentConversationId(null); 
      setIsLoadingConversations(false);
      return;
    }
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
      // Switched to /api/conversations/list as per original context logic
      const convListResponse = await fetch(`/api/conversations/list?agentId=${agentId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (convListResponse.status === 401) {
        console.error('🚫 useConversations - Unauthorized loading conversations, logging out.');
        handleLogout();
        return;
      }
      if (!convListResponse.ok) {
        const errData = await convListResponse.json().catch(() => ({}));
        throw new Error(`Failed to list conversations: ${errData.error || convListResponse.statusText} (${convListResponse.status})`);
      }
      const convListData: ServiceResponse<Conversation[]> = await convListResponse.json();
      if (!convListData.success || !Array.isArray(convListData.data)) {
        throw new Error(`API error listing conversations: ${convListData.error || 'Invalid data format'}`);
      }

      const fetchedConversations: Conversation[] = convListData.data;
      // Sort conversations by updatedAt descending (most recent first)
      const sortedConversations = fetchedConversations.sort((a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
      );

      setConversationList(sortedConversations);
      console.log(`useConversations: Fetched ${sortedConversations.length} conversations for agent ${agentId}.`);

      // --- Auto-select the latest conversation --- 
      if (sortedConversations.length > 0) {
        const latestConversationId = sortedConversations[0].conversationId;
        console.log(`useConversations: Setting current conversation ID to latest: ${latestConversationId}`);
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
  }, [authToken, handleLogout]);

  // --- Effect to Load Conversation List when Selected Agent Changes --- 
  useEffect(() => {
    if (selectedAgentId && authToken) {
      console.log(`useConversations (Effect): Selected agent changed to ${selectedAgentId}, loading conversations.`);
      loadConversationListForAgent(selectedAgentId);
    } else {
      // If agent is deselected or token disappears, clear conversation state
      console.log(`useConversations (Effect): Agent deselected or token missing, clearing conversation state.`);
      setConversationList([]);
      setCurrentConversationId(null); // This will trigger message clearing via the other effect
      setIsLoadingConversations(false);
      setConversationError(null);
    }
    // Only trigger when agent ID changes or token appears/disappears
  }, [selectedAgentId, authToken, loadConversationListForAgent]);


  // --- Function to Fetch Messages for a Specific Conversation ID --- 
  const fetchMessages = useCallback(async (convId: string) => {
    if (!authToken) {
      console.warn("useConversations: Auth token missing, cannot fetch messages.");
      setConversationError("Authentication required to load messages.");
      setCurrentMessages([]);
      setIsLoadingMessages(false);
      return;
    }

    console.log(`useConversations: Fetching messages for conversation ${convId}`);
    setIsLoadingMessages(true);
    setCurrentMessages([]); // Clear previous messages
    setConversationError(null); // Clear previous errors

    try {
      const messagesResponse = await fetch(`/api/messages/list?conversation_id=${convId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });

      if (messagesResponse.status === 401) {
        console.error('🚫 useConversations - Unauthorized loading messages, logging out.');
        handleLogout();
        return;
      }
      if (!messagesResponse.ok) {
        const errData = await messagesResponse.json().catch(() => ({}));
        throw new Error(`Failed to list messages: ${errData.error || messagesResponse.statusText} (${messagesResponse.status})`);
      }

      const messagesData: ServiceResponse<VercelMessage[]> = await messagesResponse.json();

      if (!messagesData.success || !Array.isArray(messagesData.data)) {
        throw new Error(messagesData.error || 'Invalid message data received from API');
      }

      setCurrentMessages(messagesData.data);
      console.log(`useConversations: Loaded ${messagesData.data.length} messages for ${convId}.`);

    } catch (error: any) {
      console.error(`useConversations: Error loading messages for ${convId}:`, error);
      setConversationError(`Error loading messages: ${error.message}`);
      setCurrentMessages([]); // Ensure messages are empty on error
    } finally {
      setIsLoadingMessages(false);
    }
  }, [authToken, handleLogout]);

  // --- Effect to Fetch Messages when Current Conversation ID changes --- 
  useEffect(() => {
    if (currentConversationId && authToken) {
       console.log(`useConversations (Effect): Current conversation ID changed to ${currentConversationId}, fetching messages.`);
       fetchMessages(currentConversationId);
    } else {
      // If conversationId becomes null (e.g., agent change, list empty), clear messages
      console.log(`useConversations (Effect): Current conversation ID is null, clearing messages.`);
      setCurrentMessages([]);
      setIsLoadingMessages(false);
      // Don't clear conversationError here, might be relevant from list loading
    }
  }, [currentConversationId, authToken, fetchMessages]);

  // --- Handler to Create New Chat --- 
  const handleCreateNewChat = useCallback(async (): Promise<string | null> => { // Return new ID or null
    if (!selectedAgentId || !authToken || !user) {
      console.error("useConversations: Cannot create new chat - Missing agent ID, auth token, or user info.");
      setConversationError("Cannot create new chat: Missing required information.");
      return null;
    }

    console.log(`useConversations: Starting new chat creation for agent ${selectedAgentId}...`);
    setIsCreatingConversation(true);
    setConversationError(null);

    try {
      const newConversationId = crypto.randomUUID();
      const channelId = 'web'; // Hardcoded as before

      const requestBody: CreateConversationInput = {
        agentId: selectedAgentId,
        channelId: channelId,
        conversationId: newConversationId
      };

      const response = await fetch('/api/conversations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify(requestBody)
      });

      if (response.status === 401) {
        console.error('🚫 useConversations - Unauthorized creating conversation, logging out.');
        handleLogout();
        return null;
      }

      const responseData: ServiceResponse<Conversation> = await response.json();
      if (!response.ok || !responseData.success || !responseData.data) {
        throw new Error(responseData?.error || `Failed to create conversation (HTTP ${response.status})`);
      }

      console.log("useConversations: New conversation created successfully:", responseData.data);
      const newConversation = responseData.data;

      // Add to list (most recent first)
      setConversationList(prevList => [newConversation, ...prevList]);
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
  }, [selectedAgentId, authToken, user, handleLogout]);

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