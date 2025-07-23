'use client';

/**
 * RightPanel Component
 * 
 * This component represents the right-most panel of the dashboard, 
 * primarily displaying the Agent Header and the Chat Interface for the 
 * currently selected agent and conversation, using data from DashboardContext.
 */

import { useAgentContext } from '../context/AgentProvider';
import { useConversationContext } from '../context/ConversationProvider';
import { useChatContext } from '../context/ChatProvider';
import { useViewContext } from '../context/ViewProvider';
import { useUserContext } from '../context/UserProvider';
import ChatInterface from '../chat/ChatInterface';
import AgentHeader from './AgentHeader'; // Assuming AgentHeader is in the same directory
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Agent } from '@agent-base/types';

/**
 * RightPanel Component
 * Renders the agent header and chat interface based on the selected agent 
 * and conversation data from the DashboardContext.
 */
export default function RightPanel() {
    const { 
        agents, 
        selectedAgentId, 
        isLoadingAgents 
    } = useAgentContext();
    
    const { 
        currentConversationId 
    } = useConversationContext();
    
    const { getClerkUserInitials } = useUserContext();
    const { createNewChatAndSetView } = useViewContext();
    const { chat } = useChatContext();

    const { 
        messages, 
        isLoading: isLoadingMessages, 
        error: chatError 
    } = chat;
    
    const selectedAgent = agents.find((agent: Agent) => agent.id === selectedAgentId);

    const handleNewChat = () => {
        console.log("RightPanel: 'New Chat' button clicked.");
        createNewChatAndSetView();
    };

    if (isLoadingAgents) {
        return <div className="p-4">Loading agents...</div>;
    }

    if (!selectedAgent) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <p>No agent selected.</p>
                <p className="text-sm text-gray-500">Please select an agent from the list to start a conversation.</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-800">
            <AgentHeader 
                agent={selectedAgent}
                onNewChat={handleNewChat}
            />
            <div className="flex-1 overflow-y-auto">
                <ChatInterface
                    userInitials={getClerkUserInitials()}
                    agentFirstName={selectedAgent.firstName}
                    agentLastName={selectedAgent.lastName}
                    chat={chat}
                />
            </div>
        </div>
    );
} 