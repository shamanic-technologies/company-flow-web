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
        selectedAgentId,
        isLoadingAgents,

        // Conversation/Message related
        currentConversationId,
        // isLoadingConversations, // Context loads list+initial messages together now
        currentMessages,
        isLoadingMessages,
        conversationError,
        isCreatingConversation, // For button state

        // Auth/User related
        authToken,
        getUserInitials,

        // Actions
        handleCreateNewChat,
        selectConversationId // Needed if we allow creating chat from here
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
                    <p className="text-sm">Select an agent from the list to view details and chat.</p>
                </div>
            );
        }

        // State 3: Agent selected, render header. Chat content depends on conversation state.
        return (
            <>
                {/* Always render header once agent is selected */}
                <AgentHeader
                    agent={selectedAgent}
                    onCreateNewChat={handleCreateNewChat} // Use context's create chat
                    isCreatingChat={isCreatingConversation} // Use context's loading state
                 />

                 {/* --- Chat Area Content --- */}
                 {(() => {
                    // Sub-state 3a: No conversation selected yet
                    if (!currentConversationId) {
                         return (
                             <div className="flex flex-col flex-1 items-center justify-center text-gray-500 p-4 text-center">
                                <MessageCircle className="h-10 w-10 mb-3 text-gray-600" />
                                <p className="text-sm">No conversation selected.</p>
                                <button
                                    onClick={handleCreateNewChat}
                                    disabled={isCreatingConversation}
                                    className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 mt-1"
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
                                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading messages...
                            </div>
                         );
                    }

                    // Sub-state 3c: Error loading messages for the selected conversation
                    if (conversationError) {
                         return (
                            <div className="flex flex-col flex-1 items-center justify-center text-red-400 p-4 text-center">
                               <AlertTriangle className="h-10 w-10 mb-3 text-red-500" />
                               <p className="font-medium">Error loading messages</p>
                               <p className="text-xs text-red-300/80 mt-1 max-w-xs">{conversationError}</p>
                               {/* Optionally add a retry mechanism later */}
                            </div>
                         );
                    }

                    // Sub-state 3d: Conversation selected, messages loaded (or empty) - Render ChatInterface
                    return (
                        <ChatInterface
                            key={`${selectedAgentId}-${currentConversationId}`} // Force re-mount on change
                            authToken={authToken}
                            userInitials={getUserInitials()}
                            agentId={selectedAgentId} // Already checked selectedAgent exists
                            conversationId={currentConversationId} // Pass the selected ID
                            initialMessages={currentMessages} // Pass messages from context
                            // TODO: Update ChatInterface props if needed
                            // isLoading={isLoadingMessages}
                            // error={conversationError}
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