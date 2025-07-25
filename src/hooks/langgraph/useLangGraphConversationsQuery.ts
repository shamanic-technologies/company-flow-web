import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Conversation } from '@agent-base/types';

async function fetchAgentConversationsLangGraph(
  getToken: () => Promise<string | null>,
  agentId: string
): Promise<Conversation[]> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`/api/conversations-langgraph/list-or-create?agent_id=${agentId}`, {
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
  return serviceResponse || [];
}

export function useLangGraphConversationsQuery(agentId: string | null) {
  const { getToken } = useAuth();

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isConversationsError,
    error: conversationError,
  } = useQuery<Conversation[], Error>({
    queryKey: ['conversations-langgraph', agentId],
    queryFn: () => fetchAgentConversationsLangGraph(getToken, agentId as string),
    enabled: !!agentId,
  });

  return {
    conversations,
    isLoadingConversations,
    isConversationsError,
    conversationError,
  };
} 