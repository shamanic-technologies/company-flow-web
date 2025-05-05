'use client';

/**
 * RightPanel Component
 * 
 * This component represents the right-most panel of the dashboard, 
 * primarily displaying the Agent Header and the Chat Interface for the 
 * currently selected agent and conversation.
 */

import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import ChatInterface from './Chat/ChatInterface';
import AgentHeader from './AgentHeader'; // Assuming AgentHeader is in the same directory
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle } from 'lucide-react';

/**
 * RightPanel Component
 * Renders the agent header and chat interface based on the selected agent 
 * and conversation from the DashboardContext.
 */
export default function RightPanel() {
    const {
        agents,
        selectedAgentId,
        isLoadingAgents,
        currentConversationId,
        isLoadingConversations, // Use context loading state
        handleCreateNewChat, // Get create chat handler from context
        isCreatingConversation, // Get loading state for chat creation
        authToken,
        getUserInitials
    } = useDashboard();

    // Find the full agent object based on the selected ID
    const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

    /**
     * Renders the content of the right panel based on loading states and selections.
     * @returns JSX.Element The content to display.
     */
    const renderContent = () => {
        // Loading state: Waiting for agents or initial conversation load
        if (isLoadingAgents || (selectedAgentId && isLoadingConversations && !currentConversationId)) {
            return (
                <div className="flex flex-col flex-1 p-4 space-y-3">
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
                        <p className="text-sm text-gray-500">Loading chat...</p>
                    </div>
                    <Skeleton className="h-10 w-full bg-gray-700" />
                </div>
            );
        }

        // No agent selected state
        if (!selectedAgent) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
                    <MessageCircle className="h-12 w-12 mb-4 text-gray-600" />
                    <p className="text-sm">Select an agent from the list to start chatting.</p>
                </div>
            );
        }
        
        // Agent selected, but no conversation loaded/selected yet (e.g., after agent switch)
        // We show the header, but indicate no active chat.
        if (!currentConversationId) {
            return (
                 <div className="flex flex-col h-full">
                     <AgentHeader 
                        agent={selectedAgent} 
                        onCreateNewChat={handleCreateNewChat} 
                        isCreatingChat={isCreatingConversation} 
                     />
                     <div className="flex flex-col flex-1 items-center justify-center text-gray-500 p-4 text-center">
                        <MessageCircle className="h-10 w-10 mb-3 text-gray-600" />
                        <p className="text-sm">Select a conversation or</p>
                        <button 
                            onClick={handleCreateNewChat}
                            disabled={isCreatingConversation}
                            className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 mt-1"
                        >
                            {isCreatingConversation ? 'Creating...' : 'start a new chat.'}
                        </button>
                    </div>
                 </div>
            );
        }

        // Agent and Conversation are selected - Render Header and ChatInterface
        return (
            <>
                <AgentHeader 
                    agent={selectedAgent} 
                    onCreateNewChat={handleCreateNewChat} 
                    isCreatingChat={isCreatingConversation} 
                />
                <ChatInterface
                    key={`${selectedAgentId}-${currentConversationId}`} // Force re-mount on change
                    authToken={authToken}
                    userInitials={getUserInitials()}
                    agentId={selectedAgentId}
                    conversationId={currentConversationId}
                    // initialMessages might be handled internally by useChat based on conversationId
                />
            </>
        );
    };

    return (
        <div className="w-80 flex-shrink-0 border-l border-gray-700 overflow-hidden bg-gray-900 flex flex-col h-full">
            {renderContent()}
        </div>
    );
} 