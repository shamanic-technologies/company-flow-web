import { useAuth, useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { ApiTool, SearchApiToolResult, SearchApiToolResultItem } from '@agent-base/types';
import { useOrganizationsQuery } from './useOrganizationsQuery';

const fetchApiTools = async (getToken: () => Promise<string | null>): Promise<SearchApiToolResultItem[]> => {
  const token = await getToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  // This endpoint does not require any query parameters.
  // The backend uses the Clerk session to get the user and organization.
  const response = await fetch('/api/api-tools', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json();
    console.error('Failed to fetch API tools:', errorBody);
    throw new Error(errorBody.error || 'Failed to fetch API tools');
  }

  const result: SearchApiToolResult = await response.json();
  return result.items;
};

export function useApiToolsQuery() {
  const { getToken } = useAuth();
  const { activeOrgId, isOrganizationsReady } = useOrganizationsQuery();

  const {
    data: apiTools = [],
    isLoading: isLoadingApiTools,
    isError: isApiToolsError,
    error: apiToolsError,
  } = useQuery<SearchApiToolResultItem[], Error>({
    queryKey: ['apiTools', activeOrgId],
    queryFn: () => fetchApiTools(getToken),
    enabled: !!activeOrgId && isOrganizationsReady,
  });

  return {
    apiTools,
    isLoadingApiTools,
    isApiToolsError,
    apiToolsError,
  };
} 