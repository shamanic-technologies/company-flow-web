'use client';

import { useLangGraphStream } from '@/hooks/chat/useLangGraphStream';
import { useConversationContext } from '@/providers/ConversationProvider';
import { useAgentContext } from '@/providers/AgentProvider';
import { useUserContext } from '@/providers/UserProvider';
import ChatInterface from '../chat/ChatInterface';
import AgentHeader from './AgentHeader';
import { Loader2 } from 'lucide-react';
import { Agent } from '@agent-base/types';

/**
 * LangGraphChatPanel Component
 * A new chat panel that uses the LangGraph streaming hook.
 */
export default function LangGraphChatPanel() {
    const { getClerkUserInitials } = useUserContext();
    const { currentConversationId } = useConversationContext();
    const { selectedAgentForChat } = useAgentContext();

    const langGraphChat = useLangGraphStream({
        conversationId: currentConversationId,
        agentId: selectedAgentForChat?.id ?? null,
    });
    
    // We need to create a "compatible" chat object for the legacy ChatInterface.
    // This is a temporary step in the migration.
    const compatibleChatObject = {
        ...langGraphChat,
        agent: selectedAgentForChat,
        // Add any other properties expected by ChatInterface with default/mock values
        data: [],
        error: langGraphChat.error,
        reload: () => {},
        stop: () => {},
        append: async () => null,
        addToolResult: () => {},
        chatError: null,
        rawError: null,
        errorInfo: null,
        setChatError: () => {},
    };

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
                <ChatInterface
                    userInitials={getClerkUserInitials()}
                    agentFirstName={selectedAgentForChat.firstName}
                    agentLastName={selectedAgentForChat.lastName}
                    // @ts-ignore - We are knowingly passing a mismatched type during migration.
                    chat={compatibleChatObject}
                />
            </div>
        </div>
    );
} 