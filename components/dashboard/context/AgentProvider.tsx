'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Agent } from '@agent-base/types';
import { useAgents } from '../../../hooks/useAgents';
import { useOrganizationContext } from './OrganizationProvider';
import { useUserContext } from './UserProvider';

interface AgentContextType {
  agents: Agent[];
  isLoadingAgents: boolean;
  agentError: string | null;
  selectedAgentIdMiddlePanel: string | null;
  selectedAgentIdRightPanel: string | null;
  selectAgentMiddlePanel: (agentId: string | null) => void;
  selectAgentRightPanel: (agentId: string | null) => void;
  fetchAgents: () => Promise<void>;
  isAgentsReady: boolean;
}

export const AgentContext = createContext<AgentContextType>({
  agents: [],
  isLoadingAgents: false,
  agentError: null,
  selectedAgentIdMiddlePanel: null,
  selectedAgentIdRightPanel: null,
  selectAgentMiddlePanel: () => {},
  selectAgentRightPanel: () => {},
  fetchAgents: async () => {},
  isAgentsReady: false,
});

export function AgentProvider({ children }: { children: ReactNode }) {
  const { activeOrgId } = useOrganizationContext();
  const { handleClerkLogout } = useUserContext();

  const {
    agents, 
    selectedAgentIdMiddlePanel, 
    selectedAgentIdRightPanel, 
    selectAgentMiddlePanel,    
    selectAgentRightPanel,     
    isLoadingAgents, 
    agentError, 
    fetchAgents,
    isAgentsReady
  } = useAgents({ handleLogout: handleClerkLogout, activeOrgId });

  const contextValue = useMemo(() => ({
    agents, 
    selectedAgentIdMiddlePanel, 
    selectedAgentIdRightPanel, 
    selectAgentMiddlePanel,    
    selectAgentRightPanel,     
    isLoadingAgents, 
    agentError, 
    fetchAgents,
    isAgentsReady
  }), [
    agents, 
    selectedAgentIdMiddlePanel, 
    selectedAgentIdRightPanel, 
    selectAgentMiddlePanel,    
    selectAgentRightPanel,     
    isLoadingAgents, 
    agentError, 
    fetchAgents,
    isAgentsReady
  ]);

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
} 