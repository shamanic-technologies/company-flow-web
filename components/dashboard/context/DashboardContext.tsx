'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ApiKey, PlatformUser, ServiceResponse } from '@agent-base/types';


// Define the context type
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
});

// Provider component that wraps the dashboard pages
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Function to fetch API keys for a user
  const fetchApiKeys = async () => {
    try {
      // Get auth token from localStorage
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      
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

  // Check if the user has a valid authentication token
  const hasAuthToken = () => {
    try {
      // Get token from localStorage instead of cookies
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
      console.log('🔑 Dashboard - Auth token in localStorage:', authToken ? 'Yes' : 'No');
      
      return !!authToken;
    } catch (error) {
      console.error('Error checking auth token:', error);
      return false;
    }
  };

  // Function to fetch user data from API
  const fetchUserData = async () => {
    if (!hasAuthToken()) {
      console.error('⚠️ Dashboard - No auth token found, redirecting to home page');
      router.push('/');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('👤 Dashboard - Fetching user data from API');
      
      // Get token from localStorage
      const token = localStorage.getItem('auth-token');
      
      // Use Authorization Bearer header for API requests
      const userFetch = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`
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

  // Fetch user data when provider mounts
  useEffect(() => {
    fetchUserData();
  }, [router]);

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

  return (
    <DashboardContext.Provider
      value={{
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
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

// Custom hook to use the dashboard context
export function useDashboard() {
  return useContext(DashboardContext);
} 