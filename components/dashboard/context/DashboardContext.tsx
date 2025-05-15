'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Agent, Conversation, Webhook } from '@agent-base/types';
import { Message as VercelMessage } from 'ai/react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/nextjs';
import { UserResource } from '@clerk/types';

import { useAgents } from '../../../hooks/useAgents';
import { useConversations } from '../../../hooks/useConversations';
import { useWebhooks } from '../../../hooks/useWebhooks';

import { useAgentPolling } from '../../../hooks/polling/useAgentPolling';
import { useConversationPolling } from '../../../hooks/polling/useConversationPolling';
// import { useMessagePolling } from '../../../hooks/polling/useMessagePolling'; // Still commented out

import { SearchWebhookResultItem } from '@agent-base/types';
import { useMessages } from '../../../hooks/useMessages';

type ActiveAgentView = 'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail';

interface DashboardContextType {
  clerkUser: UserResource | null | undefined;
  isClerkLoading: boolean;
  isSignedIn: boolean | undefined;
  handleClerkLogout: () => Promise<void>;
  getClerkUserInitials: () => string;

  agents: Agent[];
  isLoadingAgents: boolean;
  agentError: string | null;
  selectedAgentIdMiddlePanel: string | null;
  selectedAgentIdRightPanel: string | null;
  selectAgentMiddlePanel: (agentId: string | null) => void;
  selectAgentRightPanel: (agentId: string | null) => void;
  
  conversationList: Conversation[]; 
  currentConversationIdMiddlePanel: string | null;
  isLoadingConversationsMiddlePanel: boolean; // Loading state for the conversation list itself
  conversationError: string | null; // Errors related to fetching/creating conversations

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

  userWebhooks: SearchWebhookResultItem[];
  selectedWebhook: SearchWebhookResultItem | null;
  isLoadingWebhooks: boolean;
  webhookError: string | null;
  fetchUserWebhooks: () => Promise<void>;

  activeAgentView: ActiveAgentView;
  setActiveAgentView: (view: ActiveAgentView) => void;

  // Action wrappers combining state updates and view changes
  selectAgentAndSetView: (agentId: string | null) => void;
  selectConversationAndSetView: (conversationId: string | null) => void; // Assumed for Middle Panel
  createNewChatAndSetView: () => Promise<void>; // Assumed for Right Panel
  selectWebhookAndSetView: (webhook: SearchWebhookResultItem | null) => void;
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
  selectAgentAndSetView: () => {},
  selectConversationAndSetView: () => {},
  createNewChatAndSetView: async () => {},
  selectWebhookAndSetView: () => {},
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

  const [activeAgentView, setActiveAgentView] = useState<ActiveAgentView>('conversations');
  const POLLING_INTERVAL = 5000;

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
    } else {
      if (selectedAgentIdMiddlePanel) { // Revert to conversations if an agent is selected
        setActiveAgentView('conversations');
      }
    }
  }, [selectWebhook, setActiveAgentView, selectedAgentIdMiddlePanel]);

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
    
    selectAgentAndSetView,
    selectConversationAndSetView,
    createNewChatAndSetView,
    selectWebhookAndSetView,
    
    refreshAgents: fetchAgents,
    refreshConversations: refreshConversationList,
    // Expose fetch functions for messages if manual refresh is needed by consumers
    fetchMessagesMiddlePanel: fetchMessages, // from useConversations -> useMessages
    fetchMessagesRightPanel,                 // from the new useMessages for right panel
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
    selectAgentAndSetView, selectConversationAndSetView, createNewChatAndSetView, selectWebhookAndSetView, 
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