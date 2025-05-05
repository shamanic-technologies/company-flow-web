'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ApiKey, PlatformUser, ServiceResponse, Agent, Conversation, CreateConversationInput, Webhook } from '@agent-base/types';
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
  activeAgentView: 'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail'; // New state for active view
  setActiveAgentView: (view: 'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail') => void; // Setter for active view

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
  selectConversationId: (conversationId: string | null) => void;
  // Expose setter for selectedAgentId for direct use
  setSelectedAgentIdDirectly: (agentId: string | null) => void; 

  // --- Webhook Related ---
  userWebhooks: Webhook[]; // List of webhooks created by the user
  isLoadingWebhooks: boolean; // Loading state for webhooks
  webhookError: string | null; // Error state for webhooks
  selectedWebhook: Webhook | null; // The currently selected webhook for detail view
  fetchUserWebhooks: () => Promise<void>; // Function to fetch user's webhooks
  selectWebhook: (webhook: Webhook | null) => void; // Function to select a webhook
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
  selectConversationId: () => {},
  setSelectedAgentIdDirectly: () => {}, 

  // Default webhook state
  userWebhooks: [],
  isLoadingWebhooks: false,
  webhookError: null,
  selectedWebhook: null,
  fetchUserWebhooks: async () => {},
  selectWebhook: () => {},
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
  const [activeAgentView, setActiveAgentView] = useState<'chat' | 'conversations' | 'memory' | 'actions' | 'webhookDetail'>('conversations'); // Default to 'conversations'
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

  // --- Webhook State ---
  const [userWebhooks, setUserWebhooks] = useState<Webhook[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  // --- End Webhook State ---

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
    // Reset webhook state on logout
    setUserWebhooks([]);
    setSelectedWebhook(null); 
    setAuthToken('');
    setError(null);
    setAgentError(null);
    setConversationError(null);
    setWebhookError(null); // Reset webhook error
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

  // Load ONLY Conversation LIST for a Specific Agent (No messages here)
  const loadConversationListForAgent = useCallback(async (agentId: string) => { // Renamed for clarity
      if (!authToken) {
          console.warn("Dashboard Context: Auth token missing, cannot load conversation list.");
          setConversationError("Authentication required.");
          setIsLoadingConversations(false); // Ensure loading stops
          return;
      }
      if (!agentId) {
          console.log("Dashboard Context: No agent selected, clearing conversation list.");
          setConversationList([]);
          setCurrentConversationId(null); // Also clear selected conversation ID
          // setCurrentMessages([]); // Messages cleared by useEffect on ID change
          setIsLoadingConversations(false);
          setConversationError(null);
          return;
      }

      console.log(`Dashboard Context: Loading conversation list for agent ${agentId}...`);
      setIsLoadingConversations(true);
      setConversationError(null);
      setConversationList([]); // Clear previous list
      // Don't reset currentConversationId here, let selection handle it or initial load

      try {
          // Step 1: Fetch conversations list (using list-or-create or just list)
          // Using list-or-create ensures we always have at least one if possible
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
           // Sort conversations by updatedAt descending (most recent first)
          const sortedConversations = fetchedConversations.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setConversationList(sortedConversations);
          console.log(`Dashboard Context: Fetched ${sortedConversations.length} conversations.`);

          // Step 2: Set the initial conversation ID if none is set yet for this agent
          // Check if current ID is null OR if the current ID doesn't belong to the new list
          if (sortedConversations.length > 0 && (!currentConversationId || !sortedConversations.some(c => c.conversationId === currentConversationId))) {
              const latestConversationId = sortedConversations[0].conversationId;
              console.log(`Dashboard Context: Setting initial/default conversation ID to ${latestConversationId}`);
              // Use the simplified setter - the useEffect will fetch messages
              setCurrentConversationId(latestConversationId);
          } else if (sortedConversations.length === 0) {
               console.log(`Dashboard Context: No conversations found for agent ${agentId}, clearing ID.`);
               setCurrentConversationId(null); // Clear ID if no conversations exist
          }
          // Message fetching is now handled by the useEffect below

      } catch (error: any) {
          console.error(`Dashboard Context: Error loading conversation list for agent ${agentId}:`, error);
          setConversationError(`Failed to load conversation list: ${error.message}`);
          setConversationList([]);
          setCurrentConversationId(null); // Clear ID on error
      } finally {
          setIsLoadingConversations(false);
      }
  }, [authToken, handleLogout, currentConversationId]);

  // --- useEffect to Fetch Messages when currentConversationId changes ---
  useEffect(() => {
    // Function to fetch messages
    const fetchMessages = async (convId: string) => {
        if (!authToken) {
            console.warn("Dashboard Context: Auth token missing, cannot fetch messages.");
            setConversationError("Authentication required to load messages.");
            return;
        }

        console.log(`Dashboard Context (Effect): Fetching messages for conversation ${convId}`);
        setIsLoadingMessages(true);
        setCurrentMessages([]); // Clear previous messages
        setConversationError(null);

        try {
            const messagesResponse = await fetch(`/api/messages/list?conversation_id=${convId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });

            if (messagesResponse.status === 401) {
                console.error('🚫 Dashboard Context (Effect) - Unauthorized loading messages, logging out.');
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
            console.log(`Dashboard Context (Effect): Loaded ${messagesData.data.length} messages for ${convId}.`);

        } catch (error: any) {
            console.error(`Dashboard Context (Effect): Error loading messages for ${convId}:`, error);
            setConversationError(`Error loading messages: ${error.message}`);
            setCurrentMessages([]); // Ensure messages are empty on error
        } finally {
            setIsLoadingMessages(false);
        }
    };

    // Only fetch if conversationId is selected
    if (currentConversationId) {
        fetchMessages(currentConversationId);
    } else {
        // If conversationId becomes null, clear messages and loading state
        setCurrentMessages([]);
        setIsLoadingMessages(false);
        setConversationError(null);
    }

    // Dependencies: Fetch when ID or token changes
  }, [currentConversationId, authToken, handleLogout]);

  // --- State Setters & Handlers ---

  // Refresh API keys
  const refreshApiKeys = useCallback(async () => {
    await fetchApiKeys();
  }, [fetchApiKeys]);

  // Smart Setter for Selected Agent ID - Triggers list load
  const setSelectedAgentId = useCallback((agentId: string | null) => {
    console.log(`Dashboard Context: setSelectedAgentId called with ${agentId}`);
    if (agentId !== selectedAgentIdState) {
        setSelectedAgentIdState(agentId);
        // Trigger load of conversation LIST, which will then set an ID, triggering message load effect
        if (agentId) {
            loadConversationListForAgent(agentId);
        } else {
            // Clear agent-related data
            setConversationList([]);
            setCurrentConversationId(null); // This will trigger message clearing via useEffect
            setIsLoadingConversations(false);
            setConversationError(null);
        }
    }
  }, [selectedAgentIdState, loadConversationListForAgent]);

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

          // Add to list and set as current
          setConversationList(prevList => [newConversation, ...prevList]);
          // Set the ID - this will trigger the useEffect to load (empty) messages
          setCurrentConversationId(newConversationId);
          // Switch view
          setActiveAgentView('chat');

      } catch (error: any) {
          console.error("Dashboard Context: Error creating new chat:", error);
          setConversationError(`Error creating chat: ${error.message}`);
      } finally {
          setIsCreatingConversation(false);
      }
  }, [selectedAgentIdState, authToken, user, handleLogout]);

  // Simple setter for currentConversationId - Triggers useEffect for message loading
  const selectConversationId = useCallback((conversationId: string | null) => { // Renamed parameter
    console.log(`Dashboard Context: Setting current conversation ID to: ${conversationId}`);
    if (conversationId !== currentConversationId) {
        setCurrentConversationId(conversationId);
        // Message fetching is handled by the useEffect hook watching currentConversationId
        // View is no longer changed here
        // if (conversationId) {
        //    setActiveAgentView('chat'); 
        // }
    } // No need for the else-if block that also set the view
  }, [currentConversationId]); // Dependency: currentConversationId

  // --- New: Fetch User Webhooks ---
  const fetchUserWebhooks = useCallback(async () => {
    if (!authToken) {
      console.warn("Dashboard Context: Auth token not available for fetching webhooks.");
      setWebhookError("Authentication required to load webhooks.");
      setIsLoadingWebhooks(false);
      return;
    }

    console.log("🎣 Dashboard Context - Fetching user webhooks...");
    setIsLoadingWebhooks(true);
    setWebhookError(null);
    setUserWebhooks([]); // Clear previous webhooks

    try {
      const response = await fetch('/api/webhooks/get-created', {
        method: 'POST', // Ensure POST method is used as defined in the API route
        headers: { 
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json' // Specify content type if needed by the API
        },
        // Body might not be needed if the API route doesn't expect one for a GET-like action via POST
        // body: JSON.stringify({}) 
      });

      console.log('📊 Dashboard Context - User Webhooks API response status:', response.status);

      if (response.status === 401) {
        console.error('🚫 Dashboard Context - Unauthorized fetching webhooks, logging out.');
        handleLogout();
        return;
      }

      const data: ServiceResponse<Webhook[]> = await response.json();

      if (!response.ok) {
         let errorDetail = `Status: ${response.status}`;
         if (data && data.error) {
            errorDetail = data.error;
         }
         throw new Error(`API error fetching webhooks: ${errorDetail}`);
      }

      if (data.success && data.data) {
        console.log(`✅ Dashboard Context - ${data.data.length} User webhooks retrieved successfully.`);
        setUserWebhooks(data.data);
      } else {
        throw new Error(data.error || 'Invalid data format from webhooks API');
      }
    } catch (error: any) {
      console.error('❌ Dashboard Context - Error fetching user webhooks:', error);
      setWebhookError(error.message || 'Failed to fetch webhooks.');
      setUserWebhooks([]);
    } finally {
      setIsLoadingWebhooks(false);
    }
  }, [authToken, handleLogout]);
  // --- End Fetch User Webhooks ---

  // --- Initial Data Load Effect ---
  useEffect(() => {
    if (authToken) {
      console.log("🔑 Dashboard Context: Auth token available, fetching initial data...");
      fetchUserData(); 
      fetchApiKeys();   
      fetchAgents();    
      fetchUserWebhooks(); // Fetch webhooks after getting token
    } else {
        // This case should be handled by the initial token check effect which redirects
        console.log("⏳ Dashboard Context: Waiting for auth token...");
        // Ensure loading states are false if we somehow get here without a token
        setIsLoading(false);
        setIsLoadingAgents(false);
        setIsLoadingWebhooks(false); // Set webhook loading false if no token
    }
  }, [authToken, fetchUserData, fetchApiKeys, fetchAgents, fetchUserWebhooks]); // Add all fetch functions

  // --- Agent List Change Effect ---
  // Handles auto-selection or clearing selection when agent list changes
  useEffect(() => {
    if (isLoadingAgents) return; // Don't run while agents are loading

    if (agents.length > 0 && !selectedAgentIdState) {
      // Auto-select first agent if list is populated and nothing is selected
      console.log("Dashboard Context (Agent Effect): Auto-selecting first agent.");
      setSelectedAgentIdState(agents[0].id);
      // Data loading is handled by the `loadConversationListForAgent` called via the smart setter below
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

  // --- Trigger Load CONVERSATION LIST For Initial Auto-Selected Agent ---
  // Renamed function being called
  useEffect(() => {
      // Only run if an agent IS selected AND conversation list hasn't been loaded/attempted yet
      if (selectedAgentIdState && conversationList.length === 0 && !isLoadingConversations) {
          console.log(`Dashboard Context (Load Effect): Triggering initial conversation list load for auto-selected agent ${selectedAgentIdState}`);
          loadConversationListForAgent(selectedAgentIdState); // Call the list loader
      }
  // Depend on agent ID, list length, loading state, and the load function itself
  }, [selectedAgentIdState, conversationList.length, isLoadingConversations, loadConversationListForAgent]);

  // NEW: Function to handle agent selection and trigger conversation loading
  const handleAgentSelection = useCallback(async (agentId: string | null) => {
    console.log(`🔄 Dashboard Context: Agent selected: ${agentId}`);
    setSelectedAgentIdState(agentId);
    setActiveAgentView('chat'); // Default to chat view when agent changes
    setCurrentConversationId(null); // Clear previous conversation selection
    setCurrentMessages([]); // Clear previous messages
    setConversationList([]); // Clear old conversation list
    setConversationError(null); // Clear previous errors

    if (agentId && authToken) {
      console.log(`🔍 Dashboard Context: Fetching conversations for agent ${agentId}...`);
      await fetchConversationsForAgent(agentId, authToken); 
      // The logic to select the latest conversation will be inside fetchConversationsForAgent
    } else {
      // If agentId is null or no token, clear conversation state
      setIsLoadingConversations(false); 
    }
  }, [authToken]); // Add fetchConversationsForAgent later if needed, avoid circular dependency for now

  // Fetch Conversations for a specific agent
  const fetchConversationsForAgent = useCallback(async (agentId: string, token: string) => {
    if (!agentId) {
      console.warn("Dashboard Context: fetchConversationsForAgent called with null agentId.");
      setConversationList([]);
      setCurrentConversationId(null);
      setCurrentMessages([]);
      setIsLoadingConversations(false);
      return;
    }
    console.log(`📚 Dashboard Context: Fetching conversations for agent ${agentId}...`);
    setIsLoadingConversations(true);
    setConversationError(null);
    // Clear existing messages when fetching conversations for a *new* agent
    // but maybe not if just refreshing? Let's clear for now on explicit fetch.
    // Update: Clearing happens in handleAgentSelection now.
    // setCurrentMessages([]); 
    // setCurrentConversationId(null); // Clear selection while loading new list

    try {
      const response = await fetch(`/api/conversations/list?agentId=${agentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log(`📊 Dashboard Context: Conversation list API response status for agent ${agentId}:`, response.status);


      if (!response.ok) {
        if (response.status === 401) {
          console.error('🚫 Dashboard Context: Unauthorized fetching conversations, logging out.');
          handleLogout();
          return;
        }
        let errorDetail = `Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorDetail = errorData.error || errorDetail;
        } catch (e) { /* ignore */ }
        throw new Error(`API error fetching conversations: ${errorDetail}`);
      }

      const result: ServiceResponse<Conversation[]> = await response.json();

      if (result.success && result.data) {
        console.log(`✅ Dashboard Context: Successfully fetched ${result.data.length} conversations for agent ${agentId}.`);
        const sortedConversations = result.data.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );
        setConversationList(sortedConversations);
        
        // --- Step 2: Select Latest Conversation ---
        if (sortedConversations.length > 0) {
          const latestConversation = sortedConversations[0];
          console.log(`📌 Dashboard Context: Automatically selecting latest conversation: ${latestConversation.conversationId}`);
          // Directly call the function that handles message fetching
          selectConversationId(latestConversation.conversationId); 
        } else {
          console.log(`🤷 Dashboard Context: No conversations found for agent ${agentId}.`);
          // No conversation to select, ensure state reflects this
          setCurrentConversationId(null); 
          setCurrentMessages([]); 
          setIsLoadingMessages(false); // No messages to load
        }
        // --- End Step 2 ---

      } else {
        throw new Error(result.error || 'Invalid data format from conversation list API');
      }
    } catch (error: any) {
      console.error(`❌ Dashboard Context: Error fetching conversations for agent ${agentId}:`, error);
      setConversationError(error.message || 'Failed to fetch conversations.');
      setConversationList([]);
      setCurrentConversationId(null);
      setCurrentMessages([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [authToken, handleLogout]); // Dependency on authToken and handleLogout

  // --- Select Webhook ---
  const selectWebhook = useCallback((webhook: Webhook | null) => {
    console.log('Selecting webhook:', webhook?.id ?? 'None');
    setSelectedWebhook(webhook);
    if (webhook) {
      // Switch view to show webhook details when a webhook is selected
      setActiveAgentView('webhookDetail'); 
      // Optionally clear agent/conversation selection if webhook view is separate
      // setSelectedAgentIdState(null); 
      // setCurrentConversationId(null);
    } else {
        // Optionally revert to a default view if webhook is deselected
        // setActiveAgentView('conversations'); 
    }
  }, [setActiveAgentView]); 
  // --- End Select Webhook ---

  // Memoize the context value
  const contextValue = useMemo(() => ({
    user,
    setUser,
    isLoading,
    setIsLoading,
    apiKeys,
    setApiKeys,
    refreshApiKeys: fetchApiKeys, // Rename for clarity externally
    error,
    setError,
    getUserInitials,
    handleLogout,
    // Agent context
    agents,
    setAgents, // Keep setter if direct manipulation is needed elsewhere (rarely)
    selectedAgentId: selectedAgentIdState, // Expose the state value
    setSelectedAgentId: handleAgentSelection, // Use the new handler
    isLoadingAgents,
    agentError,
    fetchAgents,
    authToken,
    activeAgentView,
    setActiveAgentView,
    // Conversation & Message context
    conversationList,
    isLoadingConversations,
    currentConversationId: currentConversationId, // Expose state value
    currentMessages,
    isLoadingMessages,
    isCreatingConversation,
    conversationError,
    fetchConversationsForAgent, // Expose if needed externally
    handleCreateNewChat,
    selectConversationId, // Expose the selector function
    setSelectedAgentIdDirectly: setSelectedAgentIdState, // Expose direct setter if absolutely needed
    // Webhook related
    userWebhooks,
    isLoadingWebhooks,
    webhookError,
    selectedWebhook,
    fetchUserWebhooks,
    selectWebhook,
  }), [
    user, isLoading, apiKeys, error, getUserInitials, handleLogout,
    agents, selectedAgentIdState, handleAgentSelection, isLoadingAgents, agentError, fetchAgents, authToken, activeAgentView, // Agent values
    conversationList, isLoadingConversations, currentConversationId, currentMessages, isLoadingMessages, isCreatingConversation, conversationError, fetchConversationsForAgent, handleCreateNewChat, selectConversationId, // Conversation values
    // fetchApiKeys is stable due to useCallback
    // setActiveAgentView is stable
    // setSelectedAgentIdState is stable
    // setError is stable
    // setIsLoading is stable
    // setUser is stable
    // setAgents is stable
    // Add webhook state to dependency array
    userWebhooks, isLoadingWebhooks, webhookError, selectedWebhook,
    // List all functions
    setUser, setIsLoading, setApiKeys, setError, getUserInitials, handleLogout, setAgents, setSelectedAgentIdState, fetchAgents, setActiveAgentView,
    fetchConversationsForAgent, handleCreateNewChat, selectConversationId, setSelectedAgentIdState,
    // Add webhook functions to dependency array
    fetchUserWebhooks, selectWebhook, fetchApiKeys // Added fetchApiKeys
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