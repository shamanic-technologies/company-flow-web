'use client';

/**
 * MiddlePanel Component
 * 
 * This component represents the central area of the dashboard, displaying 
 * the active content based on the user's selection (chat, conversation list, memory, actions).
 * It fetches and manages data related to the selected agent and conversation.
 */

import { useEffect, useState, useRef } from 'react';
import { ChatInterface } from '@/components/dashboard'; // Assuming ChatInterface is here
import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { Message as VercelMessage } from 'ai/react'; // Vercel AI SDK Message type

// Import panel components (Assuming they are moved/created here)
import ConversationListPanel from './ConversationListPanel'; 
import MemoryPanel from './MemoryPanel';
import ActionsPanel from './ActionsPanel'; 

// Import shared types (Use monorepo package)
import { Agent, Conversation, CreateConversationInput } from '@agent-base/types';

/**
 * MiddlePanel Component
 * Renders the main content area based on the active view selected in the dashboard.
 * Handles fetching messages, conversations, and managing the chat interface state.
 */
export default function MiddlePanel() {
  const { 
    user, 
    agents, // Get agents from context
    isLoadingAgents, // Get loading state from context - might not be needed here directly
    agentError, // Get agent error from context - might not be needed here directly
    selectedAgentId, // Get selected agent ID from context
    authToken, // Get auth token from context
    activeAgentView, // Get the active view from context
    getUserInitials,
    setActiveAgentView, // Need this to switch view after selecting conversation
    selectConversation, 
  } = useDashboard();
  
  // State for the current conversation's messages (history fetched from API)
  const [historyMessages, setHistoryMessages] = useState<VercelMessage[]>([]); 
  // Loading state for fetching historical messages
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  // State for the currently selected conversation ID
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  // State for the list of conversations for the selected agent
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  // Loading state for fetching the conversation list
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
  // State to track if a new conversation creation is in progress
  const [isCreatingConversation, setIsCreatingConversation] = useState(false); // Needed for potential UI feedback

  // Find the selected agent details for display (used in panels)
  // Ensure agents array is not empty and selectedAgentId is valid
  const selectedAgent = agents && selectedAgentId 
    ? agents.find(agent => agent.id === selectedAgentId) 
    : undefined; // Provide a default undefined value

  /**
   * Effect to fetch conversation list and messages when the selected agent changes.
   * It first tries to list conversations or create one if none exist.
   * Then, it fetches the messages for the most recent conversation.
   */
  useEffect(() => {
    // Guard clause: Do nothing if no agent is selected or auth token is missing
    if (!selectedAgentId || !authToken) {
      // Reset state when no agent is selected
      setHistoryMessages([]);
      setIsLoadingHistory(false);
      setCurrentConversationId(null);
      setConversationList([]); 
      setIsLoadingConversations(false);
      return;
    }

    /**
     * Asynchronously loads the conversation list and messages for the selected agent.
     */
    const loadDataForAgent = async () => {
      // Set loading states
      setIsLoadingHistory(true); 
      setIsLoadingConversations(true);
      // Reset current state before fetching new data
      setHistoryMessages([]);
      setCurrentConversationId(null);
      setConversationList([]); 
      console.log(`MiddlePanel: Loading data for agent ${selectedAgentId}...`);

      try {
        // STEP 1: Fetch conversation list or create a new one if none exist
        console.log(`MiddlePanel: Calling /api/conversations/list-or-create for agent ${selectedAgentId}`);
        const convListResponse = await fetch(`/api/conversations/list-or-create?agent_id=${selectedAgentId}`, { 
            headers: { 'Authorization': `Bearer ${authToken}` } 
        });
        
        // Check if the response is successful
        if (!convListResponse.ok) {
             // Try to parse error message from response body
             const errData = await convListResponse.json().catch(() => ({})); 
             // Throw an error with details
             throw new Error(`Failed to list or create conversations: ${errData.error || convListResponse.statusText}`);
        }
        
        // Parse the JSON response
        const convListData = await convListResponse.json();
        // Validate the response structure
        if (!convListData.success || !convListData.data) {
             throw new Error(`API error fetching conversations: ${convListData.error || 'Invalid data format'}`);
        }
        
        // Store the fetched conversation list
        const fetchedConversations: Conversation[] = convListData.data || [];
        setConversationList(fetchedConversations);
        console.log(`MiddlePanel: Fetched ${fetchedConversations.length} conversations.`);
        // Update loading state for conversations
        setIsLoadingConversations(false);

        // STEP 2: Select Conversation - Use the most recent one
        let conversationIdToUse: string | null = null;
        if (fetchedConversations.length > 0) {
            // Assume the list is sorted by updated_at descending
            conversationIdToUse = fetchedConversations[0].conversationId;
            console.log(`MiddlePanel: Selected conversation: ${conversationIdToUse}`);
        } else {
             // This case should ideally not be reached due to list-or-create logic
             console.error("MiddlePanel: Unexpected state - No conversations returned from list-or-create.");
             setIsLoadingHistory(false); // Stop history loading as there's no conversation
             return; // Exit the function
        }
        // Set the selected conversation ID in state
        setCurrentConversationId(conversationIdToUse);

        // STEP 3: Fetch messages for the selected conversation
        if (conversationIdToUse) {
            console.log(`MiddlePanel: Calling /api/messages/list for conversation ${conversationIdToUse}`);
            const messagesResponse = await fetch(`/api/messages/list?conversation_id=${conversationIdToUse}`, { 
                headers: { 'Authorization': `Bearer ${authToken}` } 
            });
             
            // Check if the message fetch response is successful
             if (!messagesResponse.ok) { 
                 // Try to parse error message
                 const errData = await messagesResponse.json().catch(() => ({})); 
                 // Throw detailed error
                 throw new Error(`Failed to list messages: ${errData.error || messagesResponse.statusText}`); 
             }
             
             // Parse message data
             const messagesData = await messagesResponse.json();
             // Validate message data structure
             if (!messagesData.success || !messagesData.data) {
                 throw new Error(`API error listing messages: ${messagesData.error || 'Invalid data format'}`);
             }

             // Set the fetched messages into state
             // Ensure the data conforms to VercelMessage[] type if necessary, 
             // or adjust ChatInterface to accept the API's message format.
             // Assuming API returns compatible format for now.
             setHistoryMessages(messagesData.data); 
             console.log(`MiddlePanel: Loaded ${messagesData.data.length} messages for conversation ${conversationIdToUse}.`);
        } else {
             // Handle the case where no conversation ID was determined (should not happen with current logic)
             console.warn("MiddlePanel: No conversation ID to fetch messages for.");
             setHistoryMessages([]); // Ensure messages are cleared
        }

      } catch (error: any) { 
        // Log any errors during the data loading process
        console.error(`MiddlePanel: Error loading data for agent ${selectedAgentId}:`, error);
        // Reset loading states on error
        setIsLoadingHistory(false);
        setIsLoadingConversations(false);
        // Potentially update UI to show an error message
      } finally {
          // Ensure loading state for history is always turned off eventually
           setIsLoadingHistory(false); 
      }
    };
    
    // Execute the data loading function
    loadDataForAgent();

  // Dependency array for the effect: re-run when agent or token changes
  }, [selectedAgentId, authToken]);

  /**
   * Handles the creation of a new chat conversation.
   * Calls the '/api/conversations/create' endpoint.
   * Updates the conversation list and sets the new conversation as active.
   */
  const handleCreateNewChat = async () => {
    // Guard clause: Ensure necessary data is present
    if (!selectedAgentId || !authToken || !user) {
      console.error("MiddlePanel: Cannot create new chat - Missing agent ID, auth token, or user info.");
      return;
    }

    console.log(`MiddlePanel: Starting new chat creation for agent ${selectedAgentId}...`);
    setIsCreatingConversation(true); // Indicate loading state

    try {
      // --- REAL API CALL --- 
      // Generate a new UUID for the conversation locally
      const newConversationId = crypto.randomUUID();
      const channelId = 'web'; // Default channel for playground/dashboard

      // Prepare the request body according to the CreateConversationInput type
      const requestBody: CreateConversationInput = {
          agentId: selectedAgentId,
          channelId: channelId,
          conversationId: newConversationId // Send the generated ID
      };

      // Make the POST request to the create conversation endpoint
      const response = await fetch('/api/conversations/create', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}` // Include auth token
          },
          body: JSON.stringify(requestBody) // Send the data as JSON
      });

      // Parse the response JSON
      const responseData = await response.json();

      // Check for API errors or unsuccessful response
      if (!response.ok || !responseData.success) {
          const errorMsg = responseData?.error || `HTTP error ${response.status}`;
          console.error("MiddlePanel: API call to create conversation failed:", errorMsg, responseData);
          // Throw an error to be caught below
          throw new Error(errorMsg || 'Failed to create conversation. Please try again.');
      }
      
      console.log("MiddlePanel: API success. New conversation created:", responseData);
      // Assuming the API returns the newly created conversation object in responseData.data
      const newConversation: Conversation = responseData.data; 

      // --- Update State ---
      // Add the new conversation to the beginning of the list
      setConversationList(prevList => [newConversation, ...prevList]); 
      // Set the new conversation ID as the current one
      setCurrentConversationId(newConversation.conversationId); 
      // Clear existing messages as it's a new chat
      setHistoryMessages([]); 
      
      // Switch the main view to the chat interface
      setActiveAgentView('chat'); 

    } catch (error: any) {
      // Log any errors that occurred during the process
      console.error("MiddlePanel: Error creating new chat:", error);
      // Potentially show an error message to the user
    } finally {
      // Ensure the loading indicator is turned off
      setIsCreatingConversation(false); 
    }
  };

  /**
   * Handles the selection of a conversation from the ConversationListPanel.
   * Fetches the messages for the selected conversation and updates the state.
   * Switches the active view to 'chat'.
   * @param conversationId The ID of the conversation that was selected.
   */
  const handleConversationSelect = async (conversationId: string) => {
      // Guard clause: Ensure token and ID are present
      if (!authToken || !conversationId) {
          console.warn("MiddlePanel: Conversation selection cancelled - missing token or ID.");
          return;
      }
      console.log(`MiddlePanel: Selecting conversation ${conversationId}`);
      // Set loading state while fetching messages
      setIsLoadingHistory(true);
      // Update the current conversation ID
      setCurrentConversationId(conversationId);
      // Clear previous messages immediately
      setHistoryMessages([]); 
      
      try {
          // Fetch messages for the newly selected conversation
          const messagesResponse = await fetch(`/api/messages/list?conversation_id=${conversationId}`, { 
              headers: { 'Authorization': `Bearer ${authToken}` } 
          });
          
          // Check for network or server errors
          if (!messagesResponse.ok) {
              throw new Error(`Failed to list messages (${messagesResponse.status})`);
          }
          
          // Parse the response data
          const messagesData = await messagesResponse.json();
          
          // Validate the response data format
          if (!messagesData.success || !messagesData.data) {
              throw new Error(messagesData.error || 'Invalid message data received from API');
          }
          
          // Update the history messages state with the fetched data
          // Assuming API returns data compatible with VercelMessage[]
          setHistoryMessages(messagesData.data);
          console.log(`MiddlePanel: Loaded ${messagesData.data.length} messages for ${conversationId}.`);
          
      } catch (error) {
          // Log errors during message fetching
          console.error(`MiddlePanel: Error loading messages for ${conversationId}:`, error);
          // Ensure messages are cleared on error to avoid displaying stale data
          setHistoryMessages([]); 
          // TODO: Implement user-facing error display
      } finally {
          // Always turn off loading state
          setIsLoadingHistory(false);
      }
      
      // Switch the view to the chat interface after selecting a conversation
      setActiveAgentView('chat'); 
  };


  /**
   * Renders the main content based on the activeAgentView context.
   * Displays loading states, error messages, or the appropriate panel/interface.
   * @returns JSX.Element The content to display in the middle panel.
   */
  const renderMainContent = () => {
    // Case 1: No agent selected
    if (!selectedAgentId || !selectedAgent) {
      // Instruct the user to select an agent if none is chosen
      return <div className="flex items-center justify-center h-full text-gray-500 p-4">Please select an agent to begin.</div>;
    }

    // Case 2: Determine content based on the active view
    switch (activeAgentView) {
      case 'chat':
        // Sub-case: Loading history for the chat view
        if (isLoadingHistory) {
             return (
                <div className="flex items-center justify-center h-full text-gray-400 p-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading conversation...
                </div>
             );
        }
        // Sub-case: No conversation ID is set (e.g., after agent switch before data loads)
        if (!currentConversationId) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400 p-4">
                   Select a conversation or create a new chat to start.
                </div>
            );
        }
        // Sub-case: Render the chat interface
        // Use a key to force re-mount when agent or conversation changes
        return (
          <ChatInterface 
            key={`${selectedAgentId}-${currentConversationId}`} 
            agentId={selectedAgentId}
            conversationId={currentConversationId}
            initialMessages={historyMessages} // Pass fetched historical messages
            userInitials={getUserInitials()} // Get user initials from context helper
            authToken={authToken} // Pass auth token for API calls within ChatInterface
          />
        );

      case 'conversations':
        // Render the list of conversations for the selected agent
        return (
          <ConversationListPanel 
            // Pass necessary props to the conversation list panel
            conversationList={conversationList} 
            isLoadingConversations={isLoadingConversations}
            // Pass potential errors if needed (using agentError for now, might need specific error state)
            historyError={agentError} // TODO: Refine error handling/passing 
            currentConversationId={currentConversationId} 
            onConversationSelect={selectConversation} // USE THE NEW FUNCTION HERE
          />
        );

      case 'memory':
         // Render the memory panel for the selected agent
        return <MemoryPanel selectedAgent={selectedAgent} />; // Pass the full agent object

      case 'actions':
         // Render the actions panel
         // Guard clause: Ensure an agent is selected before rendering actions
        if (!selectedAgentId) {
             return <div className="p-4 text-gray-500">Select an agent to view actions.</div>;
        }
        // Render the ActionsPanel, passing required props
        return (
           <ActionsPanel 
              agentId={selectedAgentId}
              authToken={authToken} // Pass token if actions need to make authenticated calls
            />
        );

      default:
        // Fallback case for unknown view state
        console.warn(`MiddlePanel: Unknown activeAgentView encountered: ${activeAgentView}`);
        return <div className="p-4 text-yellow-500">Unknown view selected. Please select a valid option.</div>;
    }
  };

  // Main return of the MiddlePanel component
  // Renders the content determined by renderMainContent()
  // Added a container div for potential future styling/layout needs within the panel
  return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-850"> 
          {renderMainContent()}
      </div>
  ); 
} 