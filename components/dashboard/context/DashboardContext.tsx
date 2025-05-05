'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ApiKey, PlatformUser, ServiceResponse, Agent, Conversation, CreateConversationInput } from '@agent-base/types';
import { Message as VercelMessage } from 'ai/react';


// Define the context type with agent-related state
interface DashboardContextType {
  user: PlatformUser | null;
  setUser: (user: PlatformUser | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  apiKeys: ApiKey[];
  setApiKeys: (keys: ApiKey[]) => void;
  refreshApiKeys: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
  getUserInitials: () => string;
  handleLogout: () => void;
  // Agent-related state and functions
  agents: Agent[];
  setAgents: (agents: Agent[]) => void; 
  selectedAgentId: string | null;
  setSelectedAgentId: (agentId: string | null) => void;
  isLoadingAgents: boolean;
  agentError: string | null;
  fetchAgents: () => Promise<void>; // Changed to no args, token used internally
  authToken: string; // Add authToken to the context type
  activeAgentView: 'chat' | 'conversations' | 'memory' | 'actions'; // New state for active view
  setActiveAgentView: (view: 'chat' | 'conversations' | 'memory' | 'actions') => void; // Setter for active view

  // --- Conversation & Message Related ---
  conversationList: Conversation[];
  isLoadingConversations: boolean;
  currentConversationId: string | null;
  currentMessages: VercelMessage[]; 
  isLoadingMessages: boolean;
  isCreatingConversation: boolean;
  conversationError: string | null; // Specific error for conversation/message loading
  fetchConversationsForAgent: (agentId: string, authToken: string) => Promise<void>;
  handleCreateNewChat: () => Promise<void>;
  handleConversationSelect: (conversationId: string) => Promise<void>;
  selectConversation: (conversationId: string | null) => void;
  // Expose setter for selectedAgentId for direct use
  setSelectedAgentIdDirectly: (agentId: string | null) => void; 
}

// Create the context with a default value
export const DashboardContext = createContext<DashboardContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  setIsLoading: () => {},
  apiKeys: [],
  setApiKeys: () => {},
  refreshApiKeys: async () => {},
  error: null,
  setError: () => {},
  getUserInitials: () => '',
  handleLogout: () => {},
  // Default agent state
  agents: [],
  setAgents: () => {},
  selectedAgentId: null,
  setSelectedAgentId: () => {},
  isLoadingAgents: true,
  agentError: null,
  fetchAgents: async () => {},
  authToken: '', // Add default value for authToken
  activeAgentView: 'conversations', // Default to 'conversations'
  setActiveAgentView: () => {}, // Setter for active view
  // Default conversation/message state
  conversationList: [],
  isLoadingConversations: false,
  currentConversationId: null,
  currentMessages: [],
  isLoadingMessages: false,
  isCreatingConversation: false,
  conversationError: null,
  fetchConversationsForAgent: async () => {},
  handleCreateNewChat: async () => {},
  handleConversationSelect: async () => {},
  selectConversation: () => {},
  setSelectedAgentIdDirectly: () => {}, 
});

// Provider component that wraps the dashboard pages
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- Agent State --- 
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [selectedAgentIdState, setSelectedAgentIdState] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const [activeAgentView, setActiveAgentView] = useState<'chat' | 'conversations' | 'memory' | 'actions'>('conversations'); // Default to 'conversations'
  // --- End Agent State ---

  // --- Conversation & Message State ---
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<VercelMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState<boolean>(false);
  const [conversationError, setConversationError] = useState<string | null>(null);
  // --- End Conversation State ---

  // Get auth token early
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    if (!token) {
        console.warn("Dashboard Context: No auth token found in local storage.");
        router.push('/'); // Redirect if no token on initial load
    }
    setAuthToken(token || '');
  }, [router]);

  // --- Utility Functions ---
  const getUserInitials = useCallback(() => {
    if (user?.displayName) {
      const names = user.displayName.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      } else if (names.length === 1 && names[0].length > 0) {
        return names[0][0].toUpperCase();
      }
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?'; // Default fallback
  }, [user]);

  // --- Logout Handler ---
  const handleLogout = useCallback(() => {
    console.log('Logging out...');
    localStorage.removeItem('auth-token');
    setUser(null);
    setApiKeys([]);
    setAgents([]);
    setSelectedAgentIdState(null);
    setConversationList([]);
    setCurrentConversationId(null);
    setCurrentMessages([]);
    setAuthToken('');
    setError(null);
    setAgentError(null);
    setConversationError(null);
    router.push('/'); // Redirect to home page after logout
  }, [router]);

  // --- Data Fetching Functions ---

  // Function to fetch API keys
  const fetchApiKeys = useCallback(async () => {
    try {
      if (!authToken) {
        console.error('Unauthorized - no token found for API keys');
        return; 
      }
      
      const response = await fetch('/api/keys', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.status === 401) {
        console.error('Unauthorized fetching keys - logging out.');
        handleLogout(); // Call logout which handles redirect
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setApiKeys(data.data);
      } else {
        console.error('Failed to fetch API keys:', data);
        setApiKeys([]);
        setError(data.error || 'Failed to fetch API keys'); 
      }
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      setApiKeys([]);
       setError(error.message || 'Error fetching API keys'); 
    }
  }, [authToken, handleLogout]);

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    if (!authToken) {
      console.error('⚠️ Dashboard Context - fetchUserData called without auth token!');
      return; 
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('👤 Dashboard Context - Fetching user data...');
      
      const userFetch = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('📊 Dashboard Context - User API response status:', userFetch.status);

      if (userFetch.status === 401) {
        console.error('🚫 Dashboard Context - Unauthorized fetching user, logging out.');
        handleLogout(); // Use logout handler
        return;
      }
      
      if (!userFetch.ok) {
        let errorDetail = `Status: ${userFetch.status}`;
        try {
          const errorData = await userFetch.json();
          errorDetail = errorData.error || errorDetail;
        } catch (e) { /* ignore parsing error */ }
        throw new Error(`API error fetching user: ${errorDetail}`);
      }

      const userResponse: ServiceResponse<PlatformUser> = await userFetch.json();
      
      if (userResponse.success && userResponse.data) {
        console.log('✅ Dashboard Context - User data retrieved successfully.');
        setUser(userResponse.data);
      } else {
        throw new Error(userResponse.error || 'Invalid data format from user API');
      }
    } catch (error: any) {
      console.error('❌ Dashboard Context - Error fetching user data:', error);
      setError(error.message || 'Failed to fetch user data.');
      setUser(null); 
    } finally {
        setIsLoading(false);
    }
  }, [authToken, handleLogout]);

  // Fetch Agents Logic
  const fetchAgents = useCallback(async () => {
    if (!authToken) {
      console.warn("Dashboard Context: Auth token not available for fetching agents.");
      setAgentError("Authentication required to load agents.");
      setIsLoadingAgents(false);
      setAgents([]); 
      return;
    }

    console.log("🤖 Dashboard Context - Fetching agents...");
    setIsLoadingAgents(true);
    setAgentError(null); 
    setAgents([]); // Clear previous agents

    try {
      const agentsResponse = await fetch('/api/agents/get-or-create', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('📊 Dashboard Context - Agents API response status:', agentsResponse.status);

      if (agentsResponse.status === 401) {
        console.error('🚫 Dashboard Context - Unauthorized fetching agents, logging out.');
        handleLogout(); // Use logout handler
        return; 
      }

      if (!agentsResponse.ok) {
        let errorDetail = `Status: ${agentsResponse.status}`;
        try {
          const errorData = await agentsResponse.json();
          errorDetail = errorData.error || errorDetail;
        } catch (e) { /* ignore */ }
        throw new Error(`API error fetching agents: ${errorDetail}`);
      }
      
      const agentsData: ServiceResponse<Agent[]> = await agentsResponse.json();

      if (agentsData.success && agentsData.data) {
        console.log(`✅ Dashboard Context - Agents retrieved successfully: ${agentsData.data.length} agents found.`);
        const fetchedAgents = agentsData.data;
        setAgents(fetchedAgents);
        
        // --- Select first agent if none is selected ---
        if (!selectedAgentIdState && fetchedAgents.length > 0) {
          console.log(`🤖 Dashboard Context - No agent selected, defaulting to first agent: ${fetchedAgents[0].id}`);
          setSelectedAgentIdState(fetchedAgents[0].id);
        }
        // --- End select first agent ---

      } else {
        throw new Error(agentsData.error || 'Invalid data format from agents API');
      }

    } catch (error: any) {
      console.error('❌ Dashboard Context - Error fetching agents:', error);
      setAgentError(error.message || 'Failed to fetch agents.');
      setAgents([]); 
    } finally {
      setIsLoadingAgents(false);
    }
  }, [authToken, handleLogout, selectedAgentIdState]); // Added selectedAgentIdState dependency

  // Load Conversations and Messages for a Specific Agent
  const loadConversationDataForAgent = useCallback(async (agentId: string) => {
      if (!authToken) {
          console.warn("Dashboard Context: Auth token missing, cannot load conversations.");
          setConversationError("Authentication required.");
          return;
      }
      if (!agentId) {
          console.log("Dashboard Context: No agent selected, clearing conversation data.");
          setConversationList([]);
          setCurrentConversationId(null);
          setCurrentMessages([]);
          setIsLoadingConversations(false);
          setIsLoadingMessages(false);
          setConversationError(null);
          return;
      }

      console.log(`Dashboard Context: Loading conversation data for agent ${agentId}...`);
      setIsLoadingConversations(true);
      setIsLoadingMessages(true); 
      setConversationError(null);
      setConversationList([]); 
      setCurrentConversationId(null); 
      setCurrentMessages([]); 

      try {
          // Step 1: Fetch conversations or create one
          const convListResponse = await fetch(`/api/conversations/list-or-create?agent_id=${agentId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
          
          if (convListResponse.status === 401) {
              console.error('🚫 Dashboard Context - Unauthorized loading conversations, logging out.');
              handleLogout();
              return;
          }
          if (!convListResponse.ok) {
              const errData = await convListResponse.json().catch(() => ({}));
              throw new Error(`Failed to list/create conversations: ${errData.error || convListResponse.statusText} (${convListResponse.status})`);
          }
          const convListData: ServiceResponse<Conversation[]> = await convListResponse.json();
          if (!convListData.success || !Array.isArray(convListData.data)) {
              throw new Error(`API error listing/creating conversations: ${convListData.error || 'Invalid data format'}`);
          }

          const fetchedConversations: Conversation[] = convListData.data;
          setConversationList(fetchedConversations);
          setIsLoadingConversations(false);
          console.log(`Dashboard Context: Fetched ${fetchedConversations.length} conversations.`);

          // Step 2: Select latest conversation and fetch its messages
          if (fetchedConversations.length > 0) {
              const latestConversationId = fetchedConversations[0].conversationId;
              setCurrentConversationId(latestConversationId);
              console.log(`Dashboard Context: Selected conversation ${latestConversationId}, fetching messages...`);

              const messagesResponse = await fetch(`/api/messages/list?conversation_id=${latestConversationId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
              
              if (messagesResponse.status === 401) {
                 console.error('🚫 Dashboard Context - Unauthorized loading messages, logging out.');
                 handleLogout();
                 return;
              }
              if (!messagesResponse.ok) {
                  const errData = await messagesResponse.json().catch(() => ({}));
                  throw new Error(`Failed to list messages: ${errData.error || messagesResponse.statusText} (${messagesResponse.status})`);
              }
              
              const messagesData: ServiceResponse<VercelMessage[]> = await messagesResponse.json(); 
              if (!messagesData.success || !Array.isArray(messagesData.data)) {
                  throw new Error(`API error listing messages: ${messagesData.error || 'Invalid data format'}`);
              }
              
              setCurrentMessages(messagesData.data);
              console.log(`Dashboard Context: Loaded ${messagesData.data.length} messages.`);
          } else {
              console.warn("Dashboard Context: No conversations returned from list-or-create, cannot load messages.");
              setCurrentConversationId(null); 
              setCurrentMessages([]); 
          }

      } catch (error: any) { 
          console.error(`Dashboard Context: Error loading conversation data for agent ${agentId}:`, error);
          setConversationError(`Failed to load data: ${error.message}`);
          setConversationList([]);
          setCurrentConversationId(null);
          setCurrentMessages([]);
      } finally {
          setIsLoadingConversations(false); 
          setIsLoadingMessages(false);
      }
  }, [authToken, handleLogout]);

  // --- State Setters & Handlers ---

  // Refresh API keys
  const refreshApiKeys = useCallback(async () => {
    await fetchApiKeys();
  }, [fetchApiKeys]);

  // Smart Setter for Selected Agent ID
  const setSelectedAgentId = useCallback((agentId: string | null) => {
    console.log(`Dashboard Context: setSelectedAgentId called with ${agentId}`);
    if (agentId !== selectedAgentIdState) {
        setSelectedAgentIdState(agentId);
        if (agentId) {
            loadConversationDataForAgent(agentId);
        } else {
            // Clear conversation data
            setConversationList([]);
            setCurrentConversationId(null);
            setCurrentMessages([]);
            setIsLoadingConversations(false);
            setIsLoadingMessages(false);
            setConversationError(null);
        }
    }
  }, [selectedAgentIdState, loadConversationDataForAgent]);

  // Handler to Create New Chat
  const handleCreateNewChat = useCallback(async () => {
      if (!selectedAgentIdState || !authToken || !user) {
          console.error("Dashboard Context: Cannot create new chat - Missing agent ID, auth token, or user info.");
          setConversationError("Cannot create new chat: Missing required information.");
          return;
      }

      console.log(`Dashboard Context: Starting new chat creation for agent ${selectedAgentIdState}...`);
      setIsCreatingConversation(true);
      setConversationError(null);

      try {
          const newConversationId = crypto.randomUUID();
          const channelId = 'web'; 

          const requestBody: CreateConversationInput = {
              agentId: selectedAgentIdState,
              channelId: channelId,
              conversationId: newConversationId 
          };

          const response = await fetch('/api/conversations/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
              body: JSON.stringify(requestBody)
          });

          if (response.status === 401) {
              console.error('🚫 Dashboard Context - Unauthorized creating conversation, logging out.');
              handleLogout();
              return;
          }

          const responseData: ServiceResponse<Conversation> = await response.json();
          if (!response.ok || !responseData.success || !responseData.data) {
              throw new Error(responseData?.error || `Failed to create conversation (HTTP ${response.status})`);
          }
          
          console.log("Dashboard Context: New conversation created successfully:", responseData.data);
          const newConversation = responseData.data;

          setConversationList(prevList => [newConversation, ...prevList]); 
          setCurrentConversationId(newConversationId); 
          setCurrentMessages([]); 
          setActiveAgentView('chat'); 

      } catch (error: any) {
          console.error("Dashboard Context: Error creating new chat:", error);
          setConversationError(`Error creating chat: ${error.message}`);
      } finally {
          setIsCreatingConversation(false); 
      }
  }, [selectedAgentIdState, authToken, user, handleLogout]);

  // Handler to Select Existing Conversation
  const handleConversationSelect = useCallback(async (conversationId: string) => {
      if (!authToken || !conversationId) {
          console.warn("Dashboard Context: Conversation selection cancelled - missing token or ID.");
          setConversationError("Cannot select conversation: Missing information.");
          return;
      }
      if (conversationId === currentConversationId) {
          console.log(`Dashboard Context: Conversation ${conversationId} already selected.`);
          setActiveAgentView('chat'); 
          return;
      }

      console.log(`Dashboard Context: Selecting conversation ${conversationId}`);
      setIsLoadingMessages(true);
      setCurrentConversationId(conversationId);
      setCurrentMessages([]); 
      setConversationError(null);
      
      try {
          console.log(`Dashboard Context: Fetching messages for ${conversationId}`);
          const messagesResponse = await fetch(`/api/messages/list?conversation_id=${conversationId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
          
          if (messagesResponse.status === 401) {
              console.error('🚫 Dashboard Context - Unauthorized selecting conversation, logging out.');
              handleLogout();
              return;
          }
          if (!messagesResponse.ok) {
              const errData = await messagesResponse.json().catch(() => ({}));
              throw new Error(`Failed to list messages: ${errData.error || messagesResponse.statusText} (${messagesResponse.status})`);
          }
          
          const messagesData: ServiceResponse<VercelMessage[]> = await messagesResponse.json();
          
          if (!messagesData.success || !Array.isArray(messagesData.data)) {
              throw new Error(messagesData.error || 'Invalid message data received from API');
          }
          
          setCurrentMessages(messagesData.data);
          console.log(`Dashboard Context: Loaded ${messagesData.data.length} messages for ${conversationId}.`);
          setActiveAgentView('chat'); 

      } catch (error: any) {
          console.error(`Dashboard Context: Error loading messages for ${conversationId}:`, error);
          setConversationError(`Error loading messages: ${error.message}`);
          setCurrentMessages([]); 
      } finally {
          setIsLoadingMessages(false);
      }
  }, [authToken, currentConversationId, handleLogout]);

  // --- START: ADD FETCH CONVERSATIONS FOR AGENT ---
  const fetchConversationsForAgent = useCallback(async (agentId: string, token: string) => {
    if (!agentId) {
      console.warn('Dashboard Context: fetchConversationsForAgent called without agentId.');
      return;
    }
    if (!token) {
      console.warn('Dashboard Context: fetchConversationsForAgent called without token.');
      setConversationError('Authentication required to load conversations.');
      return;
    }
    
    console.log(`Dashboard Context: Fetching conversations for agent ${agentId}...`);
    setIsLoadingConversations(true);
    setConversationError(null);
    // Clear existing list for the new agent
    setConversationList([]); 
    // Reset current selection when fetching for a new agent
    // setCurrentConversationId(null); 
    // setCurrentMessages([]); // Keep messages until explicitly changed by handleConversationSelect
    
    try {
      const response = await fetch(`/api/conversations/list?agentId=${agentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        console.error('Dashboard Context: Unauthorized fetching conversations, logging out.');
        handleLogout();
        return;
      }

      const data: ServiceResponse<Conversation[]> = await response.json();

      if (data.success && data.data) {
        console.log(`Dashboard Context: Successfully fetched ${data.data.length} conversations for agent ${agentId}.`);
        // Sort conversations by updatedAt descending (most recent first)
        const sortedConversations = data.data.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setConversationList(sortedConversations);
      } else {
        console.error('Dashboard Context: Failed to fetch conversations:', data.error);
        setConversationError(data.error || 'Failed to fetch conversations.');
        setConversationList([]);
      }
    } catch (error: any) {
      console.error('Dashboard Context: Error fetching conversations:', error);
      setConversationError(error.message || 'An unexpected error occurred while fetching conversations.');
      setConversationList([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [handleLogout]); // Dependency: handleLogout
  // --- END: ADD FETCH CONVERSATIONS FOR AGENT ---

  // --- START: ADD NEW selectConversation HANDLER ---
  // Simple state setter for currentConversationId
  const selectConversation = useCallback((conversationId: string | null) => {
    console.log(`Dashboard Context: Setting current conversation ID only to: ${conversationId}`);
    if (conversationId !== currentConversationId) {
        setCurrentConversationId(conversationId);
        // NOTE: We intentionally DO NOT fetch messages or change the active view here.
        // The RightPanel's ChatInterface will react to the conversationId change.
        // We also don't clear messages here, maybe ChatInterface handles that? Or handleConversationSelect if used.
    }
  }, [currentConversationId]); // Dependency: currentConversationId
  // --- END: ADD NEW selectConversation HANDLER ---

  // --- Initial Data Load Effect ---
  useEffect(() => {
    if (authToken) {
      console.log("Dashboard Context: Auth token available, fetching initial data...");
      fetchUserData(); 
      fetchApiKeys();   
      fetchAgents();    
    } else {
        // This case should be handled by the initial token check effect which redirects
        console.log("Dashboard Context: No auth token available on mount, waiting for redirect.");
        // Ensure loading states are false if we somehow get here without a token
        setIsLoading(false);
        setIsLoadingAgents(false);
    }
  }, [authToken, fetchUserData, fetchApiKeys, fetchAgents]); // Add all fetch functions

  // --- Agent List Change Effect ---
  // Handles auto-selection or clearing selection when agent list changes
  useEffect(() => {
    if (isLoadingAgents) return; // Don't run while agents are loading

    if (agents.length > 0 && !selectedAgentIdState) {
      // Auto-select first agent if list is populated and nothing is selected
      console.log("Dashboard Context (Agent Effect): Auto-selecting first agent.");
      setSelectedAgentIdState(agents[0].id);
      // Data loading is handled by the `loadConversationDataForAgent` called via the smart setter below
    } else if (selectedAgentIdState && !agents.find(agent => agent.id === selectedAgentIdState)) {
      // If selected agent is removed from list, select first or null
      const newAgentId = agents.length > 0 ? agents[0].id : null;
      console.log(`Dashboard Context (Agent Effect): Selected agent removed, selecting ${newAgentId}.`);
      setSelectedAgentIdState(newAgentId);
    } else if (agents.length === 0 && selectedAgentIdState) {
      // If list becomes empty, clear selection
      console.log("Dashboard Context (Agent Effect): Agent list empty, clearing selection.");
      setSelectedAgentIdState(null);
    }
  }, [agents, isLoadingAgents, selectedAgentIdState]); // Depend on agents list, loading state, and selection

  // --- Trigger Load Data For Initial Auto-Selected Agent ---
  // Separate effect to call loadConversationDataForAgent when the agent is first auto-selected.
  useEffect(() => {
      // Only run if an agent IS selected AND conversation data hasn't been loaded/attempted yet
      // (conversationList is empty, and not currently loading)
      if (selectedAgentIdState && conversationList.length === 0 && !isLoadingConversations && !isLoadingMessages) {
          console.log(`Dashboard Context (Load Effect): Triggering initial data load for auto-selected agent ${selectedAgentIdState}`);
          loadConversationDataForAgent(selectedAgentIdState);
      }
  // Intentionally only run when selectedAgentIdState changes or load function definition changes
  // Avoid depending on conversationList/loading states here to prevent loops
  }, [selectedAgentIdState, loadConversationDataForAgent]);


  // Memoize the context value
  const contextValue = useMemo(() => ({
    user,
    setUser,
    isLoading,
    setIsLoading,
    apiKeys,
    setApiKeys,
    refreshApiKeys: fetchApiKeys,
    error,
    setError,
    getUserInitials,
    handleLogout,
    // Agent values
    agents,
    setAgents, 
    selectedAgentId: selectedAgentIdState, 
    setSelectedAgentId, // Smart setter
    isLoadingAgents,
    agentError,
    fetchAgents,
    authToken,
    activeAgentView,
    setActiveAgentView,
    // Conversation/Message values
    conversationList,
    isLoadingConversations,
    currentConversationId,
    currentMessages,
    isLoadingMessages,
    isCreatingConversation,
    conversationError,
    fetchConversationsForAgent,
    handleCreateNewChat,
    handleConversationSelect,
    selectConversation,
    setSelectedAgentIdDirectly: setSelectedAgentIdState, 
  }), [
    user, isLoading, apiKeys, error, getUserInitials, handleLogout, 
    agents, selectedAgentIdState, setSelectedAgentId, isLoadingAgents, agentError, fetchAgents, authToken, 
    activeAgentView, setActiveAgentView,
    conversationList, isLoadingConversations, currentConversationId, currentMessages, 
    isLoadingMessages, isCreatingConversation, conversationError, fetchConversationsForAgent,
    handleCreateNewChat, handleConversationSelect, selectConversation, fetchApiKeys // Add selectConversation
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context
export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
} 