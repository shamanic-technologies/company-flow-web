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

import ChatInterface from '../chat/ChatInterface';
import MemoryPanel from './MemoryPanel';
import ConversationListPanel from './ConversationListPanel';
import WebhookDetailPanel from './WebhookDetailPanel';
import ToolDetailPanel from './ToolDetailPanel';
import ActionsPanel from './ActionsPanel';
// Dynamically import the AIDashboardPanel to prevent SSR issues
const AIDashboardPanel = dynamic(() => import('./AIDashboardPanel'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-gray-500">
      Loading Dashboard...
    </div>
  ),
});

/**
 * MiddlePanel Component
 * Renders the main content area based on the active view selected in the dashboard context.
 * Uses data fetched and managed by the DashboardContext.
 */
export default function MiddlePanel() {
  const { agents, selectedAgentIdMiddlePanel } = useAgentContext();
  const { getClerkUserInitials } = useUserContext();
  const { activeAgentView, selectedWebhook, selectedTool, selectedDashboard, selectConversationAndSetView } = useViewContext();
  const { chatMiddlePanel } = useChatContext();
  const { conversationList, isLoadingConversationList, conversationError, currentConversationIdMiddlePanel } = useConversationContext();

  const selectedAgent = agents.find(agent => agent.id === selectedAgentIdMiddlePanel);

  // Render dashboard view if active, it doesn't need an agent
  if (activeAgentView === 'dashboard') {
    return <AIDashboardPanel selectedDashboard={selectedDashboard} />;
  }

  if (!selectedAgent) {
    // If not dashboard view and no agent, show placeholder
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select an agent to get started
      </div>
    );
  }

  const renderContent = () => {
    switch (activeAgentView) {
      case 'chat':
        return (
          <ChatInterface
            userInitials={getClerkUserInitials()}
            agentFirstName={selectedAgent.firstName}
            agentLastName={selectedAgent.lastName}
            chat={chatMiddlePanel}
          />
        );
      case 'conversations':
        return <ConversationListPanel 
            conversationList={conversationList}
            isLoadingConversations={isLoadingConversationList}
            historyError={conversationError}
            currentConversationIdMiddlePanel={currentConversationIdMiddlePanel}
            onConversationSelect={selectConversationAndSetView}
        />;
      case 'memory':
        return <MemoryPanel selectedAgent={selectedAgent} />;
      case 'actions':
        return <ActionsPanel agentId={selectedAgent.id} />;
      case 'webhookDetail':
        if (!selectedWebhook) return <div>No webhook selected.</div>;
        return <WebhookDetailPanel webhook={selectedWebhook} onEventClick={selectConversationAndSetView} />;
      case 'toolDetail':
        if (!selectedTool) return <div>No tool selected.</div>;
        return <ToolDetailPanel searchApiTool={selectedTool} />;
      default:
        return (
            <ChatInterface
                userInitials={getClerkUserInitials()}
                agentFirstName={selectedAgent.firstName}
                agentLastName={selectedAgent.lastName}
                chat={chatMiddlePanel}
            />
        );
    }
  };

  return <div className="flex-1 flex flex-col overflow-hidden">{renderContent()}</div>;
} 