'use client';

/**
 * MiddlePanel Component
 * 
 * This component represents the central area of the dashboard, displaying 
 * the active content based on the user's selection (chat, conversation list, memory, actions).
 * It relies on DashboardContext for agent, conversation, and message data.
 */

import { useEffect, useState, useRef } from 'react';
import { ChatInterface } from '@/components/dashboard';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

// Import panel components
import ConversationListPanel from './ConversationListPanel';
import MemoryPanel from './MemoryPanel';
import ActionsPanel from './ActionsPanel';

// Import shared types (Use monorepo package)
// import { Agent, Conversation, CreateConversationInput } from '@agent-base/types'; // Types used via context

/**
 * MiddlePanel Component
 * Renders the main content area based on the active view selected in the dashboard context.
 * Uses data fetched and managed by the DashboardContext.
 */
export default function MiddlePanel() {
  const {
    // User/Auth related
    user,
    authToken,
    getUserInitials,

    // Agent related
    agents,
    selectedAgentId,
    // isLoadingAgents, // Not directly used for rendering logic here
    agentError, // Might be used for general error display if needed

    // View related
    activeAgentView,
    setActiveAgentView, // Still needed if panels need to switch view

    // Conversation List related (from context)
    conversationList,
    isLoadingConversations,
    selectConversationId, // Use the context setter for ID only

    // Selected Conversation/Messages related (from context)
    currentConversationId,
    currentMessages,
    isLoadingMessages,
    isCreatingConversation, // Use context state
    conversationError, // Use context error state

    // Actions related (from context)
    handleCreateNewChat // Use context action
  } = useDashboard();

  // State for the currently selected conversation ID - REMOVED (use currentConversationId from context)
  // State for the list of conversations for the selected agent - REMOVED (use conversationList from context)
  // Loading state for fetching the conversation list - REMOVED (use isLoadingConversations from context)
  // State for the current conversation's messages (history fetched from API) - REMOVED (use currentMessages from context)
  // Loading state for fetching historical messages - REMOVED (use isLoadingMessages from context)
  // State to track if a new conversation creation is in progress - REMOVED (use isCreatingConversation from context)

  // Find the selected agent details for display
  const selectedAgent = agents && selectedAgentId
    ? agents.find(agent => agent.id === selectedAgentId)
    : undefined;

  // REMOVE Effect to fetch conversation list and messages
  // This logic is now handled within DashboardContext based on selectedAgentId and currentConversationId changes.
  // useEffect(() => { ... loadDataForAgent ... }, [selectedAgentId, authToken]);


  // REMOVE handleCreateNewChat - Use handleCreateNewChat from context directly if no extra logic needed here.
  // If MiddlePanel needs specific UI updates *during* creation not handled by context, keep a local loading state maybe.
  // For now, assume context handles all necessary state updates.
  // const handleCreateNewChat = async () => { ... };


  // REMOVE handleConversationSelect function
  // Logic is now: Panel calls context.selectConversationId -> Context updates ID -> Context useEffect fetches messages
  // const handleConversationSelect = async (conversationId: string) => { ... };


  /**
   * Renders the main content based on the activeAgentView context.
   * Displays loading states, error messages, or the appropriate panel/interface using context data.
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
        // Sub-case: Loading messages for the selected conversation (using context state)
        if (isLoadingMessages) {
             return (
                <div className="flex items-center justify-center h-full text-gray-400 p-4">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading messages...
                </div>
             );
        }
        // Sub-case: Error loading messages (using context state)
        if (conversationError) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center">
                   <p>Error loading messages:</p>
                   <p className="text-sm text-red-300 mt-1">{conversationError}</p>
                   {/* Maybe add a retry button later */}
                </div>
             );
        }
        // Sub-case: No conversation ID is selected (e.g., initial state or error)
        if (!currentConversationId) {
            // This might happen briefly during transitions or if list loading fails
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center">
                   <p>No conversation selected.</p>
                   <p className="text-sm text-gray-500">Select one from the list or create a new chat.</p>
                    <button
                        onClick={handleCreateNewChat} // Use context's creation handler
                        disabled={isCreatingConversation} // Use context's loading state
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm disabled:opacity-50"
                    >
                        {isCreatingConversation ? 'Creating...' : 'New Chat'}
                    </button>
                </div>
            );
        }
        // Sub-case: Render the chat interface with data from context
        // Use a key to force re-mount when agent or conversation changes
        // Pass messages from context via initialMessages prop
        return (
          <ChatInterface
            key={`${selectedAgentId}-${currentConversationId}`} // Key ensures re-render on conversation change
            agentId={selectedAgentId}
            conversationId={currentConversationId} // Pass current ID
            initialMessages={currentMessages} // Pass messages fetched by context
            userInitials={getUserInitials()}
            authToken={authToken}
            // TODO: Modify ChatInterface to potentially accept isLoading/error props if needed
            // isLoading={isLoadingMessages}
            // error={conversationError}
          />
        );

      case 'conversations':
        // Render the list of conversations for the selected agent using context data
        return (
          <ConversationListPanel
            conversationList={conversationList} // From context
            isLoadingConversations={isLoadingConversations} // From context
            historyError={conversationError} // Use context conversation error
            currentConversationId={currentConversationId} // From context
            onConversationSelect={selectConversationId} // Use context ID setter
          />
        );

      case 'memory':
         // Render the memory panel for the selected agent
        return <MemoryPanel selectedAgent={selectedAgent} />;

      case 'actions':
         // Render the actions panel
        if (!selectedAgentId) {
             return <div className="p-4 text-gray-500">Select an agent to view actions.</div>;
        }
        return (
           <ActionsPanel
              agentId={selectedAgentId}
              authToken={authToken}
            />
        );

      default:
        console.warn(`MiddlePanel: Unknown activeAgentView encountered: ${activeAgentView}`);
        return <div className="p-4 text-yellow-500">Unknown view selected. Please select a valid option.</div>;
    }
  };

  // Main return of the MiddlePanel component
  return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-850">
          {renderMainContent()}
      </div>
  );
} 