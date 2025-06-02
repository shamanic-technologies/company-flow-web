'use client';

import { useState, useCallback, useEffect } from 'react';
import { Agent, ServiceResponse } from '@agent-base/types';

interface UseAgentsProps {
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

/**
 * @description Hook to manage agent data fetching, selection, and state.
 * @param {UseAgentsProps} props - The logout handler and activeOrgId.
 * @returns An object containing agents list, selected agent ID, loading/error states, and related functions.
 */
export function useAgents({ handleLogout, activeOrgId }: UseAgentsProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentIdMiddlePanel, setSelectedAgentIdMiddlePanel] = useState<string | null>(null);
  const [selectedAgentIdRightPanel, setSelectedAgentIdRightPanel] = useState<string | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  // --- Fetch Agents Logic --- 
  const fetchAgents = useCallback(async () => {
    if (!activeOrgId) {
      console.log("useAgents: Waiting for activeOrgId to fetch agents...");
      setAgents([]);
      setSelectedAgentIdMiddlePanel(null);
      setSelectedAgentIdRightPanel(null);
      setIsLoadingAgents(false); // Not truly loading
      // setAgentError("Organization not selected. Cannot fetch agents."); // Optional error
      return;
    }
    console.log(`useAgents: Fetching agents for org: ${activeOrgId}`);
    // setIsLoadingAgents(true); // Set loading true only when proceeding
    setAgentError(null); // Clear previous errors

    try {
      const response = await fetch('/api/agents/get-or-create', {
        method: 'GET',
      });

      if (response.status === 401) {
        console.error('🚫 useAgents - Unauthorized fetching agents, logging out.');
        setAgents([]); // Clear data
        setSelectedAgentIdMiddlePanel(null);
        setSelectedAgentIdRightPanel(null);
        handleLogout(); // Logout as session is invalid
        return;
      }

      if (!response.ok) {
        let errorDetail = `Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || errorDetail;
        } catch (e) { /* ignore */ }
        throw new Error(`API error fetching agents: ${errorDetail}`);
      }

      const agentsData: Agent[] = await response.json();

      if (agentsData) {
        const fetchedAgents = agentsData;
        if (JSON.stringify(fetchedAgents) !== JSON.stringify(agents)) {
          setAgents(fetchedAgents);
        }
      } else {
        if (agents.length > 0) {
          setAgents([]); 
        }
        console.log('useAgents: Invalid data format from agents API, received null or undefined but response was ok.');
        // Not throwing an error here, just setting to empty. Could be a valid state.
      }

    } catch (error: any) {
      console.error('❌ useAgents - Error fetching agents:', error);
      setAgentError(error.message || 'Failed to fetch agents.');
      setAgents([]);
      setSelectedAgentIdMiddlePanel(null);
      setSelectedAgentIdRightPanel(null);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [activeOrgId, handleLogout]); // Added activeOrgId. `agents` removed from deps for setAgents comparison logic.

  // --- Effect to Fetch Agents --- 
  useEffect(() => {
    if (activeOrgId) { // Only fetch if activeOrgId is available
      setIsLoadingAgents(true);
      fetchAgents();
    } else {
      // If activeOrgId is not available, reset state
      setAgents([]);
      setSelectedAgentIdMiddlePanel(null);
      setSelectedAgentIdRightPanel(null);
      setIsLoadingAgents(false);
      setAgentError(null); // Or an error like "No active organization"
    }
  }, [activeOrgId, fetchAgents]); // Added activeOrgId

  // Effect for Agent Auto-Selection Logic remains the same, 
  // as it depends on `agents` list which is now correctly managed based on `activeOrgId`
  useEffect(() => {
    if (isLoadingAgents || agentError) return;
    const currentSelectionValidMiddle = selectedAgentIdMiddlePanel && agents.some(agent => agent.id === selectedAgentIdMiddlePanel);
    const currentSelectionValidRight = selectedAgentIdRightPanel && agents.some(agent => agent.id === selectedAgentIdRightPanel);

    if (agents.length > 0) {
      if (!currentSelectionValidMiddle) {
        setSelectedAgentIdMiddlePanel(agents[0].id);
      }
      if (!currentSelectionValidRight) {
        setSelectedAgentIdRightPanel(agents[0].id);
      }
    } else {
      if (selectedAgentIdMiddlePanel !== null) setSelectedAgentIdMiddlePanel(null);
      if (selectedAgentIdRightPanel !== null) setSelectedAgentIdRightPanel(null);
    }
  }, [agents, isLoadingAgents, agentError, selectedAgentIdMiddlePanel, selectedAgentIdRightPanel]);

  const selectAgentMiddlePanel = useCallback((agentId: string | null) => {
    setSelectedAgentIdMiddlePanel(agentId);
  }, []);
  const selectAgentRightPanel = useCallback((agentId: string | null) => {
    setSelectedAgentIdRightPanel(agentId);
  }, []);

  return {
    agents,
    selectedAgentIdMiddlePanel,
    selectedAgentIdRightPanel,
    selectAgentMiddlePanel,
    selectAgentRightPanel,
    isLoadingAgents,
    agentError,
    fetchAgents,
  };
} 