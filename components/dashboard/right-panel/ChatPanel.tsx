'use client';

/**
 * RightPanel Component
 * 
 * This component represents the right-most panel of the dashboard, 
 * primarily displaying the Agent Header and the Chat Interface for the 
 * currently selected agent and conversation, using data from DashboardContext.
 */

import { useAgentContext } from '@/providers/AgentProvider';
import { useConversationContext } from '@/providers/ConversationProvider';
import { useChatContext } from '@/providers/ChatProvider';
import { useViewContext } from '@/providers/ViewProvider';
import { useUserContext } from '@/providers/UserProvider';
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
export default function ChatPanel() {
    const { getClerkUserInitials } = useUserContext();
    const chat = useChatContext();

    // The chat context can be null while the agent list is loading.
    // We render a loading state until the context is ready.
    if (!chat) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (chat.isLoading && !chat.chatAgent) {
        return <div className="p-4">Loading Chat...</div>;
    }

    if (!chat.chatAgent) {
        return (
            <div className="flex flex-col h-full items-center justify-center">
                <p>No Agent available for chat.</p>
                <p className="text-sm text-gray-500">Please create an agent to start a conversation.</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full bg-background">
            <AgentHeader 
                agent={chat.chatAgent}
            />
            <div className="flex-1 overflow-y-auto">
                <ChatInterface
                    userInitials={getClerkUserInitials()}
                    agentFirstName={chat.chatAgent.firstName}
                    agentLastName={chat.chatAgent.lastName}
                    chat={chat}
                />
            </div>
        </div>
    );
} 