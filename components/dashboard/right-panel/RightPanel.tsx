'use client';

/**
 * RightPanel Component
 * 
 * This component represents the right-most panel of the dashboard, 
 * primarily displaying the Agent Header and the Chat Interface for the 
 * currently selected agent and conversation, using data from DashboardContext.
 */

import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import ChatInterface from './Chat/ChatInterface';
import AgentHeader from './AgentHeader'; // Assuming AgentHeader is in the same directory
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Agent } from '@agent-base/types'; // <-- Import Agent type

/**
 * RightPanel Component
 * Renders the agent header and chat interface based on the selected agent 
 * and conversation data from the DashboardContext.
 */
export default function RightPanel() {
    const {
        // Agent related
        agents,
        selectedAgentId, // Still needed for fallback when no conv is selected
        isLoadingAgents,

        // Conversation/Message related
        conversationList, // Need the full list to find conv details
        currentConversationId,
        currentMessages,
        isLoadingMessages,
        conversationError,
        isCreatingConversation,

        // Auth/User related
        getClerkUserInitials,

        // Actions
        createNewChatAndSetView,
        selectConversationAndSetView
    } = useDashboard();

    // --- Determine the agent and conversation to display --- 
    let agentToDisplay: Agent | undefined = undefined;
    let conversationToDisplayId: string | null = currentConversationId;

    // If a conversation ID is set (could be from sidebar or webhook event click)
    if (conversationToDisplayId) {
        // Use conversationId for lookup
        const currentConversation = conversationList.find(conv => conv.conversationId === conversationToDisplayId);
        if (currentConversation?.agentId) {
            agentToDisplay = agents.find(agent => agent.id === currentConversation.agentId);
        }
    }

    // Fallback: If no conversation is selected OR the selected conversation's agent wasn't found,
    // use the agent selected in the left sidebar (if any).
    if (!agentToDisplay && selectedAgentId) {
        agentToDisplay = agents.find(agent => agent.id === selectedAgentId);
        // If we fallback to the selectedAgent, ensure we are not showing a conversation 
        // that doesn't belong to this agent (edge case, context logic should prevent this)
        // Use conversationId for lookup
        if (conversationToDisplayId && agentToDisplay && conversationList.find(conv => conv.conversationId === conversationToDisplayId)?.agentId !== agentToDisplay.id) {
            conversationToDisplayId = null; // Reset conversation if it doesn't match the fallback agent
        }
    }

    /**
     * Renders the content of the right panel based on loading states and selections.
     * @returns JSX.Element The content to display.
     */
    const renderContent = () => {
        // State 1: Loading agents initially
        if (isLoadingAgents) {
            return (
                <div className="flex flex-col flex-1 p-4 space-y-3 animate-pulse">
                    {/* Skeleton for Header */}
                    <div className="flex items-center space-x-3">
                        <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-32 bg-gray-700" />
                            <Skeleton className="h-3 w-24 bg-gray-700" />
                        </div>
                    </div>
                    {/* Skeleton for Chat Area */}
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-sm text-gray-500">Loading agent...</p>
                        <p className="text-xs text-gray-500">Loading agent...</p>
                    </div>
                    <Skeleton className="h-10 w-full bg-gray-700" />
                </div>
            );
        }

        // State 2: No agent available for display (neither selected nor derived from conversation)
        if (!agentToDisplay) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
                    <MessageCircle className="h-12 w-12 mb-4 text-gray-600" />
                    <p className="text-xs">Select an agent or a conversation to view details.</p>
                </div>
            );
        }

        // State 3: Agent available, render header. Chat content depends on conversation state.
        return (
            <>
                {/* Render header with the determined agent */}
                <AgentHeader
                    agent={agentToDisplay} // Use derived agent
                    onCreateNewChat={createNewChatAndSetView}
                    isCreatingChat={isCreatingConversation}
                 />

                 {/* --- Chat Area Content --- */}
                 {(() => {
                    // Sub-state 3a: No conversation selected for the determined agent
                    if (!conversationToDisplayId) {
                         return (
                             <div className="flex flex-col flex-1 items-center justify-center text-gray-500 p-4 text-center">
                                <MessageCircle className="h-10 w-10 mb-3 text-gray-600" />
                                <p className="text-xs">No conversation selected for this agent.</p>
                                <button
                                    onClick={createNewChatAndSetView}
                                    disabled={isCreatingConversation}
                                    className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 mt-1"
                                >
                                    {isCreatingConversation ? 'Creating...' : 'Start a new chat.'}
                                </button>
                            </div>
                         );
                    }

                    // Sub-state 3b: Conversation selected, but messages are loading
                    if (isLoadingMessages) {
                         return (
                            <div className="flex flex-1 items-center justify-center text-gray-400 p-4">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span className="text-xs">Loading messages...</span>
                            </div>
                         );
                    }

                    // Sub-state 3c: Error loading messages for the selected conversation
                    if (conversationError) {
                         return (
                            <div className="flex flex-col flex-1 items-center justify-center text-red-400 p-4 text-center">
                               <AlertTriangle className="h-10 w-10 mb-3 text-red-500" />
                               <p className="font-medium text-xs">Error loading messages</p>
                               <p className="text-xs text-red-300/80 mt-1 max-w-xs">{conversationError}</p>
                               {/* Optionally add a retry mechanism later */}
                            </div>
                         );
                    }

                    // Sub-state 3d: Conversation selected, messages loaded - Render ChatInterface
                    return (
                        <ChatInterface
                            key={`${agentToDisplay.id}-${conversationToDisplayId}`} // Use derived agent/conv ID
                            userInitials={getClerkUserInitials()}
                            agentId={agentToDisplay.id} 
                            agentFirstName={agentToDisplay.firstName}
                            agentLastName={agentToDisplay.lastName}
                            conversationId={conversationToDisplayId} // Pass the determined ID
                            initialMessages={currentMessages} // Pass messages from context (context hook loads for currentConversationId)
                        />
                    );
                 })()}
            </>
        );
    };

    // Main container for the right panel
    return (
        <div className="w-80 flex-shrink-0 border-l border-gray-700 overflow-hidden bg-gray-900 flex flex-col h-full">
            {renderContent()}
        </div>
    );
} 