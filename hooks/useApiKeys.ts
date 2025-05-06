'use client';

import { useState, useCallback, useEffect } from 'react';
import { ApiKey, ServiceResponse } from '@agent-base/types';

interface UseApiKeysProps {
  authToken: string;
  handleLogout: () => void; // Necessary if API key fetch fails due to auth
}

/**
 * @description Hook to manage API key fetching and state.
 * @param {UseApiKeysProps} props - The authentication token and logout handler.
 * @returns An object containing API keys, loading/error states, and refresh function.
 */
export function useApiKeys({ authToken, handleLogout }: UseApiKeysProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState<boolean>(false);
  const [keysError, setKeysError] = useState<string | null>(null);

  // Function to fetch API keys
  const fetchApiKeys = useCallback(async () => {
    if (!authToken) {
      console.warn('useApiKeys: Auth token not available, cannot fetch keys.');
      setApiKeys([]);
      setIsLoadingKeys(false);
      // No error state set here as it's an expected condition before auth completes
      return;
    }

    console.log('🔑 useApiKeys: Fetching API keys...');
    setIsLoadingKeys(true);
    setKeysError(null);

    try {
      const response = await fetch('/api/keys', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (response.status === 401) {
        console.error('🚫 useApiKeys: Unauthorized fetching keys - logging out.');
        handleLogout(); // Call logout passed from useAuth
        return;
      }

      const data: ServiceResponse<ApiKey[]> = await response.json();

      if (!response.ok) {
         let errorDetail = `Status: ${response.status}`;
         if (data && data.error) { errorDetail = data.error; }
         throw new Error(`API error fetching keys: ${errorDetail}`);
      }

      if (data.success && data.data) {
        console.log('✅ useApiKeys: API keys fetched successfully.');
        setApiKeys(data.data);
      } else {
        throw new Error(data.error || 'Invalid data format from keys API');
      }
    } catch (error: any) {
      console.error('❌ useApiKeys: Error fetching API keys:', error);
      setApiKeys([]);
      setKeysError(error.message || 'Error fetching API keys');
    } finally {
      setIsLoadingKeys(false);
    }
  }, [authToken, handleLogout]);

  // --- Effect to fetch keys when token becomes available --- 
  useEffect(() => {
    // Fetch keys only when the auth token is available.
    if (authToken) {
        fetchApiKeys();
    }
    // If authToken becomes null (logout), clear the keys
    else {
        setApiKeys([]);
        setIsLoadingKeys(false);
        setKeysError(null);
    }
  }, [authToken, fetchApiKeys]); // Rerun when token changes or fetch function instance changes

  return {
    apiKeys,
    isLoadingKeys,
    keysError,
    refreshApiKeys: fetchApiKeys, // Expose fetch function as refresh
  };
} 