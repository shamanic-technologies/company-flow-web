'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Agent, Conversation, SearchApiToolResultItem } from '@agent-base/types';
import { Message as VercelMessage } from 'ai/react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
import { UserResource } from '@clerk/types';

import { useAgents } from '../../../hooks/useAgents';
import { useConversations } from '../../../hooks/useConversations';
import { useWebhooks } from '../../../hooks/useWebhooks';
import { useApiTools } from '../../../hooks/useApiTools';
import { usePlanInfo } from '../../../hooks/usePlanInfo';
import { PlanInfo } from '@/types/credit';

import { useAgentPolling } from '../../../hooks/polling/useAgentPolling';
import { useConversationPolling } from '../../../hooks/polling/useConversationPolling';
// import { useMessagePolling } from '../../../hooks/polling/useMessagePolling'; // Still commented out

import { SearchWebhookResultItem } from '@agent-base/types';
import { useMessages } from '../../../hooks/useMessages';

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

  // Agents
  agents: Agent[];
  isLoadingAgents: boolean;
  agentError: string | null;
  selectedAgentIdMiddlePanel: string | null;
  selectedAgentIdRightPanel: string | null;
  selectAgentMiddlePanel: (agentId: string | null) => void;
  selectAgentRightPanel: (agentId: string | null) => void;
  
  // Conversations
  conversationList: Conversation[]; 
  currentConversationIdMiddlePanel: string | null;
  isLoadingConversationsMiddlePanel: boolean; // Loading state for the conversation list itself
  conversationError: string | null; // Errors related to fetching/creating conversations

  // Middle Panel Messages
  currentMessagesMiddlePanel: VercelMessage[]; // Messages for the middle panel's active conversation
  isLoadingMessagesMiddlePanel: boolean; // Loading state for these messages
  messageError: string | null; // Errors related to fetching these messages

  // Right Panel specific states (sourced from useConversations)
  currentConversationIdRightPanel: string | null;
  isLoadingConversationsRightPanel: boolean; // Loading state for right panel specific conversation actions/data
  isCreatingConversationRightPanel: boolean; // Specifically for creating a new chat in the right panel

  // Right panel messages are managed locally if it has a dedicated message stream
  currentMessagesRightPanel: VercelMessage[]; 
  isLoadingMessagesRightPanel: boolean;

  // Functions for selecting conversations in different panels
  selectConversationIdMiddlePanel: (conversationId: string | null) => void;
  selectConversationIdRightPanel: (conversationId: string | null) => void;
  handleCreateNewChatRightPanel: () => Promise<string | null>; // Function to create chat for right panel

  // Webhooks
  userWebhooks: SearchWebhookResultItem[];
  selectedWebhook: SearchWebhookResultItem | null;
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

  // Action wrappers combining state updates and view changes
  selectAgentAndSetView: (agentId: string | null) => void;
  selectConversationAndSetView: (conversationId: string | null) => void; // Assumed for Middle Panel
  createNewChatAndSetView: () => Promise<void>; // Assumed for Right Panel
  selectWebhookAndSetView: (webhook: SearchWebhookResultItem | null) => void;
  selectToolAndSetView: (tool: SearchApiToolResultItem | null) => void;
  refreshAgents: () => Promise<void>;
  refreshConversations: () => Promise<void>; // Refreshes the master list of conversations
}

export const DashboardContext = createContext<DashboardContextType>({
  clerkUser: undefined,
  isClerkLoading: true,
  isSignedIn: undefined,
  handleClerkLogout: async () => { console.error("handleClerkLogout called on default context"); },
  getClerkUserInitials: () => '?',
  agents: [],
  selectedAgentIdMiddlePanel: null,
  selectedAgentIdRightPanel: null,
  selectAgentMiddlePanel: () => { console.warn("selectAgentMiddlePanel called on default context"); },
  selectAgentRightPanel: () => { console.warn("selectAgentRightPanel called on default context"); },
  isLoadingAgents: false,
  agentError: null,
  conversationList: [],
  currentConversationIdMiddlePanel: null,
  isLoadingConversationsMiddlePanel: false,
  conversationError: null,
  currentMessagesMiddlePanel: [],
  isLoadingMessagesMiddlePanel: false,
  messageError: null,
  currentConversationIdRightPanel: null,
  isLoadingConversationsRightPanel: false,
  isCreatingConversationRightPanel: false,
  currentMessagesRightPanel: [],
  isLoadingMessagesRightPanel: false,
  selectConversationIdMiddlePanel: () => { console.warn("selectConversationIdMiddlePanel called on default context"); },
  selectConversationIdRightPanel: () => { console.warn("selectConversationIdRightPanel called on default context"); },
  handleCreateNewChatRightPanel: async () => { console.warn("handleCreateNewChatRightPanel called on default context"); return null; },
  userWebhooks: [],
  selectedWebhook: null,
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
  // Default plan info values
  planInfo: null,
  isLoadingPlanInfo: true, // Default to true as it will likely load on init
  planInfoError: null,
  fetchPlanInfo: async () => { console.warn("refetchPlanInfo called on default context"); },
  // updateCreditBalanceLocally: () => { console.warn("updateCreditBalanceLocally called on default context"); },
  selectAgentAndSetView: () => {},
  selectConversationAndSetView: () => {},
  createNewChatAndSetView: async () => {},
  selectWebhookAndSetView: () => {},
  selectToolAndSetView: () => { console.warn("selectToolAndSetView called on default context"); },
  refreshAgents: async () => { console.warn("refreshAgents called on default context"); },
  refreshConversations: async () => { console.warn("refreshConversations called on default context"); },
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { isSignedIn } = useClerkAuth();
  const { signOut } = useClerk();

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
  } = useAgents({ handleLogout: handleClerkLogout });

  const {
    conversationList, 
    currentConversationIdMiddlePanel, // From useConversations
    currentConversationIdRightPanel,  // From useConversations
    selectConversationIdMiddlePanel,  // From useConversations
    selectConversationIdRightPanel,   // From useConversations
    isLoadingConversationsMiddlePanel,// From useConversations (for list)
    isLoadingConversationsRightPanel, // From useConversations (for right panel specific ops)
    isCreatingConversationRightPanel, // From useConversations
    conversationError, 
    handleCreateNewChatRightPanel,    // From useConversations
    refreshConversationList,
    currentMessages,                 // For Middle Panel messages (from useMessages via useConversations)
    isLoadingMessages,               // For Middle Panel messages loading (from useMessages via useConversations)
    messageError,                    // For Middle Panel messages error (from useMessages via useConversations)
    fetchMessages,                   // For Middle Panel messages fetch (from useMessages via useConversations)
  } = useConversations({ 
    selectedAgentIdMiddlePanel, 
    selectedAgentIdRightPanel, 
    user: clerkUser, 
    handleLogout: handleClerkLogout 
  });

  // Assign Middle Panel messages from useConversations hook's output
  const currentMessagesMiddlePanel = currentMessages;
  const isLoadingMessagesMiddlePanel = isLoadingMessages;
  // messageError is already correctly named

  const { 
    userWebhooks, 
    selectedWebhook, 
    selectWebhook, 
    isLoadingWebhooks, 
    webhookError, 
    fetchUserWebhooks 
  } = useWebhooks({ handleLogout: handleClerkLogout });

  // --- API Tools Hook ---
  const {
    apiTools,
    isLoadingApiTools,
    apiToolsError,
    fetchApiTools,
  } = useApiTools({ handleLogout: handleClerkLogout });

  // --- Plan Info Hook ---
  const {
    planInfo: planInfo,
    isLoading: isLoadingPlanInfo,
    error: planInfoError,
    fetch: fetchPlanInfoFromHook
  } = usePlanInfo();

  const [activeAgentView, setActiveAgentView] = useState<ActiveAgentView>('conversations');
  const [selectedTool, setSelectedTool] = useState<SearchApiToolResultItem | null>(null);
  const POLLING_INTERVAL = 5000;

  // State for the plan info that will be displayed and can be locally updated
  const [displayPlanInfo, setDisplayPlanInfo] = useState<PlanInfo | null>(null);

  // Effect to initialize and update displayPlanInfo when fetchedPlanInfo changes
  useEffect(() => {
    if (planInfo) {
      setDisplayPlanInfo(planInfo);
    }
  }, [planInfo]);

  // // Function to update only the credit balance locally
  // const updateCreditBalanceLocally = useCallback((newBalanceInUSDCents: number) => {
  //   setDisplayPlanInfo(prevInfo => {
  //     if (prevInfo) {
  //       return { ...prevInfo, creditBalanceInUSDCents: newBalanceInUSDCents };
  //     }
  //     // If prevInfo is null, we might initialize a partial PlanInfo object.
  //     // This depends on how PlanInfo is structured and what's acceptable.
  //     // For now, assuming PlanInfo might have other mandatory fields,
  //     // it's safer to only update if prevInfo exists.
  //     // Or, ensure PlanInfo type allows partial initialization for this case.
  //     console.warn("[DashboardContext] updateCreditBalanceLocally called when displayPlanInfo is null. Balance not updated.");
  //     return prevInfo; // Or return a new minimal PlanInfo object if appropriate
  //   });
  // }, []);

  // The refetchPlanInfo exposed by context will now use refetchFetchedPlanInfo
  // and rely on the useEffect above to update displayPlanInfo.
  const fetchPlanInfo = useCallback(async () => {
    await fetchPlanInfoFromHook();
  }, [fetchPlanInfoFromHook]);

  useAgentPolling({ fetchAgents, pollingInterval: POLLING_INTERVAL, isSignedIn });
  useConversationPolling({ refreshConversations: refreshConversationList, pollingInterval: POLLING_INTERVAL, isSignedIn });

  // useMessagePolling for middle panel messages (if re-enabled)
  // useMessagePolling({
  //   fetchMessages: fetchMessages, 
  //   currentConversationIdMiddlePanel: currentConversationIdMiddlePanel,
  //   pollingInterval: POLLING_INTERVAL,
  //   isSignedIn,
  //   activeAgentView,
  // });

  const selectAgentAndSetView = useCallback((agentId: string | null) => {
    selectAgentMiddlePanel(agentId); // Set selected agent for the middle panel
    if (agentId) {
      setActiveAgentView('conversations'); 
      selectWebhook(null); 
    } else {
      selectWebhook(null);
    }
  }, [selectAgentMiddlePanel, selectWebhook]);

  // This action wrapper is for the Middle Panel / main conversation view
  const selectConversationAndSetView = useCallback((conversationId: string | null) => {
    selectConversationIdMiddlePanel(conversationId); // Use the setter from useConversations
    if (conversationId) {
      setActiveAgentView('chat');
    }
  }, [selectConversationIdMiddlePanel, setActiveAgentView]);

  // This action wrapper is for the Right Panel's new chat functionality
  const createNewChatAndSetView = useCallback(async () => {
    const newConvId = await handleCreateNewChatRightPanel(); // Use the specific function from useConversations
    if (newConvId) {
      // Optionally, focus the right panel or set its active view if it has one
      // For now, setting main view to chat assuming it might relate to the new convo
      setActiveAgentView('chat'); 
    }
  }, [handleCreateNewChatRightPanel, setActiveAgentView]);

  const selectWebhookAndSetView = useCallback((webhook: SearchWebhookResultItem | null) => {
    selectWebhook(webhook);
    if (webhook) {
      setActiveAgentView('webhookDetail');
      setSelectedTool(null);
    } else {
      if (selectedAgentIdMiddlePanel) { // Revert to conversations if an agent is selected
        setActiveAgentView('conversations');
      }
    }
  }, [selectWebhook, setActiveAgentView, selectedAgentIdMiddlePanel, selectedWebhook]);

  const selectToolAndSetView = useCallback((tool: SearchApiToolResultItem | null) => {
    setSelectedTool(tool);
    if (tool) {
      setActiveAgentView('toolDetail');
      selectWebhook(null);
    } else {
      if (selectedAgentIdMiddlePanel) {
        setActiveAgentView('conversations');
      } else if (selectedWebhook) {
        setActiveAgentView('webhookDetail');
      } else {
        // For now, let MiddlePanel handle a null tool. If activeView is still 'toolDetail', it shows "select a tool".
      }
    }
  }, [setActiveAgentView, selectWebhook, selectedAgentIdMiddlePanel, selectedWebhook]);

  const isClerkLoading = !clerkIsLoaded;

  // --- Messages for Right Panel (NEW INSTANCE of useMessages) ---
  const {
    currentMessages: currentMessagesRightPanel, // Renamed for context
    isLoadingMessages: isLoadingMessagesRightPanel, // Renamed for context
    messageError: messageErrorRightPanel,       // Renamed for context
    fetchMessages: fetchMessagesRightPanel,     // Renamed for context
  } = useMessages({ 
    conversationId: currentConversationIdRightPanel, 
    handleLogout: handleClerkLogout 
  });

  const contextValue = useMemo(() => ({
    clerkUser,
    isClerkLoading,
    isSignedIn,
    handleClerkLogout,
    getClerkUserInitials,
    agents,
    selectedAgentIdMiddlePanel,
    selectedAgentIdRightPanel,
    selectAgentMiddlePanel,
    selectAgentRightPanel,
    isLoadingAgents,
    agentError,
    conversationList,
    currentConversationIdMiddlePanel,
    isLoadingConversationsMiddlePanel, // For the list itself
    conversationError, // General conversation error (list/create)
    
    // Middle Panel Messages
    currentMessagesMiddlePanel,
    isLoadingMessagesMiddlePanel,
    messageError, // Specific message error for middle panel

    // Right Panel Conversation and Messages
    currentConversationIdRightPanel,
    isLoadingConversationsRightPanel, // For right panel conversation operations (like create)
    isCreatingConversationRightPanel,
    currentMessagesRightPanel,      // From the new useMessages instance for right panel
    isLoadingMessagesRightPanel,    // From the new useMessages instance for right panel
    messageErrorRightPanel,         // Specific message error for right panel
    
    selectConversationIdMiddlePanel,
    selectConversationIdRightPanel,
    handleCreateNewChatRightPanel,
    
    userWebhooks,
    selectedWebhook,
    isLoadingWebhooks,
    webhookError,
    fetchUserWebhooks,
    
    activeAgentView,
    setActiveAgentView,
    
    apiTools,
    isLoadingApiTools,
    apiToolsError,
    fetchApiTools,
    
    selectedTool,

    // Plan Info from context
    planInfo: displayPlanInfo,
    isLoadingPlanInfo,
    planInfoError,
    fetchPlanInfo,
    // updateCreditBalanceLocally,
    
    selectAgentAndSetView,
    selectConversationAndSetView,
    createNewChatAndSetView,
    selectWebhookAndSetView,
    selectToolAndSetView,
    
    refreshAgents: fetchAgents,
    refreshConversations: refreshConversationList,
    refreshApiTools: fetchApiTools,
    fetchMessagesMiddlePanel: fetchMessages,
    fetchMessagesRightPanel,
  }), [
    clerkUser, isClerkLoading, isSignedIn, handleClerkLogout, getClerkUserInitials,
    agents, selectedAgentIdMiddlePanel, selectedAgentIdRightPanel, selectAgentMiddlePanel, selectAgentRightPanel, isLoadingAgents, agentError, fetchAgents,
    conversationList, currentConversationIdMiddlePanel, isLoadingConversationsMiddlePanel, conversationError, 
    currentMessagesMiddlePanel, isLoadingMessagesMiddlePanel, messageError, 
    currentConversationIdRightPanel, isLoadingConversationsRightPanel, isCreatingConversationRightPanel, 
    currentMessagesRightPanel, isLoadingMessagesRightPanel, messageErrorRightPanel,
    selectConversationIdMiddlePanel, selectConversationIdRightPanel, handleCreateNewChatRightPanel,
    userWebhooks, selectedWebhook, isLoadingWebhooks, webhookError, fetchUserWebhooks,
    activeAgentView, 
    apiTools, isLoadingApiTools, apiToolsError, fetchApiTools,
    selectedTool,
    // Add plan info dependencies
    displayPlanInfo, isLoadingPlanInfo, planInfoError, fetchPlanInfo,
    // updateCreditBalanceLocally,
    selectAgentAndSetView, selectConversationAndSetView, createNewChatAndSetView, selectWebhookAndSetView, 
    selectToolAndSetView,
    refreshConversationList, fetchMessages, fetchMessagesRightPanel,
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