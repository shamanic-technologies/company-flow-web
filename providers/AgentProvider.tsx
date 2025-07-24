'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useEffect,
} from 'react';
import { Agent } from '@agent-base/types';
import { useAgentsQuery } from '@/hooks/useAgentsQuery';
import { useOrganizationsQuery } from '@/hooks/useOrganizationsQuery';

interface AgentContextType {
  agents: Agent[];
  isLoadingAgents: boolean;
  agentError: string | null;
  selectedAgentForChat: Agent | null; 
  selectedAgentForSettings: Agent | null;
  setSelectedAgentForSettings: (agent: Agent | null) => void;
  selectAgentForChat: (agentId: string | null) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const { activeOrgId } = useOrganizationsQuery();
  const { agents, isLoadingAgents, agentError } = useAgentsQuery(activeOrgId);
  
  const [selectedAgentIdForChat, setSelectedAgentIdForChat] = useState<string | null>(null);
  const [selectedAgentForSettings, setSelectedAgentForSettings] = useState<Agent | null>(null);

  useEffect(() => {
    if (!isLoadingAgents && agents && agents.length > 0 && !selectedAgentIdForChat) {
      setSelectedAgentIdForChat(agents[0].id);
    }
  }, [agents, isLoadingAgents, selectedAgentIdForChat]);

  const selectAgentForChat = (agentId: string | null) => {
    setSelectedAgentIdForChat(agentId);
  };

  const selectedAgentForChat = useMemo(
    () => (agents ? agents.find((agent) => agent.id === selectedAgentIdForChat) : null) || null,
    [agents, selectedAgentIdForChat]
  );

  const contextValue = useMemo(
    () => ({
      agents: agents || [],
      isLoadingAgents,
      agentError,
      selectedAgentForChat,
      selectedAgentForSettings,
      setSelectedAgentForSettings,
      selectAgentForChat,
    }),
    [
      agents,
      isLoadingAgents,
      agentError,
      selectedAgentForChat,
      selectedAgentForSettings,
    ]
  );

  return (
    <AgentContext.Provider value={contextValue}>{children}</AgentContext.Provider>
  );
}

export function useAgentContext() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentContext must be used within an AgentProvider');
  }
  return context;
} 