'use client';

/**
 * Main Dashboard Panel Component
 * Renders the central content area of the dashboard based on the selected view.
 * Receives agent, conversation, and message data, along with handlers, via props.
 */

import { useRef } from 'react'; // Removed useState, useEffect, useCallback
import { ChatInterface } from '@/components/dashboard/Chat/ChatInterface'; // Adjusted path potentially
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
// Removed Avatar imports if not used directly here
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, MemoryStick, ToyBrick, ArrowLeft, List, PlusSquare, Loader2 } from "lucide-react";
import { Message as VercelMessage } from 'ai/react';

// Import child components (assuming they moved to components/dashboard/)
import AgentHeader from '@/components/dashboard/AgentHeader'; // Adjusted path
import ConversationListPanel from '@/components/dashboard/ConversationListPanel'; // Adjusted path
import MemoryPanel from '@/components/dashboard/MemoryPanel'; // Adjusted path
import ActionsPanel from '@/components/dashboard/ActionsPanel'; // Adjusted path

// Import shared types 
import { Agent, Conversation } from '@agent-base/types';

// Interface for component props
interface MainDashboardPanelProps {
  selectedAgent: Agent | undefined;
  activeAgentView: 'chat' | 'conversations' | 'memory' | 'actions';
  currentConversationId: string | null;
  historyMessages: VercelMessage[];
  isLoadingHistory: boolean;
  conversationList: Conversation[];
  isLoadingConversations: boolean;
  agentError: string | null; // Renamed from historyError for clarity
  authToken: string | null; // Made nullable for safety
  userInitials: string;
  isCreatingConversation: boolean; // For AgentHeader button state
  
  // Handlers passed down
  handleConversationSelect: (conversationId: string) => void;
  handleCreateNewChat: () => Promise<void>;
}

/**
 * Renders the main content area (middle panel) of the dashboard.
 * Dynamically displays Chat, Conversations, Memory, or Actions based on activeAgentView.
 */
export default function MainDashboardPanel({
  selectedAgent,
  activeAgentView,
  currentConversationId,
  historyMessages,
  isLoadingHistory,
  conversationList,
  isLoadingConversations,
  agentError,
  authToken,
  userInitials,
  isCreatingConversation,
  handleConversationSelect,
  handleCreateNewChat
}: MainDashboardPanelProps) {

  const scrollAreaRef = useRef<HTMLDivElement>(null); // Keep ref if ChatInterface needs it internally or via prop

  // Find the selected agent details for display
  // const selectedAgent = agents.find(agent => agent.id === selectedAgentId); // This is now passed as a prop

  // Helper function to render the main content based on activeAgentView
  const renderMainContent = () => {
    // Use selectedAgent directly from props
    if (!selectedAgent) {
      return <div className="flex items-center justify-center h-full text-gray-500">Agent details not available.</div>;
    }
    
    // Ensure authToken exists before rendering components needing it
    if (!authToken) {
        return <div className="flex items-center justify-center h-full text-gray-500">Authentication token missing.</div>;
    }

    switch (activeAgentView) {
      case 'chat':
        if (!currentConversationId) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400">
                    {isLoadingHistory ? 
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading conversation...</> : 
                        "No active conversation. Select one or create a new chat."
                    }
                </div>
            );
        }
        return (
          <ChatInterface 
            key={`${selectedAgent.id}-${currentConversationId}`} // Key uses selectedAgent from props
            agentId={selectedAgent.id} // Pass ID from prop
            conversationId={currentConversationId}
            initialMessages={historyMessages} // Pass messages from props
            userInitials={userInitials} // Pass initials from props
            authToken={authToken} // Pass token from props
          />
        );
      case 'conversations':
        return (
          <ConversationListPanel 
            conversationList={conversationList} // Pass from props
            isLoadingConversations={isLoadingConversations} // Pass from props
            historyError={agentError} // Pass from props (check naming)
            currentConversationId={currentConversationId} // Pass from props
            onConversationSelect={handleConversationSelect} // Pass handler from props
          />
        );
      case 'memory':
        return <MemoryPanel selectedAgent={selectedAgent} />; // Pass agent from props
      case 'actions':
        // ActionsPanel fetches its own data based on agentId and authToken
        // It might not strictly need currentConversationId unless logic changes
        return (
           <ActionsPanel 
              agentId={selectedAgent.id} // Pass ID from prop
              authToken={authToken} // Pass token from prop
              // Removed onSelectConversation prop if ActionsPanel doesn't use it anymore
            />
        );
      default:
        return <div className="p-4">Select a view from the sidebar.</div>;
    }
  };

  // The component now renders the AgentHeader and the main content area
  // It doesn't need the outer flex container, assuming the parent layout provides it
  return (
    <>
      <AgentHeader 
        agent={selectedAgent} 
        onCreateNewChat={handleCreateNewChat} // Pass handler from props
        isCreatingChat={isCreatingConversation} // Pass state from props
      />

      <div className="flex-1 flex flex-col min-h-0">
        {/* Removed loading/error check for agents list - parent handles it */}
        {renderMainContent()}
      </div>
    </>
  );
} 