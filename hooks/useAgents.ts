'use client';

import { useState, useCallback, useEffect } from 'react';
import { Agent } from '@agent-base/types';
import { useAuth, useUser } from '@clerk/nextjs';
import { UserResource } from '@clerk/types';

interface UseAgentsProps {
  user: UserResource | undefined;
  isUserLoaded: boolean;
  activeOrgId: string | undefined;
}

export interface UseAgentsReturn {
  agents: Agent[];
  selectedAgentId: string | null;
  selectAgentId: (agentId: string | null) => void;
  isLoadingAgents: boolean;
  agentError: string | null;
  handleCreateAgent: (orgId: string) => Promise<string | null>;
  isCreatingAgent: boolean;
  isAgentsReady: boolean;
  fetchAgents: () => Promise<void>;
}

/**
 * @description Hook to manage agent data including fetching, selection, and creation.
 */
export function useAgents({ user, isUserLoaded, activeOrgId }: UseAgentsProps): UseAgentsReturn {
  const { getToken } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(true);
  const [isCreatingAgent, setIsCreatingAgent] = useState<boolean>(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  const isAgentsReady = !isLoadingAgents && !isCreatingAgent;

  const selectAgentId = useCallback((agentId: string | null) => {
    console.log(`useAgents: Selecting agent ${agentId}`);
    setSelectedAgentId(agentId);
  }, []);

  const fetchAgents = useCallback(async () => {
    if (!activeOrgId) {
      setAgents([]);
      setIsLoadingAgents(false);
      return;
    }
    
    // Only set loading state on the initial fetch, not on background polls
    if (agents.length === 0) {
      setIsLoadingAgents(true);
    }

    try {
      const token = await getToken();
      const response = await fetch('/api/agents/get-or-create', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data: Agent[] = await response.json();
      setAgents(data);
    } catch (error: any) {
      setAgentError(error.message);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [activeOrgId, getToken, agents.length]);

  const handleCreateAgent = useCallback(async (orgId: string): Promise<string | null> => {
    setIsCreatingAgent(true);
    try {
      const token = await getToken();
      const response = await fetch('/api/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ organizationId: orgId }),
      });
      if (!response.ok) throw new Error('Failed to create agent');
      const newAgent: Agent = await response.json();
      setAgents(prev => [...prev, newAgent]);
      selectAgentId(newAgent.id);
      return newAgent.id;
    } catch (error: any) {
      setAgentError(error.message);
      return null;
    } finally {
      setIsCreatingAgent(false);
    }
  }, [getToken, selectAgentId]);
  
  useEffect(() => {
    if (isUserLoaded && activeOrgId) {
      fetchAgents();
    }
  }, [isUserLoaded, activeOrgId, fetchAgents]);

  return {
    agents,
    selectedAgentId,
    selectAgentId,
    isLoadingAgents,
    agentError,
    handleCreateAgent,
    isCreatingAgent,
    isAgentsReady,
    fetchAgents,
  };
} 