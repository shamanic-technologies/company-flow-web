'use client';

import { useState, useCallback, useEffect } from 'react';
import { Agent, ServiceResponse } from '@agent-base/types';

interface UseAgentsProps {
  authToken: string;
  handleLogout: () => void;
}

/**
 * @description Hook to manage agent data fetching, selection, and state.
 * @param {UseAgentsProps} props - The authentication token and logout handler.
 * @returns An object containing agents list, selected agent ID, loading/error states, and related functions.
 */
export function useAgents({ authToken, handleLogout }: UseAgentsProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(false); // Initial loading false, true when fetching
  const [agentError, setAgentError] = useState<string | null>(null);

  // --- Fetch Agents Logic --- 
  const fetchAgents = useCallback(async () => {
    if (!authToken) {
      console.warn("useAgents: Auth token not available for fetching agents.");
      // Don't set error here, it's expected before auth is ready
      setAgents([]);
      setIsLoadingAgents(false);
      return;
    }

    console.log("🤖 useAgents - Fetching agents...");
    setIsLoadingAgents(true);
    setAgentError(null);
    // Clear previous agents while fetching new list
    // setAgents([]); // Optional: Clear immediately or only on success/failure?
    // Let's clear only if fetch succeeds or fails to avoid UI flicker

    try {
      const agentsResponse = await fetch('/api/agents/get-or-create', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      console.log('📊 useAgents - Agents API response status:', agentsResponse.status);

      if (agentsResponse.status === 401) {
        console.error('🚫 useAgents - Unauthorized fetching agents, logging out.');
        handleLogout();
        return;
      }

      if (!agentsResponse.ok) {
        let errorDetail = `Status: ${agentsResponse.status}`;
        try {
          const errorData = await agentsResponse.json();
          errorDetail = errorData.error || errorDetail;
        } catch (e) { /* ignore */ }
        throw new Error(`API error fetching agents: ${errorDetail}`);
      }

      const agentsData: ServiceResponse<Agent[]> = await agentsResponse.json();

      if (agentsData.success && agentsData.data) {
        const fetchedAgents = agentsData.data;
        console.log(`✅ useAgents - Agents retrieved successfully: ${fetchedAgents.length} agents found.`);
        setAgents(fetchedAgents);

        // Auto-select logic is handled in the effect below

      } else {
        setAgents([]); // Clear agents on failed API call (but successful response)
        throw new Error(agentsData.error || 'Invalid data format from agents API');
      }

    } catch (error: any) {
      console.error('❌ useAgents - Error fetching agents:', error);
      setAgentError(error.message || 'Failed to fetch agents.');
      setAgents([]); // Clear agents on exception
      setSelectedAgentId(null); // Clear selection on error
    } finally {
      setIsLoadingAgents(false);
    }
  }, [authToken, handleLogout]);

  // --- Effect to Fetch Agents When Token Available --- 
  useEffect(() => {
    if (authToken) {
      fetchAgents();
    } else {
      // Clear agents state if token becomes invalid/null (logout)
      setAgents([]);
      setSelectedAgentId(null);
      setIsLoadingAgents(false);
      setAgentError(null);
    }
  }, [authToken, fetchAgents]);

  // --- Effect for Agent Auto-Selection Logic --- 
  useEffect(() => {
    // Don't run auto-selection while loading or if there was an error fetching
    if (isLoadingAgents || agentError) return;

    const currentSelectionValid = selectedAgentId && agents.some(agent => agent.id === selectedAgentId);

    if (agents.length > 0 && !currentSelectionValid) {
      // Auto-select first agent if list is populated and current selection is invalid or null
      const firstAgentId = agents[0].id;
      console.log(`useAgents (Effect): Auto-selecting first agent: ${firstAgentId}`);
      setSelectedAgentId(firstAgentId);
    } else if (agents.length === 0 && selectedAgentId) {
      // If list becomes empty, clear selection
      console.log("useAgents (Effect): Agent list empty, clearing selection.");
      setSelectedAgentId(null);
    }
    // If agents.length > 0 AND currentSelectionValid, do nothing - keep existing selection.

  }, [agents, isLoadingAgents, agentError, selectedAgentId]);

  // --- Handler for Explicit Agent Selection --- 
  // This simple setter is enough for the hook.
  // The context provider will use this AND potentially trigger other actions (like loading conversations).
  const selectAgent = useCallback((agentId: string | null) => {
    console.log(`useAgents: Setting selected agent ID to: ${agentId}`);
    setSelectedAgentId(agentId);
  }, []);


  return {
    agents,
    selectedAgentId,
    selectAgent, // Expose the explicit selection function
    isLoadingAgents,
    agentError,
    fetchAgents, // Expose fetch function maybe for manual refresh?
  };
} 