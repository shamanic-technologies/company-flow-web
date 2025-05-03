'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ApiKey, PlatformUser, ServiceResponse, Agent, Conversation } from '@agent-base/types';


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
}

// Create the context with a default value
const DashboardContext = createContext<DashboardContextType>({
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
  activeAgentView: 'chat', // New state for active view
  setActiveAgentView: () => {}, // Setter for active view
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
  const [selectedAgentId, setSelectedAgentIdState] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>(''); // Store token here
  const [activeAgentView, setActiveAgentView] = useState<'chat' | 'conversations' | 'memory' | 'actions'>('chat'); // New state for active view
  // --- End Agent State ---

  // Get auth token early
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    setAuthToken(token || '');
  }, []);

  // Function to fetch API keys for a user
  const fetchApiKeys = async () => {
    try {
      // Get auth token from state
      if (!authToken) {
        console.error('Unauthorized - no token found');
        router.push('/');
        return;
      }
      
      // Call our server-side API route
      const response = await fetch('/api/keys', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.status === 401) {
        console.error('Unauthorized - redirecting to home page');
        router.push('/');
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setApiKeys(data.data);
      } else {
        console.error('Failed to fetch API keys:', data);
        setApiKeys([]);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setApiKeys([]);
    }
  };

  // Function to refresh API keys (for use in other components)
  const refreshApiKeys = async () => {
    await fetchApiKeys();
  };

  // --- Agent Fetching Logic (moved from Playground) ---
  const fetchAgents = async () => {
    if (!authToken) {
      console.warn("No auth token available for fetching agents.");
      setAgentError("Authentication required to load agents.");
      setIsLoadingAgents(false);
      setAgents([]); // Ensure agents list is empty
      return;
    }
    
    setIsLoadingAgents(true);
    setAgentError(null);
    console.log("Dashboard Context: Fetching agents...");
    try {
      const response = await fetch('/api/agents/get-or-create', { 
        headers: { 'Authorization': `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to get/create agents: ${errorData.error || response.statusText}`);
      }

      const apiResponse = await response.json();
      console.log("Dashboard Context: Agent data received:", apiResponse);

      if (apiResponse.success && Array.isArray(apiResponse.data)) { 
         const fetchedAgents: Agent[] = apiResponse.data; 
         setAgents(fetchedAgents);
         console.log(`Dashboard Context: Successfully fetched/created ${fetchedAgents.length} agents.`);

         // Auto-select first agent if none selected *and* no agent is currently selected in context
         setSelectedAgentIdState(prevSelectedId => {
            if (!prevSelectedId && fetchedAgents.length > 0) {
                console.log("Dashboard Context: Auto-selecting first agent:", fetchedAgents[0].id);
                return fetchedAgents[0].id;
            } 
            return prevSelectedId; // Keep current selection if one exists
         });
      } else {
          const errorMsg = apiResponse?.error || 'Invalid data structure received from get/create agents API';
          throw new Error(errorMsg);
      }

    } catch (err: any) {
      console.error("Dashboard Context: Error fetching agents:", err);
      setAgentError(err.message || 'An unknown error occurred while fetching/creating agents.');
      setAgents([]); // Clear agents on error
      setSelectedAgentIdState(null); // Clear selection on error
    } finally {
        setIsLoadingAgents(false); 
    }
  };
  // --- End Agent Fetching Logic ---

  // Function to fetch user data from API
  const fetchUserData = async () => {
    if (!authToken) {
      console.error('⚠️ Dashboard - No auth token found, redirecting to home page');
      router.push('/');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('👤 Dashboard - Fetching user data from API');
      
      // Use Authorization Bearer header for API requests
      const userFetch = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('📊 Dashboard - User API response status:', userFetch.status);

      if (userFetch.status === 401) {
        console.error('🚫 Dashboard - Unauthorized response from API, redirecting to home page');
        localStorage.removeItem('auth-token'); // Clear invalid token
        router.push('/');
        return;
      }
      
      // Handle different error scenarios
      if (!userFetch.ok) {
        let errorDetail;
        try {
          const errorData = await userFetch.json();
          errorDetail = errorData.error || `Status: ${userFetch.status}`;
          console.error('❌ Dashboard - API error details:', errorData);
        } catch (e) {
          errorDetail = `Status: ${userFetch.status}`;
          console.error('❌ Dashboard - Could not parse error details');
        }
        
        if (userFetch.status === 503) {
          throw new Error(`Service unavailable - API gateway connection issue. ${errorDetail}`);
        } else {
          throw new Error(`API error: ${errorDetail}`);
        }
      }

      const userResponse: ServiceResponse<PlatformUser> = await userFetch.json();
      
      if (userResponse.success && userResponse.data) {
        console.log('✅ Dashboard - User data retrieved successfully');
        // Extract user profile from the API response
        const userData: PlatformUser = {
          id: userResponse.data.id,
          displayName: userResponse.data.displayName || 'Guest',
          email: userResponse.data.email,
          createdAt: userResponse.data.createdAt,
          oauthProvider: userResponse.data.oauthProvider || 'local',
          providerUserId: userResponse.data.providerUserId || '',
          lastLogin: userResponse.data.lastLogin || null,
          updatedAt: userResponse.data.updatedAt || null
        };
        setUser(userData);
      } else {
        console.error('❌ Dashboard - Invalid data format from API');
        throw new Error('Invalid data format from API');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load user data');
      
      // Show clear error messaging for connection problems
      if (error instanceof Error && 
          (error.message.includes('gateway') || 
           error.message.includes('unavailable') || 
           error.message.includes('connection'))) {
        setError('Connection to backend services failed. Please ensure all services are running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data and agents when provider mounts and token is available
  useEffect(() => {
    if (authToken) {
      fetchUserData();
      fetchAgents(); // Fetch agents after getting token
    } else {
      // If no token on mount, push to login/home (handled in fetchUserData already)
      console.log("Dashboard Context: No token on mount, deferring fetches.");
      setIsLoading(false); // Stop general loading indicator
      setIsLoadingAgents(false); // Stop agent loading indicator
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]); // Depend on authToken

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    
    const nameParts = user.displayName.split(' ');
    if (nameParts.length === 1) return nameParts[0].substring(0, 1).toUpperCase();
    
    return (nameParts[0].substring(0, 1) + nameParts[nameParts.length - 1].substring(0, 1)).toUpperCase();
  };

  // Handle logout
  const handleLogout = () => {
    // Clear auth token, user data, etc.
    localStorage.removeItem('auth-token');
    setUser(null);
    router.push('/');
  };

  // Reset selected agent and view if agents list changes (e.g., after initial load or error)
  useEffect(() => {
    // If there are agents and no agent is selected, select the first one by default
    if (agents.length > 0 && !selectedAgentId) {
      setSelectedAgentIdState(agents[0].id);
      setActiveAgentView('chat'); // Reset view when auto-selecting agent
    } else if (agents.length === 0) {
      // If no agents are available, clear selection
      setSelectedAgentIdState(null);
      setActiveAgentView('chat'); // Reset view
    } else if (selectedAgentId && !agents.find(agent => agent.id === selectedAgentId)) {
       // If the currently selected agent is no longer in the list, select the first one or null
       setSelectedAgentIdState(agents.length > 0 ? agents[0].id : null);
       setActiveAgentView('chat'); // Reset view
    }
    // Only re-run when agents array identity changes, not on selectedAgentId change itself
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents]); 

  // --- Enhanced Agent Selection Logic ---
  const setSelectedAgentId = useCallback((id: string | null) => {
    setSelectedAgentIdState(id);
    if (id) {
      setActiveAgentView('chat'); // Reset to chat view when a new agent is selected
    }
  }, []);

  useEffect(() => {
    if (!isLoadingAgents && agents.length > 0 && !selectedAgentId) {
       setSelectedAgentIdState(agents[0].id);
       setActiveAgentView('chat');
    }
    else if (selectedAgentId && !agents.find(agent => agent.id === selectedAgentId)) {
       setSelectedAgentIdState(agents.length > 0 ? agents[0].id : null);
       setActiveAgentView('chat');
    }
    else if (agents.length === 0) {
       setSelectedAgentIdState(null);
       setActiveAgentView('chat');
    }
  }, [agents, isLoadingAgents, selectedAgentId]);
  // --- End Enhanced Agent Selection Logic ---

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    setUser,
    isLoading,
    setIsLoading,
    apiKeys,
    setApiKeys,
    refreshApiKeys,
    error,
    setError,
    getUserInitials,
    handleLogout,
    // Agent state and functions
    agents,
    setAgents, // Pass setter if needed, though fetchAgents handles updates
    selectedAgentId,
    setSelectedAgentId, // Pass the wrapper function
    isLoadingAgents,
    agentError, // Pass agent-specific error
    fetchAgents, // Pass fetch function
    authToken, // Pass auth token
    activeAgentView, // Provide active view state
    setActiveAgentView, // Provide setter for active view
  }), [
    user, 
    isLoading, 
    error, 
    authToken, 
    agents, 
    isLoadingAgents, 
    agentError, 
    selectedAgentId,
    activeAgentView // Include active view in dependencies
  ]);

  return (
    <DashboardContext.Provider value={value}>
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