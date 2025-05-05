'use client';

import { useContext, useEffect } from 'react'; // Import hooks
import { DashboardProvider, useDashboard } from '@/components/dashboard/context/DashboardContext'; // Import useDashboard
// Import the actual components we intend to use
import Sidebar from '@/components/dashboard/left-panel/Sidebar'; 
import MiddlePanel from '@/components/dashboard/middle-panel/MiddlePanel'; 
import ChatInterface from '@/components/dashboard/right-panel/Chat/ChatInterface'; 
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import RightPanel from '@/components/dashboard/right-panel/RightPanel'; // IMPORT THE NEW COMPONENT

/**
 * Main Dashboard Page
 * Wraps the dashboard content with the DashboardProvider and sets up the 
 * three-panel layout (Left, Middle, Right) using existing components.
 * Automatically selects the first agent and their most recent conversation on load.
 */
export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardLayout /> 
    </DashboardProvider>
  );
}

// Separate component to access the context provided by DashboardProvider
function DashboardLayout() {
  const { 
    agents, 
    isLoadingAgents,
    selectedAgentId,
    setSelectedAgentIdDirectly, // Renamed to setSelectedAgentIdDirectly if that's the context method
    conversationList,
    isLoadingConversations,
    currentConversationId,
    handleConversationSelect,
    fetchAgents,
    fetchConversationsForAgent, // Assuming this function exists in context
    getUserInitials,
    authToken
  } = useDashboard();

  // Effect to fetch agents on initial load if needed (and token is available)
  useEffect(() => {
    if (authToken && agents.length === 0 && !isLoadingAgents) {
        console.log("DashboardLayout: Auth token present, fetching agents...");
        fetchAgents();
    }
  }, [authToken, agents.length, isLoadingAgents, fetchAgents]);

  // Effect to select the first agent when agents are loaded
  useEffect(() => {
    // Only proceed if agents are loaded, not currently loading, and no agent is selected yet
    if (!isLoadingAgents && agents.length > 0 && !selectedAgentId) {
        const firstAgent = agents[0];
        console.log(`DashboardLayout: Agents loaded, selecting first agent: ${firstAgent.id}`);
        setSelectedAgentIdDirectly(firstAgent.id); // Use the direct setter from context
    }
  }, [agents, isLoadingAgents, selectedAgentId, setSelectedAgentIdDirectly]);

  // Effect to fetch conversations when an agent is selected
  useEffect(() => {
    // Only fetch if an agent is selected, auth token exists, and conversations aren't already loading
    if (selectedAgentId && authToken && !isLoadingConversations) {
        console.log(`DashboardLayout: Agent selected (${selectedAgentId}), fetching conversations...`);
        // Assuming fetchConversationsForAgent exists and takes agentId and authToken
        fetchConversationsForAgent(selectedAgentId, authToken); 
    }
    // Add fetchConversationsForAgent to dependency array if it's stable via useCallback in context
  }, [selectedAgentId, authToken, fetchConversationsForAgent]);

  // Effect to select the first conversation when conversations are loaded for the selected agent
  useEffect(() => {
    // Only proceed if:
    // - An agent is selected
    // - Conversations are loaded for that agent (isLoadingConversations is false)
    // - The conversation list is not empty
    // - No conversation is currently selected (or the selected one doesn't belong to the current agent - handleConversationSelect likely resets this)
    if (selectedAgentId && !isLoadingConversations && conversationList.length > 0 && !currentConversationId) {
        // Assuming conversationList is sorted by recency, take the first one
        const mostRecentConversation = conversationList[0];
        console.log(`DashboardLayout: Conversations loaded for agent ${selectedAgentId}, selecting conversation: ${mostRecentConversation.conversationId}`);
        // handleConversationSelect likely handles setting currentConversationId and fetching messages
        handleConversationSelect(mostRecentConversation.conversationId);
    }
  }, [selectedAgentId, conversationList, isLoadingConversations, currentConversationId, handleConversationSelect]);


  return (
    <div className="flex h-full w-full">
      {/* Left Panel */}
      <div className="w-64 flex-shrink-0 border-r border-gray-700 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Middle Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MiddlePanel />
      </div>

      {/* Right Panel - USE THE NEW COMPONENT */}
      <RightPanel />
    </div>
  );
} 