import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { Agent } from '@agent-base/types';
import { useOrganizationsQuery } from './useOrganizationsQuery';

async function fetchAgents(getToken: () => Promise<string | null>, organizationId: string): Promise<Agent[]> {
    const token = await getToken();
    const response = await fetch(`/api/agents/get-or-create?organizationId=${organizationId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch agents');
    }
    const data = await response.json();
    if (Array.isArray(data)) {
        return data;
    }
    if (data && Array.isArray(data.agents)) {
        return data.agents;
    }
    console.warn("Unexpected response structure from fetchAgents:", data);
    return [];
}

export function useAgentsQuery(organizationId: string | null | undefined) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const queryKey = ['agents', organizationId];

    const { data: agents, isLoading, isError, error, isPending } = useQuery({
        queryKey,
        queryFn: () => fetchAgents(getToken, organizationId!),
        enabled: !!organizationId,
        // Disabling polling for performance, will rely on cache invalidation
    });

    return {
        agents: agents ?? [],
        isLoadingAgents: isLoading,
        isPendingAgents: isPending,
        agentError: error?.message ?? null,
    };
} 