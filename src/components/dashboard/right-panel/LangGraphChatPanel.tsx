'use client';

import { useAgentContext } from '@/providers/AgentProvider';
import { useUserContext } from '@/providers/UserProvider';
import LangGraphChatInterface from '../chat/langgraph/LangGraphChatInterface';
import AgentHeader from './AgentHeader';
import { useLangGraphChatContext } from '@/providers/LangGraphChatProvider';

/**
 * LangGraphChatPanel Component
 * A new chat panel that uses the LangGraph streaming hook via context.
 */
export default function LangGraphChatPanel() {
    const { getClerkUserInitials } = useUserContext();
    const { selectedAgentForChat } = useAgentContext();
    const langGraphChat = useLangGraphChatContext();

    if (!selectedAgentForChat) {
        return (
            <div className="flex h-full items-center justify-center">
                <p>No Agent selected for chat.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-background">
            <AgentHeader 
                agent={selectedAgentForChat}
            />
            <div className="flex-1 overflow-y-auto">
                <LangGraphChatInterface
                    userInitials={getClerkUserInitials()}
                    agentFirstName={selectedAgentForChat.firstName}
                    agentLastName={selectedAgentForChat.lastName}
                    chat={langGraphChat}
                />
            </div>
        </div>
    );
} 