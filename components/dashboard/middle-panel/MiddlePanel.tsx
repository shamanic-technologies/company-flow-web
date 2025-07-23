'use client';

/**
 * MiddlePanel Component
 * 
 * This component represents the central area of the dashboard, displaying 
 * the active content based on the user's selection (chat, conversation list, memory, actions, webhook details).
 * It relies on DashboardContext for agent, conversation, message, and webhook data.
 */

// Import shared types (Use monorepo package)
// import { Agent, Conversation, CreateConversationInput } from '@agent-base/types'; // Types used via context
import dynamic from 'next/dynamic';
import { useAgentContext } from '../context/AgentProvider';
import { useUserContext } from '../context/UserProvider';
import { useViewContext } from '../context/ViewProvider';
import { useChatContext } from '../context/ChatProvider';
import { useConversationContext } from '../context/ConversationProvider';
import { useWebhookContext } from '../context/WebhookProvider';
import { useApiToolsContext } from '../context/ApiToolsProvider';

import ChatInterface from '../chat/ChatInterface';
import MemoryPanel from './MemoryPanel';
import WebhookDetailPanel from './WebhookDetailPanel';
import ToolDetailPanel from './ToolDetailPanel';
import ActionsPanel from './ActionsPanel';
import AgentSettingsPage from './AgentSettingsPage';


/**
 * MiddlePanel Component
 * Renders the main content area based on the active view selected in the dashboard context.
 * Uses data fetched and managed by the DashboardContext.
 */
export default function MiddlePanel() {
  const { 
    activeAgentView, 
    selectConversationAndSetView, 
    selectedWebhook, 
    selectedTool 
  } = useViewContext();
  const { 
    agents, 
    selectedAgentId,
    isLoadingAgents,
  } = useAgentContext();
  const { 
    conversationList, 
    isLoadingConversationList, 
    conversationError, 
    currentConversationId 
  } = useConversationContext();
  const { getClerkUserInitials } = useUserContext();

  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  if (isLoadingAgents || !selectedAgent) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        {isLoadingAgents ? <p>Loading agents...</p> : <p>No agent selected.</p>}
      </div>
    );
  }

  const renderContent = () => {
    switch (activeAgentView) {
      case 'memory':
        return <AgentSettingsPage agent={selectedAgent} />;
      case 'actions':
        return <ActionsPanel agentId={selectedAgent.id} />;
      case 'webhookDetail':
        if (!selectedWebhook) return <div>No webhook selected.</div>;
        return <WebhookDetailPanel webhook={selectedWebhook} onEventClick={selectConversationAndSetView} />;
      case 'toolDetail':
        if (!selectedTool) return <div>No tool selected.</div>;
        return <ToolDetailPanel searchApiTool={selectedTool} />;
      ;
    }
  };

  return <div className="flex-1 flex flex-col overflow-hidden">{renderContent()}</div>;
} 