'use client';

/**
 * MiddlePanel Component
 * 
 * This component represents the central area of the dashboard, displaying 
 * the active content based on the user's selection (chat, conversation list, memory, actions, webhook details).
 * It relies on DashboardContext for agent, conversation, message, and webhook data.
 */

import { useEffect, useState, useRef, useMemo } from 'react';
import { ChatInterface } from '@/components/dashboard';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
// Import Webhook type
import { Webhook, SearchApiToolResultItem } from '@agent-base/types'; 

// Import panel components
import ConversationListPanel from './ConversationListPanel';
import MemoryPanel from './MemoryPanel';
import ActionsPanel from './ActionsPanel';
// Import a new component for displaying webhook details
import WebhookDetailPanel from './WebhookDetailPanel'; 
// Import the ToolDetailPanel
import ToolDetailPanel from './ToolDetailPanel';

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
    agentError,

    // View related
    activeAgentView,
    setActiveAgentView,

    // Conversation List related (from context)
    conversationList,
    isLoadingConversationsMiddlePanel: isLoadingConversations,
    selectConversationAndSetView,

    // Selected Conversation/Messages related (from context)
    currentConversationIdMiddlePanel: currentConversationId,
    currentMessagesMiddlePanel: currentMessages,
    isLoadingMessagesMiddlePanel: isLoadingMessages,
    isCreatingConversationRightPanel: isCreatingConversation,
    conversationError,

    // Actions related (from context)
    createNewChatAndSetView,

    // Webhook related (from context)
    selectedWebhook,
    webhookError,
    isLoadingWebhooks,
    // Tool related (from context)
    selectedTool, // Consuming selectedTool from context

  } = useDashboard();

  const selectedAgent = agents && selectedAgentId
    ? agents.find(agent => agent.id === selectedAgentId)
    : undefined;

  // Filter conversationList based on selectedAgentId for the ConversationListPanel
  const filteredConversationListForPanel = useMemo(() => {
    if (!selectedAgentId) {
      return []; // No agent selected, so no conversations for the panel
    }
    // Ensure conversationList is sorted by createdAt descending if not already guaranteed by context
    return conversationList
        .filter(convo => convo.agentId === selectedAgentId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [conversationList, selectedAgentId]);

  const renderMainContent = () => {
    if (!selectedAgentId && (activeAgentView === 'chat' || activeAgentView === 'conversations' || activeAgentView === 'memory' || activeAgentView === 'actions')) {
      return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Please select an agent to view {activeAgentView}.</div>;
    }

    switch (activeAgentView) {
      case 'chat':
        if (!selectedAgentId || !selectedAgent) {
            return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Please select an agent to start chatting.</div>;
        }
        if (isLoadingMessages) {
             return (
                <div className="flex items-center justify-center h-full text-gray-400 p-4 text-xs">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading messages...
                </div>
             );
        }
        if (conversationError && !currentConversationId) { // Show general conversation error if no specific convo selected
             return (
                <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center text-xs">
                   <p>Error loading conversations:</p>
                   <p className="text-xs text-red-300 mt-1">{conversationError}</p>
                </div>
             );
        }
        if (!currentConversationId) {
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
        // If there's a conversationError specific to messages, ChatInterface will handle it.
        return (
          <ChatInterface
            key={`${selectedAgentId}-${currentConversationId}`} 
            agentId={selectedAgentId}
            agentFirstName={selectedAgent.firstName} 
            agentLastName={selectedAgent.lastName}   
            conversationId={currentConversationId ?? ''} 
            initialMessages={currentMessages} 
            userInitials={getClerkUserInitials()}
            isLoading={isLoadingMessages} 
            error={conversationError} // Pass conversationError which might be message specific by now
          />
        );

      case 'conversations':
        if (!selectedAgentId) {
            return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Please select an agent to view conversations.</div>;
        }
        return (
          <ConversationListPanel
            conversationList={filteredConversationListForPanel} // Pass the filtered list
            isLoadingConversations={isLoadingConversations} 
            historyError={conversationError} 
            currentConversationIdMiddlePanel={currentConversationId} 
            onConversationSelect={selectConversationAndSetView} 
          />
        );

      case 'memory':
        if (!selectedAgentId || !selectedAgent) {
             return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Please select an agent to view memory.</div>;
        }
        return <MemoryPanel selectedAgent={selectedAgent} />;

      case 'actions':
        if (!selectedAgentId) {
             return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Select an agent to view actions.</div>;
        }
        return (
           <ActionsPanel
              agentId={selectedAgentId}
            />
        );

      case 'webhookDetail':
        if (webhookError) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-red-400 p-4 text-center text-xs">
                   <p>Error related to webhooks:</p>
                   <p className="text-xs text-red-300 mt-1">{webhookError}</p>
                </div>
             );
        }
        if (!selectedWebhook) {
            return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Select a webhook from the sidebar to view its details.</div>;
        }
        return <WebhookDetailPanel webhook={selectedWebhook} onEventClick={selectConversationAndSetView} />;

      case 'toolDetail':
        if (!selectedTool) {
          return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-xs">Select a tool from the sidebar to view its details.</div>;
        }
        return <ToolDetailPanel searchApiTool={selectedTool} />;

      default:
        const exhaustiveCheck: never = activeAgentView;
        console.warn(`MiddlePanel: Unknown activeAgentView encountered: ${exhaustiveCheck}`);
        return <div className="p-4 text-yellow-500 text-xs">Unknown view selected. Please select a valid option.</div>;
    }
  };

  return (
      <div className="flex-1 flex flex-col min-h-0 bg-gray-850">
          {renderMainContent()}
      </div>
  );
} 