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

type ActiveView = 'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail' | 'toolDetail' | 'dashboard' | 'agents';

interface ViewContextType {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
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
  activeView: 'conversations',
  setActiveView: () => {},
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
  const { fetchAgents, selectAgentId, selectedAgentId } = useAgentContext();
  const { conversationList, selectConversationId, handleCreateNewChat, refreshConversationList } = useConversationContext();
  const { fetchUserWebhooks } = useWebhookContext();
  const { fetchApiTools } = useApiToolsContext();

  const [activeView, setActiveView] = useState<ActiveView>('conversations');
  const [selectedTool, setSelectedTool] = useState<SearchApiToolResultItem | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<SearchWebhookResultItem | null>(null);
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardInfo | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  
  const POLLING_INTERVAL = 5000;

  useAgentPolling({ fetchAgents, pollingInterval: POLLING_INTERVAL, isSignedIn, activeOrgId });
  useConversationPolling({ refreshConversations: refreshConversationList, pollingInterval: POLLING_INTERVAL, isSignedIn, activeOrgId });

  const selectAgentAndSetView = useCallback((agentId: string | null) => {
    selectAgentId(agentId);
    if (agentId) {
      setActiveView('conversations'); 
      setSelectedWebhook(null); 
      setSelectedTool(null);
    } 
  }, [selectAgentId]);

  const selectConversationAndSetView = useCallback((conversationId: string | null) => {
    if (conversationId) {
      const conversation = conversationList.find(c => c.conversationId === conversationId);
      if (conversation?.agentId) {
        selectAgentId(conversation.agentId); 
      }
      selectConversationId(conversationId);
      setActiveView('chat');
    } else {
      selectConversationId(null);
    }
  }, [selectConversationId, selectAgentId, conversationList]);

  const createNewChatAndSetView = useCallback(async () => {
    await handleCreateNewChat();
  }, [handleCreateNewChat]);

  const selectWebhookAndSetView = useCallback((webhook: SearchWebhookResultItem | null) => {
    setSelectedWebhook(webhook);
    if (webhook) {
      setActiveView('webhookDetail');
      setSelectedTool(null);
    } else {
      if (selectedAgentId) setActiveView('conversations');
    }
  }, [selectedAgentId]);

  const selectToolAndSetView = useCallback((tool: SearchApiToolResultItem | null) => {
    setSelectedTool(tool);
    if (tool) {
      setActiveView('toolDetail');
      setSelectedWebhook(null);
    } else {
      if (selectedAgentId) setActiveView('conversations');
    }
  }, [selectedAgentId]);

  const selectDashboardAndSetView = useCallback((dashboard: DashboardInfo | null) => {
    setSelectedDashboard(dashboard);
    setActiveView('dashboard'); 
    selectAgentId(null);
    setSelectedWebhook(null);
    setSelectedTool(null);
  }, [selectAgentId]);

  const contextValue = useMemo(() => ({
    activeView,
    setActiveView,
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
    activeView,
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