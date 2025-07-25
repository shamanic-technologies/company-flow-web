/*
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
    // Ensure we always return an array, even if the data or data.messages is missing.
    return data || [];
}

export function useConversationMessagesQuery(conversationId: string | null | undefined) {
    const { getToken } = useAuth();
    const queryKey = ['messages', conversationId];

    const { data: messages, isLoading, isError, error } = useQuery<Message[]>({
        queryKey,
        queryFn: () => fetchConversationMessages(getToken, conversationId!),
        enabled: !!conversationId,
        // Polling is managed by React Query's default behavior,
        // such as refetchOnWindowFocus, for a smart real-time experience.
    });

    return {
        messages: messages ?? [],
        isLoadingMessages: isLoading,
        messagesError: error?.message ?? null,
    };
}
*/ 