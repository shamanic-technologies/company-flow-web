import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Message } from 'ai';

async function fetchConversationMessages(getToken: () => Promise<string | null>, conversationId: string): Promise<Message[]> {
    const token = await getToken();
    const response = await fetch(`/api/messages/list?conversationId=${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }
    const data = await response.json();
    return data.messages;
}

export function useConversationMessagesQuery(conversationId: string | null | undefined) {
    const { getToken } = useAuth();
    const queryKey = ['messages', conversationId];

    const { data: messages, isLoading, isError, error } = useQuery<Message[]>({
        queryKey,
        queryFn: () => fetchConversationMessages(getToken, conversationId!),
        enabled: !!conversationId,
        refetchInterval: 2000, // Poll every 2 seconds for messages
    });

    return {
        messages: messages ?? [],
        isLoadingMessages: isLoading,
        messagesError: error?.message ?? null,
    };
} 