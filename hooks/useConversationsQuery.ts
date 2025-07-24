import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Conversation } from '@agent-base/types';
import { useOrganizationsQuery } from './useOrganizationsQuery';

async function fetchConversations(getToken: () => Promise<string | null>): Promise<Conversation[]> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // This endpoint does not require any query parameters.
  // The backend uses the Clerk session to get the user and organization.
  const response = await fetch('/api/conversations/list-all-for-user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Failed to fetch conversations:', errorBody);
    throw new Error(errorBody.error || 'Failed to fetch conversations');
  }

  // The body of the success response is the ServiceResponse, which contains the data array
  const serviceResponse = await response.json();
  return serviceResponse.data;
}

export function useConversationsQuery() {
  const { getToken } = useAuth();
  const { activeOrgId, isOrganizationsReady } = useOrganizationsQuery();

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isConversationsError,
    error: conversationError,
  } = useQuery<Conversation[], Error>({
    queryKey: ['conversations', activeOrgId],
    queryFn: () => fetchConversations(getToken),
    enabled: !!activeOrgId && isOrganizationsReady,
    refetchInterval: 5000, // Keep polling for new conversations
  });

  return {
    conversations,
    isLoadingConversations,
    isConversationsError,
    conversationError,
  };
} 