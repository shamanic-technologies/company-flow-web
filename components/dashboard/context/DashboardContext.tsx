'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Added for post-logout redirect
import { ApiKey, Agent, Conversation, Webhook } from '@agent-base/types'; // Removed PlatformUser
import { Message as VercelMessage } from 'ai/react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
import { UserResource } from '@clerk/types';

// Import the new custom hooks (paths might need checking after folder restructure if any)
// import { useAuth } from '../../../hooks/useAuth'; // REMOVED
import { useAgents } from '../../../hooks/useAgents';
import { useConversations } from '../../../hooks/useConversations';
import { useWebhooks } from '../../../hooks/useWebhooks';

// Import polling hooks
import { useAgentPolling } from '../../../hooks/polling/useAgentPolling';
import { useConversationPolling } from '../../../hooks/polling/useConversationPolling';
import { useMessagePolling } from '../../../hooks/polling/useMessagePolling';

import { SearchWebhookResultItem } from '@agent-base/types'; // Import the correct type

type ActiveAgentView = 'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail';

interface DashboardContextType {
  // From Clerk
  clerkUser: UserResource | null | undefined; // From useUser()
  isClerkLoading: boolean; // Derived from !useUser().isLoaded
  isSignedIn: boolean | undefined; // From useClerkAuth()
  handleClerkLogout: () => Promise<void>;
  getClerkUserInitials: () => string;

  // From useAgents
  agents: Agent[];
  isLoadingAgents: boolean;
  agentError: string | null;
  /// Middle Panel
  selectedAgentIdMiddlePanel: string | null;
  /// Right Panel
  selectedAgentIdRightPanel: string | null;
  
  // From useConversations
  conversationList: Conversation[];
  conversationError: string | null;
  /// Middle Panel
  currentConversationIdMiddlePanel: string | null;
  currentMessagesMiddlePanel: VercelMessage[];
  isLoadingConversationsMiddlePanel: boolean;
  isLoadingMessagesMiddlePanel: boolean;
  /// Right Panel
  currentConversationIdRightPanel: string | null;
  currentMessagesRightPanel: VercelMessage[];
  isLoadingConversationsRightPanel: boolean;
  isLoadingMessagesRightPanel: boolean;
  isCreatingConversationRightPanel: boolean;

  // From useWebhooks
  userWebhooks: SearchWebhookResultItem[];
  selectedWebhook: SearchWebhookResultItem | null;
  isLoadingWebhooks: boolean;
  webhookError: string | null;
  fetchUserWebhooks: () => Promise<void>;

  // Direct Context State/Functions
  activeAgentView: ActiveAgentView;
  setActiveAgentView: (view: ActiveAgentView) => void;

  // Action Wrappers
  selectAgentAndSetView: (agentId: string | null) => void;
  selectConversationAndSetView: (conversationId: string | null) => void;
  createNewChatAndSetView: () => Promise<void>;
  selectWebhookAndSetView: (webhook: SearchWebhookResultItem | null) => void;
  refreshAgents: () => Promise<void>;
  refreshConversations: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType>({
  // Clerk defaults
  clerkUser: undefined,
  isClerkLoading: true,
  isSignedIn: undefined,
  handleClerkLogout: async () => { console.error("handleClerkLogout called on default context"); },
  getClerkUserInitials: () => '?',
  // Agents defaults
  agents: [],
  selectedAgentIdMiddlePanel: null,
  selectedAgentIdRightPanel: null,
  isLoadingAgents: false,
  agentError: null,
  // Conversations defaults
  conversationList: [],
  currentConversationIdMiddlePanel: null,
  currentMessagesMiddlePanel: [],
  isLoadingConversationsMiddlePanel: false,
  isLoadingMessagesMiddlePanel: false,
  currentConversationIdRightPanel: null,
  currentMessagesRightPanel: [],
  isLoadingConversationsRightPanel: false,
  isLoadingMessagesRightPanel: false,
  isCreatingConversationRightPanel: false,
  conversationError: null,
  // Webhooks defaults
  userWebhooks: [],
  selectedWebhook: null,
  isLoadingWebhooks: false,
  webhookError: null,
  fetchUserWebhooks: async () => { console.warn("fetchUserWebhooks called on default context"); },
  // UI defaults
  activeAgentView: 'conversations',
  setActiveAgentView: () => {},
  // Action Wrappers defaults
  selectAgentAndSetView: () => {},
  selectConversationAndSetView: () => {},
  createNewChatAndSetView: async () => {},
  selectWebhookAndSetView: () => {},
  refreshAgents: async () => { console.warn("refreshAgents called on default context"); },
  refreshConversations: async () => { console.warn("refreshConversations called on default context"); },
});

export function DashboardProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  // --- Clerk Hooks ---
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { getToken, isSignedIn } = useClerkAuth();
  const { signOut } = useClerk();

  // --- New states for Right Panel ---
  const [selectedAgentIdRightPanel, setSelectedAgentIdRightPanel] = useState<string | null>(null);
  const [currentConversationIdRightPanel, setCurrentConversationIdRightPanel] = useState<string | null>(null);
  const [currentMessagesRightPanel, setCurrentMessagesRightPanel] = useState<VercelMessage[]>([]);
  const [isLoadingConversationsRightPanel, setIsLoadingConversationsRightPanel] = useState<boolean>(false);
  const [isLoadingMessagesRightPanel, setIsLoadingMessagesRightPanel] = useState<boolean>(false);

  const handleClerkLogout = useCallback(async () => {
    console.log("DashboardContext: Signing out with Clerk...");
    try {
      await signOut(() => {
        // This callback is executed after sign out is complete.
        // router.push('/') ensures redirect happens after Clerk's operations.
        router.push('/'); 
        console.log("DashboardContext: Clerk signOut successful, redirecting to /");
      });
    } catch (error) {
      console.error("DashboardContext: Error during Clerk signOut:", error);
      // Fallback redirect if signOut itself fails or doesn't redirect
      router.push('/');
    }
  }, [signOut, router]);

  const getClerkUserInitials = useCallback(() => {
    if (!clerkUser) return '?';
    const { firstName, lastName, primaryEmailAddress } = clerkUser;
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (primaryEmailAddress) {
      return primaryEmailAddress.emailAddress[0].toUpperCase();
    }
    return '?';
  }, [clerkUser]);
  
  // --- Instantiate Custom Hooks (pass Clerk sessionToken and handleClerkLogout) ---
  // NOTE: These hooks might need internal adjustments if they were relying on the old `PlatformUser` or specific `authToken` behaviors.

  const { 
    agents, 
    selectedAgentIdMiddlePanel, 
    selectAgent,
    isLoadingAgents, 
    agentError, 
    fetchAgents 
  } = useAgents({ handleLogout: handleClerkLogout }); // Pass Clerk token and logout

  const { 
    conversationList, 
    currentConversationId,
    selectConversationId,
    currentMessages,
    isLoadingConversations,
    isLoadingMessages,
    isCreatingConversation,
    conversationError, 
    handleCreateNewChat,
    refreshConversationList,
    fetchMessages, // Destructure fetchMessages
  } = useConversations({ selectedAgentIdMiddlePanel, user: clerkUser, handleLogout: handleClerkLogout }); // Pass selectedAgentIdMiddlePanel

  // Map hook values to context values
  const currentConversationIdMiddlePanel = currentConversationId;
  const currentMessagesMiddlePanel = currentMessages;
  const isLoadingConversationsMiddlePanel = isLoadingConversations;
  const isLoadingMessagesMiddlePanel = isLoadingMessages;
  const isCreatingConversationRightPanel = isCreatingConversation; // User wants this for RightPanel

  const { 
    userWebhooks, 
    selectedWebhook, 
    selectWebhook,
    isLoadingWebhooks, 
    webhookError, 
    fetchUserWebhooks 
  } = useWebhooks({ handleLogout: handleClerkLogout }); // Pass Clerk token and logout

  // --- Direct Context State (UI related) --- 
  const [activeAgentView, setActiveAgentView] = useState<ActiveAgentView>('conversations');

  // --- Polling Hooks --- 
  const POLLING_INTERVAL = 5000; // 5 seconds, configurable here

  useAgentPolling({
    fetchAgents,
    pollingInterval: POLLING_INTERVAL,
    isSignedIn,
  });

  useConversationPolling({
    refreshConversations: refreshConversationList, // Ensure correct prop name
    pollingInterval: POLLING_INTERVAL,
    isSignedIn,
    selectedAgentIdMiddlePanel,
  });

  useMessagePolling({
    fetchMessages, // Pass the fetchMessages function from useConversations
    currentConversationId: currentConversationIdMiddlePanel,
    pollingInterval: POLLING_INTERVAL,
    isSignedIn,
    activeAgentView,
  });

  // --- Action Wrapper Functions (to combine hook actions + UI changes) --- 
  const selectAgentAndSetView = useCallback((agentId: string | null) => {
    selectAgent(agentId);
    if (agentId) {
      setActiveAgentView('conversations'); 
      selectWebhook(null); 
    } else {
      selectWebhook(null);
    }
  }, [selectAgent, selectWebhook]);

  const selectConversationAndSetView = useCallback((conversationId: string | null) => {
    selectConversationId(conversationId);
    if (conversationId) {
      setActiveAgentView('chat');
    }
  }, [selectConversationId, setActiveAgentView]);

  const createNewChatAndSetView = useCallback(async () => {
    const newConvId = await handleCreateNewChat();
    if (newConvId) {
      setActiveAgentView('chat');
    }
  }, [handleCreateNewChat, setActiveAgentView]);

  const selectWebhookAndSetView = useCallback((webhook: SearchWebhookResultItem | null) => {
    selectWebhook(webhook);
    if (webhook) {
      setActiveAgentView('webhookDetail');
    } else {
      if (selectedAgentIdMiddlePanel) {
        setActiveAgentView('conversations');
      }
    }
  }, [selectWebhook, setActiveAgentView, selectedAgentIdMiddlePanel]);

  const isClerkLoading = !clerkIsLoaded;

  const contextValue = useMemo(() => ({
    // Clerk
    clerkUser,
    isClerkLoading,
    isSignedIn,
    handleClerkLogout,
    getClerkUserInitials,
    // Agents
    agents,
    selectedAgentIdMiddlePanel,
    selectedAgentIdRightPanel,
    isLoadingAgents,
    agentError,
    // Conversations
    conversationList,
    currentConversationIdMiddlePanel,
    currentMessagesMiddlePanel,
    isLoadingConversationsMiddlePanel,
    isLoadingMessagesMiddlePanel,
    currentConversationIdRightPanel,
    currentMessagesRightPanel,
    isLoadingConversationsRightPanel,
    isLoadingMessagesRightPanel,
    isCreatingConversationRightPanel,
    conversationError,
    // Webhooks
    userWebhooks,
    selectedWebhook,
    isLoadingWebhooks,
    webhookError,
    fetchUserWebhooks,
    // UI State
    activeAgentView,
    setActiveAgentView,
    // Action Wrappers
    selectAgentAndSetView,
    selectConversationAndSetView,
    createNewChatAndSetView,
    selectWebhookAndSetView,
    refreshAgents: fetchAgents,
    refreshConversations: refreshConversationList,
  }), [
    clerkUser, isClerkLoading, isSignedIn, handleClerkLogout, getClerkUserInitials,
    agents, selectedAgentIdMiddlePanel, selectedAgentIdRightPanel, isLoadingAgents, agentError, fetchAgents,
    conversationList, currentConversationIdMiddlePanel, currentMessagesMiddlePanel, isLoadingConversationsMiddlePanel, isLoadingMessagesMiddlePanel, currentConversationIdRightPanel, currentMessagesRightPanel, isLoadingConversationsRightPanel, isLoadingMessagesRightPanel, isCreatingConversationRightPanel, conversationError, handleCreateNewChat, refreshConversationList,
    userWebhooks, selectedWebhook, isLoadingWebhooks, webhookError, fetchUserWebhooks,
    activeAgentView,
    selectAgentAndSetView, selectConversationAndSetView, createNewChatAndSetView, selectWebhookAndSetView
  ]);
  
  // This useEffect handles redirection if the user is not signed in AND Clerk has finished loading.
  // It ensures that we don't redirect prematurely while Clerk is still determining the auth state.
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
// --- Removed all old state, effects, and functions below this line --- 