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

/**
 * RightPanel Component
 * Renders the agent header and chat interface based on the selected agent 
 * and conversation data from the DashboardContext.
 */
export default function RightPanel() {
    const {
        // Agent related
        agents,
        selectedAgentIdRightPanel: selectedAgentId,
        isLoadingAgents,

        // Conversation/Message related
        currentConversationIdRightPanel: currentConversationId,
        currentMessagesRightPanel: currentMessages,
        isLoadingMessagesRightPanel: isLoadingMessages,
        conversationError,
        isCreatingConversationRightPanel: isCreatingConversation,

        // Auth/User related
        getClerkUserInitials,

        // Actions
        createNewChatAndSetView,
        // selectConversationAndSetView, // This is for middle panel. Right panel might need its own or none.
        // For now, assume selecting a conversation for the right panel is handled differently,
        // e.g., only via "CreateNewChat" or if a separate "selectConversationRightPanelAndSetView" existed.
    } = useDashboard();

    // Find the full agent object based on the selected ID
    const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

    /**
     * Renders the content of the right panel based on loading states and selections.
     * @returns JSX.Element The content to display.
     */
    const renderContent = () => {
        // State 1: Loading agents initially
        // (isLoadingConversations is less relevant now as messages load separately)
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

        // State 2: No agent selected
        if (!selectedAgent) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
                    <MessageCircle className="h-12 w-12 mb-4 text-gray-600" />
                    <p className="text-xs">Select an agent from the list to view details and chat.</p>
                </div>
            );
        }

        // State 3: Agent selected, render header. Chat content depends on conversation state.
        return (
            <>
                {/* Always render header once agent is selected */}
                <AgentHeader
                    agent={selectedAgent}
                    onCreateNewChat={createNewChatAndSetView} // Use context's view setting create chat
                    isCreatingChat={isCreatingConversation} // Use context's loading state
                 />

                 {/* --- Chat Area Content --- */}
                 {(() => {
                    // Sub-state 3a: No conversation selected yet
                    if (!currentConversationId) {
                         return (
                             <div className="flex flex-col flex-1 items-center justify-center text-gray-500 p-4 text-center">
                                <MessageCircle className="h-10 w-10 mb-3 text-gray-600" />
                                <p className="text-xs">No conversation selected.</p>
                                <button
                                    onClick={createNewChatAndSetView} // Use context's view setting create chat
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

                    // Sub-state 3d: Conversation selected, messages loaded (or empty) - Render ChatInterface
                    return (
                        <ChatInterface
                            key={`${selectedAgentId}-${currentConversationId || 'new'}`} // Force re-mount on change, handle null currentConversationId for new chats
                            userInitials={getClerkUserInitials()}
                            agentId={selectedAgentId} // Already checked selectedAgent exists
                            agentFirstName={selectedAgent.firstName}
                            agentLastName={selectedAgent.lastName}
                            conversationId={currentConversationId} // Pass the selected ID for the right panel
                            initialMessages={currentMessages} // Pass messages for the right panel
                            // isLoading={isLoadingMessages} // Pass loading state for the right panel
                            // error={conversationError} // Pass error state for the right panel
                        />
                    );
                 })()}
            </>
        );
    };

    // Main container for the right panel
    return (
        <div className="w-full flex-shrink-0 border-l border-gray-700 overflow-hidden bg-gray-900 flex flex-col h-full">
            {renderContent()}
        </div>
    );
} 