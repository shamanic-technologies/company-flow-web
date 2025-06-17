'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Agent, Conversation, SearchApiToolResultItem, ClientOrganization } from '@agent-base/types';
import { Message as VercelMessage } from 'ai/react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';

import { useAgents } from '../../../hooks/useAgents';
import { useConversations } from '../../../hooks/useConversations';
import { useWebhooks } from '../../../hooks/useWebhooks';
import { useApiTools } from '../../../hooks/useApiTools';
import { usePlanInfo } from '../../../hooks/usePlanInfo';
import { PlanInfo, CreditBalance } from '@/types/credit';
import { useOrganizations } from '../../../hooks/useOrganizations';

import { useAgentPolling } from '../../../hooks/polling/useAgentPolling';
import { useConversationPolling } from '../../../hooks/polling/useConversationPolling';
import { useMessagePolling } from '../../../hooks/polling/useMessagePolling';
import { useConversationMessages } from '../../../hooks/useConversationMessages';

import { SearchWebhookResultItem } from '@agent-base/types';
import { useCredits } from '../../../hooks/useCredits';

// --- BEGIN MODIFICATION ---
// Import the ToolItem type, assuming it might be defined in Sidebar or a shared types file
// For now, let's define a placeholder here or import if available.
// We'll use the one from Sidebar for now, which should be moved to a central location.
// import { ToolItem as ImportedToolItem } from '../left-panel/ToolSubfolder'; // No longer needed, will use ApiTool
// --- END MODIFICATION ---

type ActiveAgentView = 'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail' | 'toolDetail';

interface DashboardContextType {
  // Clerk user
  clerkUser: UserResource | null | undefined;
  isClerkLoading: boolean;
  isSignedIn: boolean | undefined;
  handleClerkLogout: () => Promise<void>;
  getClerkUserInitials: () => string;

  // Organizations - Sourced from useOrganizations hook
  organizations: ClientOrganization[];
  currentOrganization: ClientOrganization | null;
  activeOrgId: string | null | undefined; // This will come from useOrganizations
  isLoadingOrganizations: boolean;
  organizationError: string | null;
  switchOrganization: (organizationId: string) => Promise<void>; 
  
  // Agents
  agents: Agent[];
  isLoadingAgents: boolean;
  agentError: string | null;
  selectedAgentIdMiddlePanel: string | null;
  selectedAgentIdRightPanel: string | null;
  selectAgentMiddlePanel: (agentId: string | null) => void;
  selectAgentRightPanel: (agentId: string | null) => void;
  fetchAgents: () => Promise<void>;
  
  // Conversations
  conversationList: Conversation[]; 
  currentConversationIdMiddlePanel: string | null;
  isLoadingConversationsMiddlePanel: boolean; // Loading state for the conversation list itself
  conversationError: string | null; // Errors related to fetching/creating conversations

  // Middle Panel Messages
  currentMessagesMiddlePanel: VercelMessage[]; // Messages for the middle panel's active conversation
  isLoadingMessagesMiddlePanel: boolean; // Loading state for these messages
  messageErrorMiddlePanel: string | null; // Errors related to fetching these messages

  // Right Panel specific states (sourced from useConversations)
  currentConversationIdRightPanel: string | null;
  isLoadingConversationsRightPanel: boolean; // Loading state for right panel specific conversation actions/data
  isCreatingConversationRightPanel: boolean; // Specifically for creating a new chat in the right panel

  // Right panel messages are managed locally if it has a dedicated message stream
  currentMessagesRightPanel: VercelMessage[]; 
  isLoadingMessagesRightPanel: boolean;
  messageErrorRightPanel?: string | null; // Added optional based on previous context values

  // Functions for selecting conversations in different panels
  selectConversationIdMiddlePanel: (conversationId: string | null) => void;
  selectConversationIdRightPanel: (conversationId: string | null) => void;
  handleCreateNewChatRightPanel: () => Promise<string | null>; // Function to create chat for right panel

  // Webhooks
  userWebhooks: SearchWebhookResultItem[];
  selectedWebhook: SearchWebhookResultItem | null;
  selectWebhook: (webhook: SearchWebhookResultItem | null) => void;
  isLoadingWebhooks: boolean;
  webhookError: string | null;
  fetchUserWebhooks: () => Promise<void>;

  activeAgentView: ActiveAgentView;
  setActiveAgentView: (view: ActiveAgentView) => void;

  // API Tools state
  apiTools: SearchApiToolResultItem[];
  isLoadingApiTools: boolean;
  apiToolsError: string | null;
  fetchApiTools: () => Promise<void>; // Function to manually refresh API tools

  // Tools
  selectedTool: SearchApiToolResultItem | null;
  // isLoadingToolDetail: boolean;
  // toolDetailError: string | null;

  // Plan Info state from usePlanInfo
  planInfo: PlanInfo | null;
  isLoadingPlanInfo: boolean;
  planInfoError: string | null;
  fetchPlanInfo: () => Promise<void>;
  // updateCreditBalanceLocally: (newBalanceInUSDCents: number) => void;

  // Credits - Explicitly define all credit fields
  isValidating: boolean;
  isConsuming: boolean;
  creditBalance: CreditBalance | null;
  error: string | null; // This is the 'error' from useCredits
  validateCredits: (estimatedCredits?: number) => Promise<boolean>;
  consumeCredits: (totalAmountInUSDCents: number, conversationId: string) => Promise<boolean>;
  clearError: () => void;

  // Action wrappers combining state updates and view changes
  selectAgentAndSetView: (agentId: string | null) => void;
  selectConversationAndSetView: (conversationId: string | null) => void; // Assumed for Middle Panel
  createNewChatAndSetView: () => Promise<void>; // Assumed for Right Panel
  selectWebhookAndSetView: (webhook: SearchWebhookResultItem | null) => void;
  selectToolAndSetView: (tool: SearchApiToolResultItem | null) => void;
  refreshAgents: () => Promise<void>;
  refreshConversations: () => Promise<void>; // Refreshes the master list of conversations
  refreshApiTools?: () => Promise<void>; // Added optional for completeness
  fetchMessagesMiddlePanel?: (conversationId: string) => Promise<void>; // Expects no arguments
  fetchMessagesRightPanel?: (conversationId: string) => Promise<void>;  // Expects no arguments

  // For handling the initial prompt from the landing page
  initialPrompt: string | null;
  setInitialPrompt: (prompt: string | null) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  clerkUser: undefined,
  isClerkLoading: true,
  isSignedIn: undefined,
  handleClerkLogout: async () => { console.error("handleClerkLogout called on default context"); },
  getClerkUserInitials: () => '?',
  organizations: [],
  currentOrganization: null,
  activeOrgId: null,
  isLoadingOrganizations: false,
  organizationError: null,
  switchOrganization: async () => { console.warn("switchOrganization called on default context"); },
  agents: [],
  selectedAgentIdMiddlePanel: null,
  selectedAgentIdRightPanel: null,
  selectAgentMiddlePanel: () => { console.warn("selectAgentMiddlePanel called on default context"); },
  selectAgentRightPanel: () => { console.warn("selectAgentRightPanel called on default context"); },
  fetchAgents: async () => { console.warn("fetchAgents called on default context"); },
  isLoadingAgents: false,
  agentError: null,
  conversationList: [],
  currentConversationIdMiddlePanel: null,
  isLoadingConversationsMiddlePanel: false,
  conversationError: null,
  currentMessagesMiddlePanel: [],
  isLoadingMessagesMiddlePanel: false,
  messageErrorMiddlePanel: null,
  currentConversationIdRightPanel: null,
  isLoadingConversationsRightPanel: false,
  isCreatingConversationRightPanel: false,
  currentMessagesRightPanel: [],
  isLoadingMessagesRightPanel: false,
  messageErrorRightPanel: null,
  selectConversationIdMiddlePanel: () => { console.warn("selectConversationIdMiddlePanel called on default context"); },
  selectConversationIdRightPanel: () => { console.warn("selectConversationIdRightPanel called on default context"); },
  handleCreateNewChatRightPanel: async () => { console.warn("handleCreateNewChatRightPanel called on default context"); return null; },
  refreshConversations: async () => { console.warn("refreshConversations called on default context"); },
  userWebhooks: [],
  selectedWebhook: null,
  selectWebhook: () => { console.warn("selectWebhook called on default context"); },
  isLoadingWebhooks: false,
  webhookError: null,
  fetchUserWebhooks: async () => { console.warn("fetchUserWebhooks called on default context"); },
  activeAgentView: 'conversations',
  setActiveAgentView: () => {},
  apiTools: [],
  isLoadingApiTools: false,
  apiToolsError: null,
  fetchApiTools: async () => { console.warn("fetchApiTools called on default context"); },
  selectedTool: null,
  planInfo: null,
  isLoadingPlanInfo: true,
  planInfoError: null,
  fetchPlanInfo: async () => { console.warn("fetchPlanInfo called on default context"); },
  isValidating: false,
  isConsuming: false,
  creditBalance: null,
  error: null,
  validateCredits: async () => { console.warn("validateCredits default called"); return false; },
  consumeCredits: async () => { console.warn("consumeCredits default called"); return false; },
  clearError: () => { console.warn("clearError default called"); },
  selectAgentAndSetView: () => {},
  selectConversationAndSetView: () => {},
  createNewChatAndSetView: async () => {},
  selectWebhookAndSetView: () => {},
  selectToolAndSetView: () => { console.warn("selectToolAndSetView called on default context"); },
  refreshAgents: async () => { console.warn("refreshAgents called on default context"); },
  refreshApiTools: async () => { console.warn("refreshApiTools called on default context"); },
  fetchMessagesMiddlePanel: async (conversationId: string) => { console.warn("fetchMessagesMiddlePanel called on default context with", conversationId); },
  fetchMessagesRightPanel: async (conversationId: string) => { console.warn("fetchMessagesRightPanel called on default context with", conversationId); },
  initialPrompt: null,
  setInitialPrompt: () => {},
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { isSignedIn, orgId: activeOrgIdFromClerkAuth, isLoaded: authIsLoaded } = useClerkAuth();
  const { signOut } = useClerk();

  const {
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    organizationError,
    switchOrganization,
    activeOrgId, // This is the authoritative activeOrgId from useOrganizations
  } = useOrganizations();

  const handleClerkLogout = useCallback(async () => {
    console.log("DashboardContext: Signing out with Clerk...");
    try {
      await signOut(() => { router.push('/'); console.log("DashboardContext: Clerk signOut successful, redirecting to /"); });
    } catch (error) {
      console.error("DashboardContext: Error during Clerk signOut:", error);
      router.push('/');
    }
  }, [signOut, router]);

  const getClerkUserInitials = useCallback(() => {
    if (!clerkUser) return '?';
    const { firstName, lastName, primaryEmailAddress } = clerkUser;
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (primaryEmailAddress) return primaryEmailAddress.emailAddress[0].toUpperCase();
    return '?';
  }, [clerkUser]);
  
  const {
    agents, 
    selectedAgentIdMiddlePanel, 
    selectedAgentIdRightPanel, 
    selectAgentMiddlePanel,    
    selectAgentRightPanel,     
    isLoadingAgents, 
    agentError, 
    fetchAgents 
  } = useAgents({ handleLogout: handleClerkLogout, activeOrgId });

  const {
    conversationList, 
    currentConversationIdMiddlePanel,
    currentConversationIdRightPanel,
    selectConversationIdMiddlePanel,
    selectConversationIdRightPanel,
    isLoadingConversationsMiddlePanel,
    isLoadingConversationsRightPanel,
    isCreatingConversationRightPanel,
    conversationError, 
    handleCreateNewChatRightPanel,
    refreshConversationList,
    currentMessagesMiddlePanel,
    isLoadingMessagesMiddlePanel,
    messageErrorMiddlePanel,
    fetchMessagesMiddlePanel,
  } = useConversations({ 
    selectedAgentIdMiddlePanel, 
    selectedAgentIdRightPanel, 
    user: clerkUser, 
    handleLogout: handleClerkLogout, 
    activeOrgId // Pass activeOrgId
  });

  const { 
    userWebhooks, 
    selectedWebhook, 
    selectWebhook, 
    isLoadingWebhooks, 
    webhookError, 
    fetchUserWebhooks 
  } = useWebhooks({ handleLogout: handleClerkLogout, activeOrgId });

  const {
    apiTools,
    isLoadingApiTools,
    apiToolsError,
    fetchApiTools,
  } = useApiTools({ handleLogout: handleClerkLogout, activeOrgId });

  const {
    planInfo: displayPlanInfo,
    isLoading: isLoadingPlanInfoFromHook,
    error: planInfoErrorFromHook,
    fetch: fetchPlanInfoFromHook
  } = usePlanInfo({ activeOrgId });

  const [activeAgentView, setActiveAgentView] = useState<ActiveAgentView>('conversations');
  const [selectedTool, setSelectedTool] = useState<SearchApiToolResultItem | null>(null);
  const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
  const POLLING_INTERVAL = 5000;

  const fetchPlanInfo = useCallback(async () => {
    await fetchPlanInfoFromHook();
  }, [fetchPlanInfoFromHook]);

  useAgentPolling({ fetchAgents, pollingInterval: POLLING_INTERVAL, isSignedIn, activeOrgId });
  useConversationPolling({ refreshConversations: refreshConversationList, pollingInterval: POLLING_INTERVAL, isSignedIn, activeOrgId });
  
  // Poll for messages in the middle panel's active conversation
  useMessagePolling({
    fetchMessages: fetchMessagesMiddlePanel, // Using the fetcher from the conversations hook
    currentConversationIdMiddlePanel,
    pollingInterval: POLLING_INTERVAL,
    isSignedIn,
    activeAgentView,
    activeOrgId,
  });

  const selectAgentAndSetView = useCallback((agentId: string | null) => {
    selectAgentMiddlePanel(agentId);
    if (agentId) {
      setActiveAgentView('conversations'); 
      selectWebhook(null); 
      setSelectedTool(null);
    } 
  }, [selectAgentMiddlePanel, setActiveAgentView, selectWebhook, setSelectedTool]);

  const selectConversationAndSetView = useCallback((conversationId: string | null) => {
    if (conversationId) {
      const conversation = conversationList.find(c => c.conversationId === conversationId);
      if (conversation && conversation.agentId) {
        // Also select the agent to whom this conversation belongs for the middle panel
        selectAgentMiddlePanel(conversation.agentId); 
      } else {
        // Fallback or error if conversation/agentId not found - might clear agent or log
        // For now, it will proceed without changing the agent, which might be acceptable
        // if the conversation can't be matched to an agent in the current list.
        console.warn(`[DashboardContext] AgentId not found for conversationId: ${conversationId}. Agent selection will not change.`);
      }
      selectConversationIdMiddlePanel(conversationId);
      setActiveAgentView('chat');
    } else {
      // If conversationId is null, clear the selection
      selectConversationIdMiddlePanel(null);
      // Optionally, change view if no conversation is selected, e.g., back to conversation list
      // if (selectedAgentIdMiddlePanel) setActiveAgentView('conversations');
    }
  }, [selectConversationIdMiddlePanel, setActiveAgentView, selectAgentMiddlePanel, conversationList]);

  const createNewChatAndSetView = useCallback(async () => {
    const newConvId = await handleCreateNewChatRightPanel();
    // if (newConvId) { setActiveAgentView('chat'); } 
  }, [handleCreateNewChatRightPanel]);

  const selectWebhookAndSetView = useCallback((webhook: SearchWebhookResultItem | null) => {
    selectWebhook(webhook);
    if (webhook) {
      setActiveAgentView('webhookDetail');
      setSelectedTool(null);
    } else {
      if (selectedAgentIdMiddlePanel) setActiveAgentView('conversations');
    }
  }, [selectWebhook, setActiveAgentView, setSelectedTool, selectedAgentIdMiddlePanel]);

  const selectToolAndSetView = useCallback((tool: SearchApiToolResultItem | null) => {
    setSelectedTool(tool);
    if (tool) {
      setActiveAgentView('toolDetail');
      selectWebhook(null);
    } else {
      if (selectedAgentIdMiddlePanel) setActiveAgentView('conversations');
      else if (selectedWebhook) setActiveAgentView('webhookDetail');
    }
  }, [setSelectedTool, setActiveAgentView, selectWebhook, selectedAgentIdMiddlePanel, selectedWebhook]);

  const isClerkLoading = !clerkIsLoaded || !authIsLoaded;

  const creditsHook = useCredits({ activeOrgId });
  const { 
    currentConversationMessages: currentMessagesRightPanelData,
    isLoadingConversationMessages: isLoadingMessagesRightPanelData,
    conversationMessagesError: messageErrorRightPanelData,
    fetchConversationMessages: fetchMessagesForRightPanelFromHook,
  } = useConversationMessages({ 
    conversationId: currentConversationIdRightPanel, 
    handleLogout: handleClerkLogout, 
    activeOrgId
  });
  
  const fetchMessagesForMiddlePanel = useCallback(async () => {
    if (currentConversationIdMiddlePanel) {
        await fetchMessagesMiddlePanel(currentConversationIdMiddlePanel);
    } else {
        console.warn("[DashboardContext] fetchMessagesForMiddlePanel called without a selected middle panel conversation.");
    }
  }, [currentConversationIdMiddlePanel, fetchMessagesMiddlePanel]);

  const fetchMessagesForRightPanel = useCallback(async () => {
    if (currentConversationIdRightPanel) {
      await fetchMessagesForRightPanelFromHook(currentConversationIdRightPanel);
    } else {
      console.warn("[DashboardContext] fetchMessagesForRightPanel called without a selected right panel conversation.");
    }
  }, [currentConversationIdRightPanel, fetchMessagesForRightPanelFromHook]);

  const contextValue = useMemo(() => ({
    clerkUser,
    isClerkLoading: !clerkIsLoaded || !authIsLoaded,
    isSignedIn,
    handleClerkLogout,
    getClerkUserInitials,
    // Organizations
    organizations,
    currentOrganization,
    activeOrgId,
    isLoadingOrganizations,
    organizationError,
    switchOrganization,
    // Agents
    agents, 
    selectedAgentIdMiddlePanel, 
    selectedAgentIdRightPanel, 
    selectAgentMiddlePanel,    
    selectAgentRightPanel,     
    isLoadingAgents, 
    agentError, 
    fetchAgents, 
    // Conversations
    conversationList, 
    currentConversationIdMiddlePanel, 
    isLoadingConversationsMiddlePanel,
    conversationError, 
    currentMessagesMiddlePanel, 
    isLoadingMessagesMiddlePanel, 
    messageErrorMiddlePanel, 
    currentConversationIdRightPanel, 
    isLoadingConversationsRightPanel, 
    isCreatingConversationRightPanel, 
    currentMessagesRightPanel: currentMessagesRightPanelData, 
    isLoadingMessagesRightPanel: isLoadingMessagesRightPanelData, 
    messageErrorRightPanel: messageErrorRightPanelData,
    selectConversationIdMiddlePanel,  
    selectConversationIdRightPanel,   
    handleCreateNewChatRightPanel, 
    refreshConversations: refreshConversationList,
    // Webhooks
    userWebhooks, 
    selectedWebhook, 
    selectWebhook, 
    isLoadingWebhooks, 
    webhookError, 
    fetchUserWebhooks, 
    // UI State
    activeAgentView, 
    setActiveAgentView,
    // API Tools
    apiTools, 
    isLoadingApiTools, 
    apiToolsError, 
    fetchApiTools, 
    selectedTool,
    // Plan Info
    planInfo: displayPlanInfo, 
    isLoadingPlanInfo: isLoadingPlanInfoFromHook, 
    planInfoError: planInfoErrorFromHook, 
    fetchPlanInfo, 
    // Credits
    isValidating: creditsHook.isValidating,
    isConsuming: creditsHook.isConsuming,
    creditBalance: creditsHook.creditBalance,
    error: creditsHook.error, 
    validateCredits: creditsHook.validateCredits,
    consumeCredits: creditsHook.consumeCredits,
    clearError: creditsHook.clearError,
    // View Setters & Other Actions
    selectAgentAndSetView, 
    selectConversationAndSetView, 
    createNewChatAndSetView, 
    selectWebhookAndSetView, 
    selectToolAndSetView, 
    refreshAgents: fetchAgents, 
    refreshApiTools: fetchApiTools, 
    fetchMessagesMiddlePanel: fetchMessagesForMiddlePanel,
    fetchMessagesRightPanel: fetchMessagesForRightPanel,
    initialPrompt,
    setInitialPrompt,
  }), [
    clerkUser, isClerkLoading, isSignedIn, handleClerkLogout, getClerkUserInitials,
    organizations, currentOrganization, activeOrgId, isLoadingOrganizations, organizationError, switchOrganization,
    agents, selectedAgentIdMiddlePanel, selectedAgentIdRightPanel, selectAgentMiddlePanel, selectAgentRightPanel, isLoadingAgents, agentError, fetchAgents,
    conversationList, currentConversationIdMiddlePanel, isLoadingConversationsMiddlePanel, conversationError, 
    currentMessagesMiddlePanel, isLoadingMessagesMiddlePanel, messageErrorMiddlePanel, 
    currentConversationIdRightPanel, isLoadingConversationsRightPanel, isCreatingConversationRightPanel, 
    currentMessagesRightPanelData, isLoadingMessagesRightPanelData, messageErrorRightPanelData,
    selectConversationIdMiddlePanel, selectConversationIdRightPanel, handleCreateNewChatRightPanel, refreshConversationList,
    userWebhooks, selectedWebhook, selectWebhook, isLoadingWebhooks, webhookError, fetchUserWebhooks,
    activeAgentView, setActiveAgentView,
    apiTools, isLoadingApiTools, apiToolsError, fetchApiTools,
    selectedTool,
    displayPlanInfo, isLoadingPlanInfoFromHook, planInfoErrorFromHook, fetchPlanInfo,
    creditsHook, 
    selectAgentAndSetView, selectConversationAndSetView, createNewChatAndSetView, selectWebhookAndSetView, 
    selectToolAndSetView,
    fetchMessagesForMiddlePanel, fetchMessagesForRightPanel,
    initialPrompt, setInitialPrompt,
  ]);
  
  useEffect(() => {
    if (!isClerkLoading && !isSignedIn) {
      console.log("DashboardContext: User not signed in after Clerk check, redirecting to /");
      router.push('/');
    }
  }, [isClerkLoading, isSignedIn, router]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}