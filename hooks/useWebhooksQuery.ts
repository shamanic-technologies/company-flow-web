import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Webhook } from '@agent-base/types';
import { useOrganizationsQuery } from './useOrganizationsQuery';

async function fetchWebhooks(getToken: () => Promise<string | null>): Promise<Webhook[]> {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // This endpoint does not require any query parameters.
  // The backend uses the Clerk session to get the user and organization.
  const response = await fetch('/api/webhook-tools/get-created', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Failed to fetch webhooks:', errorBody);
    throw new Error(errorBody.error || 'Failed to fetch webhooks');
  }

  return response.json();
}

export function useWebhooksQuery() {
  const { getToken } = useAuth();
  const { activeOrgId, isOrganizationsReady } = useOrganizationsQuery();

  const {
    data: webhooks = [],
    isLoading: isLoadingWebhooks,
    isError: isWebhooksError,
    error: webhooksError,
    refetch: refetchWebhooks,
  } = useQuery<Webhook[], Error>({
    queryKey: ['webhooks', activeOrgId],
    queryFn: () => fetchWebhooks(getToken),
    enabled: !!activeOrgId && isOrganizationsReady,
    refetchInterval: 5000, // Keep polling for updates
  });

  return {
    webhooks,
    isLoadingWebhooks,
    isWebhooksError,
    webhooksError,
    refetchWebhooks,
  };
} 