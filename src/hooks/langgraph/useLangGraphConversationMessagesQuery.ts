import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { ConversationLanggraph } from '@agent-base/types';
import { BaseMessage } from '@langchain/core/messages';

async function fetchLangGraphConversationMessages(getToken: () => Promise<string | null>, conversationId: string): Promise<BaseMessage[]> {
    const token = await getToken();
    const response = await fetch(`/api/messages-langgraph/list?conversationId=${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }
    const data: ConversationLanggraph = await response.json();
    return data.messages || [];
}

export function useLangGraphConversationMessagesQuery(conversationId: string | null | undefined) {
    const { getToken } = useAuth();
    const queryKey = ['messages-langgraph', conversationId];

    const { data: messages, isLoading, isError, error } = useQuery<BaseMessage[]>({
        queryKey,
        queryFn: () => fetchLangGraphConversationMessages(getToken, conversationId!),
        enabled: !!conversationId,
    });

    return {
        messages: messages ?? [],
        isLoadingMessages: isLoading,
        messagesError: error?.message ?? null,
    };
} 