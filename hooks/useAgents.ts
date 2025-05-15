'use client';

import { useState, useCallback, useEffect } from 'react';
import { Agent, ServiceResponse } from '@agent-base/types';

interface UseAgentsProps {
  handleLogout: () => void;
}

/**
 * @description Hook to manage agent data fetching, selection, and state.
 * @param {UseAgentsProps} props - The logout handler.
 * @returns An object containing agents list, selected agent ID, loading/error states, and related functions.
 */
export function useAgents({ handleLogout }: UseAgentsProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentIdMiddlePanel, setSelectedAgentIdMiddlePanel] = useState<string | null>(null);
  const [selectedAgentIdRightPanel, setSelectedAgentIdRightPanel] = useState<string | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(false); // Initial loading false, true when fetching
  const [agentError, setAgentError] = useState<string | null>(null);

  // --- Fetch Agents Logic --- 
  const fetchAgents = useCallback(async () => {
    // Clear previous agents while fetching new list
    // setAgents([]); // Optional: Clear immediately or only on success/failure?
    // Let's clear only if fetch succeeds or fails to avoid UI flicker

    try {
      const response = await fetch('/api/agents/get-or-create', {
        method: 'GET', // Changed from POST to GET
        // headers and body removed as they are not typically used for GET requests
      });

      if (response.status === 401) {
        console.error('🚫 useAgents - Unauthorized fetching agents, logging out.');
        handleLogout();
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
        // Only update state if the fetched data is different from the current state
        if (JSON.stringify(fetchedAgents) !== JSON.stringify(agents)) {
          console.log(`✅ useAgents - Agents data changed, updating state.`);
          setAgents(fetchedAgents);
        } else {
          console.log(`✅ useAgents - Agents data unchanged, skipping state update.`);
        }

        // Auto-select logic is handled in the effect below

      } else {
        // if API returns null/undefined but ok response, treat as empty list if current is not already empty
        if (agents.length > 0) {
          setAgents([]); 
        }
        throw new Error('Invalid data format from agents API');
      }

    } catch (error: any) {
      console.error('❌ useAgents - Error fetching agents:', error);
      setAgentError(error.message || 'Failed to fetch agents.');
      setAgents([]); // Clear agents on exception
      setSelectedAgentIdMiddlePanel(null);
      setSelectedAgentIdRightPanel(null);
    } finally {
      setIsLoadingAgents(false);
    }
  }, [handleLogout]);

  // --- Effect to Fetch Agents When Token Available (now on component mount if not dependent on token) ---
  useEffect(() => {
    // Init at mount
    setIsLoadingAgents(true);
    setAgentError(null);
    // Fetch agents
    fetchAgents();
  }, [fetchAgents]);

  // --- Effect for Agent Auto-Selection Logic --- 
  useEffect(() => {
    // Don't run auto-selection while loading or if there was an error fetching
    if (isLoadingAgents || agentError) return;

    const currentSelectionValid = 
      selectedAgentIdMiddlePanel && agents.some(agent => agent.id === selectedAgentIdMiddlePanel)
      && selectedAgentIdRightPanel && agents.some(agent => agent.id === selectedAgentIdRightPanel);

    if (agents.length > 0 && !currentSelectionValid) {
      // Auto-select first agent if list is populated and current selection is invalid or null
      const firstAgentId = agents[0].id;
      // Only set if different to avoid potential loops if this effect is triggered by selectedAgentId itself
      if (selectedAgentIdMiddlePanel !== firstAgentId && selectedAgentIdRightPanel !== firstAgentId) {
        console.log(`useAgents (Effect): Auto-selecting first agent: ${firstAgentId}`);
        setSelectedAgentIdMiddlePanel(firstAgentId);
        setSelectedAgentIdRightPanel(firstAgentId);
      }
    } else if (agents.length === 0 && (selectedAgentIdMiddlePanel || selectedAgentIdRightPanel)) {
      // If list becomes empty, clear selection
      console.log("useAgents (Effect): Agent list empty, clearing selection.");
      setSelectedAgentIdMiddlePanel(null);
      setSelectedAgentIdRightPanel(null);
    }
    // If agents.length > 0 AND currentSelectionValid, do nothing - keep existing selection.

  }, [agents, isLoadingAgents, agentError, selectedAgentIdMiddlePanel, selectedAgentIdRightPanel]); // selectedAgentId added to dependencies for the setSelectedAgentId condition

  // --- Handler for Explicit Agent Selection --- 
  // This simple setter is enough for the hook.
  // The context provider will use this AND potentially trigger other actions (like loading conversations).
  const selectAgentMiddlePanel = useCallback((agentId: string | null) => {
    console.log(`useAgents: Setting selected agent ID to: ${agentId}`);
    setSelectedAgentIdMiddlePanel(agentId);
  }, []);
  const selectAgentRightPanel = useCallback((agentId: string | null) => {
    console.log(`useAgents: Setting selected agent ID to: ${agentId}`);
    setSelectedAgentIdRightPanel(agentId);
  }, []);

  return {
    agents,
    selectedAgentIdMiddlePanel,
    selectedAgentIdRightPanel,
    selectAgentMiddlePanel, // Expose the explicit selection function
    selectAgentRightPanel, // Expose the explicit selection function
    isLoadingAgents,
    agentError,
    fetchAgents, // Expose fetch function maybe for manual refresh?
  };
} 