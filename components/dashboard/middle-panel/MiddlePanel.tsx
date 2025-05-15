'use client';

/**
 * MiddlePanel Component
 * 
 * This component represents the central area of the dashboard, displaying 
 * the active content based on the user's selection (chat, conversation list, memory, actions, webhook details).
 * It relies on DashboardContext for agent, conversation, message, and webhook data.
 */

import { useEffect, useState, useRef } from 'react';
import { ChatInterface } from '@/components/dashboard';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
// Import Webhook type
import { Webhook } from '@agent-base/types'; 

// Import panel components
import ConversationListPanel from './ConversationListPanel';
import MemoryPanel from './MemoryPanel';
import ActionsPanel from './ActionsPanel';
// Import a new component for displaying webhook details
import WebhookDetailPanel from './WebhookDetailPanel'; 

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
    clerkUser,
    getClerkUserInitials,

    // Agent related
    agents,
    selectedAgentIdMiddlePanel: selectedAgentId,
    // isLoadingAgents, // Not directly used for rendering logic here
    agentError, // Might be used for general error display if needed

    // View related
    activeAgentView,
    setActiveAgentView, // Still needed if panels need to switch view

    // Conversation List related (from context)
    conversationList,
    isLoadingConversationsMiddlePanel: isLoadingConversations,
    selectConversationAndSetView,

    // Selected Conversation/Messages related (from context)
    currentConversationIdMiddlePanel: currentConversationId,
    currentMessagesMiddlePanel: currentMessages,
    isLoadingMessagesMiddlePanel: isLoadingMessages,
    isCreatingConversationRightPanel: isCreatingConversation, // Use context state
    conversationError, // Use context error state

    // Actions related (from context)
    createNewChatAndSetView,

    // Webhook related (from context)
    selectedWebhook, // Get the selected webhook
    webhookError, // Get webhook specific error
    isLoadingWebhooks // Get webhook loading state (might be useful)
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
    // Case 1: No agent selected (only relevant for agent-specific views)
    if (!selectedAgentId && (activeAgentView === 'chat' || activeAgentView === 'conversations' || activeAgentView === 'memory' || activeAgentView === 'actions')) {
      // Instruct the user to select an agent if none is chosen and view requires it
      return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Please select an agent to view {activeAgentView}.</div>;
    }

    // Case 2: Determine content based on the active view
    switch (activeAgentView) {
      case 'chat':
        // Ensure an agent IS selected for chat
        if (!selectedAgentId || !selectedAgent) {
            return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Please select an agent to start chatting.</div>;
        }
        // Sub-case: Loading messages for the selected conversation (using context state)
        if (isLoadingMessages) {
             return (
                <div className="flex items-center justify-center h-full text-gray-400 p-4 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading messages...
                </div>
             );
        }
        // Sub-case: Error loading messages (using context state)
        if (conversationError) {
             return (
                <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center text-xs">
                   <p>Error loading messages:</p>
                   <p className="text-xs text-red-300 mt-1">{conversationError}</p>
                   {/* Maybe add a retry button later */}
                </div>
             );
        }
        // Sub-case: No conversation ID is selected (e.g., initial state or error)
        if (!currentConversationId) {
            // This might happen briefly during transitions or if list loading fails
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center text-xs">
                   <p>No conversation selected.</p>
                   <p className="text-xs text-gray-500">Select one from the list or create a new chat.</p>
                    <button
                        onClick={createNewChatAndSetView}
                        disabled={isCreatingConversation}
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-xs disabled:opacity-50"
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
            agentFirstName={selectedAgent.firstName} // Pass agent first name
            agentLastName={selectedAgent.lastName}   // Pass agent last name
            conversationId={currentConversationId ?? ''} // Pass current ID, handle null case
            initialMessages={currentMessages} // Pass messages fetched by context
            userInitials={getClerkUserInitials()}
            // Pass loading/error state from context if ChatInterface is updated to use them
            isLoading={isLoadingMessages} 
            error={conversationError}     
          />
        );

      case 'conversations':
        // Ensure an agent IS selected for conversations
        if (!selectedAgentId) {
            return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Please select an agent to view conversations.</div>;
        }
        // Render the list of conversations for the selected agent using context data
        return (
          <ConversationListPanel
            conversationList={conversationList} // From context
            isLoadingConversations={isLoadingConversations} // From context
            historyError={conversationError} // Use context conversation error
            currentConversationId={currentConversationId} // From context
            onConversationSelect={selectConversationAndSetView} // CORRECTED: Use context's view setting wrapper
          />
        );

      case 'memory':
        // Ensure an agent IS selected for memory
        if (!selectedAgentId || !selectedAgent) {
             return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Please select an agent to view memory.</div>;
        }
         // Render the memory panel for the selected agent
        return <MemoryPanel selectedAgent={selectedAgent} />;

      case 'actions':
        // Ensure an agent IS selected for actions
        if (!selectedAgentId) {
             return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Select an agent to view actions.</div>;
        }
        return (
           <ActionsPanel
              agentId={selectedAgentId}
            />
        );

      // --- New Case: Webhook Detail View ---
      case 'webhookDetail':
        // Check for webhook-specific errors
        if (webhookError) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center text-xs">
                   <p>Error related to webhooks:</p>
                   <p className="text-xs text-red-300 mt-1">{webhookError}</p>
                   {/* Maybe add a retry button for fetchUserWebhooks later */}
                </div>
             );
        }
        // Check if a webhook is selected
        if (!selectedWebhook) {
            return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Select a webhook from the sidebar to view its details.</div>;
        }
        // Render the webhook details panel
        return <WebhookDetailPanel webhook={selectedWebhook} onEventClick={selectConversationAndSetView} />; 

      default:
        // Handle potential unknown view state
        const exhaustiveCheck: never = activeAgentView;
        console.warn(`MiddlePanel: Unknown activeAgentView encountered: ${exhaustiveCheck}`);
        return <div className="p-4 text-yellow-500 text-xs">Unknown view selected. Please select a valid option.</div>;
    }
  };

  // Main return of the MiddlePanel component
  return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-850">
          {renderMainContent()}
      </div>
  );
} 