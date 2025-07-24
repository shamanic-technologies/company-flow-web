'use client';

import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { Agent } from '@agent-base/types';
import { useAgents as useAgentsHook } from '../../../hooks/useAgents';
import { useUser } from '@clerk/nextjs';
import { useOrganizationContext } from './OrganizationProvider';

interface AgentContextType {
  agents: Agent[];
  selectedAgentId: string | null;
  selectAgentId: (agentId: string | null) => void;
  isLoadingAgents: boolean;
  agentError: string | null;
  handleCreateAgent: (orgId: string) => Promise<string | null>;
  isCreatingAgent: boolean;
  fetchAgents: () => Promise<void>;
  isAgentsReady: boolean;
  selectedAgentForPanel: Agent | null;
  setSelectedAgentForPanel: (agent: Agent | null) => void;
}

export const AgentContext = createContext<AgentContextType>({
  agents: [],
  selectedAgentId: null,
  selectAgentId: () => {},
  isLoadingAgents: false,
  agentError: null,
  handleCreateAgent: async () => null,
  isCreatingAgent: false,
  fetchAgents: async () => {},
  isAgentsReady: false,
  selectedAgentForPanel: null,
  setSelectedAgentForPanel: () => {},
});

export function AgentProvider({ children }: { children: ReactNode }) {
  const { isLoaded, user } = useUser();
  const { activeOrgId } = useOrganizationContext();
  
  const { 
    agents, 
    selectedAgentId,
    selectAgentId,
    isLoadingAgents, 
    agentError,
    handleCreateAgent,
    isCreatingAgent,
    fetchAgents,
    isAgentsReady,
  } = useAgentsHook({ 
    user: user ?? undefined,
    isUserLoaded: isLoaded,
    activeOrgId: activeOrgId ?? undefined,
  });

  const [selectedAgentForPanel, setSelectedAgentForPanel] = useState<Agent | null>(null);

  // Effect to select the first agent by default if none is selected
  useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      selectAgentId(agents[0].id);
    }
  }, [agents, selectedAgentId, selectAgentId]);

  const contextValue = useMemo(() => ({
    agents,
    selectedAgentId,
    selectAgentId,
    isLoadingAgents,
    agentError,
    handleCreateAgent,
    isCreatingAgent,
    fetchAgents,
    isAgentsReady,
    selectedAgentForPanel,
    setSelectedAgentForPanel,
  }), [
    agents, 
    selectedAgentId, 
    selectAgentId,
    isLoadingAgents, 
    agentError, 
    handleCreateAgent,
    isCreatingAgent,
    fetchAgents, 
    isAgentsReady,
    selectedAgentForPanel,
  ]);

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
}

export const useAgentContext = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
}; 