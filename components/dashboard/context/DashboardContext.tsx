'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
// Removed useEffect as it's handled in hooks now
// Removed useRouter as it's handled in useAuth
import { ApiKey, PlatformUser, Agent, Conversation, Webhook } from '@agent-base/types';
import { Message as VercelMessage } from 'ai/react';

// Import the new custom hooks
import { useAuth } from '../../../hooks/useAuth'; // Adjusted path
import { useApiKeys } from '../../../hooks/useApiKeys'; // Adjusted path
import { useAgents } from '../../../hooks/useAgents'; // Adjusted path
import { useConversations } from '../../../hooks/useConversations'; // Adjusted path
import { useWebhooks } from '../../../hooks/useWebhooks'; // Adjusted path

// --- Define the combined context type --- 
// This combines the return types of all hooks plus any direct context state

type ActiveAgentView = 'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail';

interface DashboardContextType {
  // From useAuth
  user: PlatformUser | null;
  // setUser: (user: PlatformUser | null) => void; // Keep if needed?
  isLoadingUser: boolean;
  authError: string | null;
  // setAuthError: (error: string | null) => void;
  authToken: string;
  // fetchUserData: () => Promise<void>;
  getUserInitials: () => string;
  handleLogout: () => void;

  // From useApiKeys
  apiKeys: ApiKey[];
  isLoadingKeys: boolean;
  keysError: string | null;
  refreshApiKeys: () => Promise<void>;

  // From useAgents
  agents: Agent[];
  selectedAgentId: string | null;
  // Use the wrapper function below instead of direct hook function
  // selectAgent: (agentId: string | null) => void; 
  isLoadingAgents: boolean;
  agentError: string | null;
  // fetchAgents: () => Promise<void>; // Use wrapper below if needed

  // From useConversations
  conversationList: Conversation[];
  currentConversationId: string | null;
  // Use wrapper function below
  // selectConversationId: (conversationId: string | null) => void; 
  currentMessages: VercelMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isCreatingConversation: boolean;
  conversationError: string | null;
  // Use wrapper function below
  // handleCreateNewChat: () => Promise<string | null>; 
  // refreshConversationList: () => Promise<void>; // Use wrapper below

  // From useWebhooks
  userWebhooks: Webhook[];
  selectedWebhook: Webhook | null;
  // Use wrapper function below
  // selectWebhook: (webhook: Webhook | null) => void; 
  isLoadingWebhooks: boolean;
  webhookError: string | null;
  fetchUserWebhooks: () => Promise<void>; // Expose refresh directly

  // Direct Context State/Functions (UI, combined state, action wrappers)
  activeAgentView: ActiveAgentView;
  setActiveAgentView: (view: ActiveAgentView) => void;

  // --- Action Wrappers (to handle side effects like view changes) --- 
  selectAgentAndSetView: (agentId: string | null) => void;
  selectConversationAndSetView: (conversationId: string | null) => void;
  createNewChatAndSetView: () => Promise<void>;
  selectWebhookAndSetView: (webhook: Webhook | null) => void;
  refreshAgents: () => Promise<void>;
  refreshConversations: () => Promise<void>;

  // Combined loading/error (optional, can be derived in components)
  // isLoading: boolean;
  // error: string | null;
}

// Create the context with a default value matching the new type
// Note: Default functions should be basic stubs
export const DashboardContext = createContext<DashboardContextType>({
  // Auth defaults
  user: null,
  isLoadingUser: true,
  authError: null,
  authToken: '',
  getUserInitials: () => '?',
  handleLogout: () => { console.error("Logout called on default context"); },
  // API Keys defaults
  apiKeys: [],
  isLoadingKeys: false,
  keysError: null,
  refreshApiKeys: async () => { console.warn("refreshApiKeys called on default context"); },
  // Agents defaults
  agents: [],
  selectedAgentId: null,
  isLoadingAgents: false,
  agentError: null,
  // Conversations defaults
  conversationList: [],
  currentConversationId: null,
  currentMessages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isCreatingConversation: false,
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

// Provider component that wraps the dashboard pages
export function DashboardProvider({ children }: { children: ReactNode }) {
  // --- Instantiate Hooks --- 
  const { 
    user, 
    // setUser, 
    isLoadingUser, 
    authError, 
    // setAuthError,
    authToken, 
    // fetchUserData, 
    getUserInitials, 
    handleLogout 
  } = useAuth();

  const { 
    apiKeys, 
    isLoadingKeys, 
    keysError, 
    refreshApiKeys 
  } = useApiKeys({ authToken, handleLogout });

  const { 
    agents, 
    selectedAgentId, 
    selectAgent, // Use the hook's internal selector
    isLoadingAgents, 
    agentError, 
    fetchAgents 
  } = useAgents({ authToken, handleLogout });

  const { 
    conversationList, 
    currentConversationId, 
    selectConversationId, // Use the hook's internal selector
    currentMessages, 
    isLoadingConversations, 
    isLoadingMessages, 
    isCreatingConversation, 
    conversationError, 
    handleCreateNewChat, // Use the hook's internal creator
    refreshConversationList // Use the hook's internal refresher
  } = useConversations({ authToken, selectedAgentId, user, handleLogout });

  const { 
    userWebhooks, 
    selectedWebhook, 
    selectWebhook, // Use the hook's internal selector
    isLoadingWebhooks, 
    webhookError, 
    fetchUserWebhooks 
  } = useWebhooks({ authToken, handleLogout });

  // --- Direct Context State (UI related) --- 
  const [activeAgentView, setActiveAgentView] = useState<ActiveAgentView>('conversations'); // Default to conversations

  // --- Action Wrapper Functions (to combine hook actions + UI changes) --- 

  const selectAgentAndSetView = useCallback((agentId: string | null) => {
    console.log(`DashboardContext: Selecting agent ${agentId} and setting view.`);
    selectAgent(agentId); // Call the hook's function to update state
    // Only change view if an agent is selected
    if (agentId) {
      // Default to conversations view when agent changes, conversations hook will load list/messages
      setActiveAgentView('conversations'); 
      // Clear webhook selection when switching back to an agent focus
      selectWebhook(null); 
    } else {
        // If agent is deselected, maybe default to a specific view or keep current?
        // Let's keep the current view for now, but clear webhook selection.
        selectWebhook(null);
    }
  }, [selectAgent, selectWebhook]); // Added selectWebhook dependency

  const selectConversationAndSetView = useCallback((conversationId: string | null) => {
    console.log(`DashboardContext: Selecting conversation ${conversationId} and setting view.`);
    selectConversationId(conversationId); // Call the hook's function to update state
    // Switch to chat view only if a conversation is selected
    if (conversationId) {
      setActiveAgentView('chat');
    }
    // If conversationId is null, don't automatically change view (might be switching agents)
  }, [selectConversationId, setActiveAgentView]);

  const createNewChatAndSetView = useCallback(async () => {
    console.log("DashboardContext: Creating new chat and setting view.");
    const newConvId = await handleCreateNewChat(); // Call the hook's function
    if (newConvId) {
      setActiveAgentView('chat'); // Switch to chat view on successful creation
    }
  }, [handleCreateNewChat, setActiveAgentView]);

  const selectWebhookAndSetView = useCallback((webhook: Webhook | null) => {
    console.log(`DashboardContext: Selecting webhook ${webhook?.id ?? 'None'} and setting view.`);
    selectWebhook(webhook); // Call the hook's function
    if (webhook) {
      setActiveAgentView('webhookDetail');
      // Optionally clear agent selection if webhook view is fully separate
      // selectAgent(null); 
    } else {
        // If webhook is deselected, revert to a default view? Maybe agent's conversation list?
        // Let's revert to conversations view only if an agent is actually selected.
        if (selectedAgentId) {
            setActiveAgentView('conversations');
        }
        // If no agent selected either, stay in current view or pick another default?
        // For now, just revert to 'conversations' if an agent exists.
    }
  }, [selectWebhook, setActiveAgentView, selectedAgentId]); // Added selectedAgentId dependency

  // --- Memoize the context value --- 
  const contextValue = useMemo(() => ({
    // Auth
    user,
    isLoadingUser,
    authError,
    authToken,
    getUserInitials,
    handleLogout,
    // API Keys
    apiKeys,
    isLoadingKeys,
    keysError,
    refreshApiKeys,
    // Agents
    agents,
    selectedAgentId,
    isLoadingAgents,
    agentError,
    // Conversations
    conversationList,
    currentConversationId,
    currentMessages,
    isLoadingConversations,
    isLoadingMessages,
    isCreatingConversation,
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
    refreshAgents: fetchAgents, // Expose agent refresh
    refreshConversations: refreshConversationList, // Expose conversation refresh

  }), [
    // List all state values and stable functions from hooks and local state
    user, isLoadingUser, authError, authToken, getUserInitials, handleLogout,
    apiKeys, isLoadingKeys, keysError, refreshApiKeys,
    agents, selectedAgentId, isLoadingAgents, agentError, fetchAgents,
    conversationList, currentConversationId, currentMessages, isLoadingConversations, isLoadingMessages, isCreatingConversation, conversationError, handleCreateNewChat, refreshConversationList,
    userWebhooks, selectedWebhook, isLoadingWebhooks, webhookError, fetchUserWebhooks,
    activeAgentView, setActiveAgentView,
    // List all action wrappers
    selectAgentAndSetView, selectConversationAndSetView, createNewChatAndSetView, selectWebhookAndSetView
  ]);

  // --- Initial Data Load (Handled within hooks based on authToken) --- 
  // No top-level useEffect needed here anymore for initial fetches.

  // --- Log context value changes for debugging (optional) ---
  // useEffect(() => {
  //   console.log("DashboardContext value updated:", contextValue);
  // }, [contextValue]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context (remains the same)
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
// --- Removed all old state, effects, and functions below this line --- 