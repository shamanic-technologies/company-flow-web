'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { SearchApiToolResultItem, SearchWebhookResultItem, DashboardInfo } from '@agent-base/types';
import { useAgentPolling } from '@/hooks/polling/useAgentPolling';
import { useConversationPolling } from '@/hooks/polling/useConversationPolling';
import { useAgentContext } from './AgentProvider';
import { useConversationContext } from './ConversationProvider';
import { useApiToolsContext } from './ApiToolsProvider';
import { useWebhookContext } from './WebhookProvider';
import { useUserContext } from './UserProvider';
import { useOrganizationContext } from './OrganizationProvider';

type ActiveAgentView = 'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail' | 'toolDetail' | 'dashboard';

interface ViewContextType {
  activeAgentView: ActiveAgentView;
  setActiveAgentView: (view: ActiveAgentView) => void;
  selectedTool: SearchApiToolResultItem | null;
  selectedWebhook: SearchWebhookResultItem | null;
  selectedDashboard: DashboardInfo | null;
  selectAgentAndSetView: (agentId: string | null) => void;
  selectConversationAndSetView: (conversationId: string | null) => void;
  createNewChatAndSetView: () => Promise<void>;
  selectWebhookAndSetView: (webhook: SearchWebhookResultItem | null) => void;
  selectToolAndSetView: (tool: SearchApiToolResultItem | null) => void;
  selectDashboardAndSetView: (dashboard: DashboardInfo | null) => void;
  initialPrompt: string | null;
  setInitialPrompt: (prompt: string | null) => void;
}

export const ViewContext = createContext<ViewContextType>({
  activeAgentView: 'conversations',
  setActiveAgentView: () => {},
  selectedTool: null,
  selectedWebhook: null,
  selectedDashboard: null,
  selectAgentAndSetView: () => {},
  selectConversationAndSetView: () => {},
  createNewChatAndSetView: async () => {},
  selectWebhookAndSetView: () => {},
  selectToolAndSetView: () => {},
  selectDashboardAndSetView: () => {},
  initialPrompt: null,
  setInitialPrompt: () => {},
});

export function ViewProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useUserContext();
  const { activeOrgId } = useOrganizationContext();
  const { fetchAgents, selectAgentMiddlePanel, selectedAgentIdMiddlePanel } = useAgentContext();
  const { conversationList, selectConversationIdMiddlePanel, handleCreateNewChatRightPanel, refreshConversationList } = useConversationContext();
  const { fetchUserWebhooks } = useWebhookContext();
  const { fetchApiTools } = useApiToolsContext();

  const [activeAgentView, setActiveAgentView] = useState<ActiveAgentView>('conversations');
  const [selectedTool, setSelectedTool] = useState<SearchApiToolResultItem | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<SearchWebhookResultItem | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardInfo | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  
  const POLLING_INTERVAL = 5000;

  useAgentPolling({ fetchAgents, pollingInterval: POLLING_INTERVAL, isSignedIn, activeOrgId });
  useConversationPolling({ refreshConversations: refreshConversationList, pollingInterval: POLLING_INTERVAL, isSignedIn, activeOrgId });

  const selectAgentAndSetView = useCallback((agentId: string | null) => {
    selectAgentMiddlePanel(agentId);
    if (agentId) {
      setActiveAgentView('conversations'); 
      setSelectedWebhook(null); 
      setSelectedTool(null);
    } 
  }, [selectAgentMiddlePanel]);

  const selectConversationAndSetView = useCallback((conversationId: string | null) => {
    if (conversationId) {
      const conversation = conversationList.find(c => c.conversationId === conversationId);
      if (conversation?.agentId) {
        selectAgentMiddlePanel(conversation.agentId); 
      }
      selectConversationIdMiddlePanel(conversationId);
      setActiveAgentView('chat');
    } else {
      selectConversationIdMiddlePanel(null);
    }
  }, [selectConversationIdMiddlePanel, selectAgentMiddlePanel, conversationList]);

  const createNewChatAndSetView = useCallback(async () => {
    await handleCreateNewChatRightPanel();
  }, [handleCreateNewChatRightPanel]);

  const selectWebhookAndSetView = useCallback((webhook: SearchWebhookResultItem | null) => {
    setSelectedWebhook(webhook);
    if (webhook) {
      setActiveAgentView('webhookDetail');
      setSelectedTool(null);
    } else {
      if (selectedAgentIdMiddlePanel) setActiveAgentView('conversations');
    }
  }, [selectedAgentIdMiddlePanel]);

  const selectToolAndSetView = useCallback((tool: SearchApiToolResultItem | null) => {
    setSelectedTool(tool);
    if (tool) {
      setActiveAgentView('toolDetail');
      setSelectedWebhook(null);
    } else {
      if (selectedAgentIdMiddlePanel) setActiveAgentView('conversations');
    }
  }, [selectedAgentIdMiddlePanel]);

  const selectDashboardAndSetView = useCallback((dashboard: DashboardInfo | null) => {
    setSelectedDashboard(dashboard);
    setActiveAgentView('dashboard'); 
    selectAgentMiddlePanel(null);
    setSelectedWebhook(null);
    setSelectedTool(null);
  }, [selectAgentMiddlePanel]);

  const contextValue = useMemo(() => ({
    activeAgentView,
    setActiveAgentView,
    selectedTool,
    selectedWebhook,
    selectedDashboard,
    selectAgentAndSetView,
    selectConversationAndSetView,
    createNewChatAndSetView,
    selectWebhookAndSetView,
    selectToolAndSetView,
    selectDashboardAndSetView,
    initialPrompt,
    setInitialPrompt,
  }), [
    activeAgentView,
    selectedTool,
    selectedWebhook,
    selectedDashboard,
    selectAgentAndSetView,
    selectConversationAndSetView,
    createNewChatAndSetView,
    selectWebhookAndSetView,
    selectToolAndSetView,
    selectDashboardAndSetView,
    initialPrompt,
  ]);
  
  return (
    <ViewContext.Provider value={contextValue}>
      {children}
    </ViewContext.Provider>
  );
}

export function useViewContext() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
} 