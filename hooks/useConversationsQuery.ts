import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Conversation } from '@agent-base/types';

async function fetchAgentConversations(
  getToken: () => Promise<string | null>,
  agentId: string
): Promise<Conversation[]> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/conversations/list-or-create?agent_id=${agentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Failed to fetch agent conversations:', errorBody);
    throw new Error(errorBody.error || 'Failed to fetch agent conversations');
  }

  const serviceResponse = await response.json();
  console.debug('[useConversationsQuery] serviceResponse', serviceResponse);
  // The serviceResponse is the array itself. Return it directly.
  return serviceResponse || [];
}

export function useConversationsQuery(agentId: string | null) {
  const { getToken } = useAuth();

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isConversationsError,
    error: conversationError,
  } = useQuery<Conversation[], Error>({
    queryKey: ['conversations', agentId],
    queryFn: () => fetchAgentConversations(getToken, agentId as string),
    enabled: !!agentId,
  });

  return {
    conversations,
    isLoadingConversations,
    isConversationsError,
    conversationError,
  };
} 