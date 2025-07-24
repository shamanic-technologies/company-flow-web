/*
'use client';

import { useState, useCallback, useEffect } from 'react';
import { SearchApiToolResultItem } from '@agent-base/types';
import { useAuth } from '@clerk/nextjs';

interface UseApiToolsProps {
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

export interface UseApiToolsReturn {
  apiTools: SearchApiToolResultItem[];
  isLoadingApiTools: boolean;
  apiToolsError: string | null;
  fetchApiTools: () => Promise<void>;
  isApiToolsReady: boolean;
}

export function useApiTools({ handleLogout, activeOrgId }: UseApiToolsProps): UseApiToolsReturn {
  const { getToken } = useAuth();
  const [apiTools, setApiTools] = useState<SearchApiToolResultItem[]>([]);
  const [isLoadingApiTools, setIsLoadingApiTools] = useState<boolean>(true);
  const [apiToolsError, setApiToolsError] = useState<string | null>(null);

  const isApiToolsReady = !isLoadingApiTools;

  const fetchApiTools = useCallback(async () => {
    if (!activeOrgId) {
      setIsLoadingApiTools(false);
      return;
    }

    setIsLoadingApiTools(true);
    setApiToolsError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      
      const response = await fetch(`/api/api-tools/search?organizationId=${activeOrgId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: '', // Empty query to fetch all
          topK: 100, // Fetch a large number
        }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch API tools');
      }
      
      const data: SearchApiToolResultItem[] = await response.json();
      setApiTools(data);

    } catch (error: any) {
      setApiToolsError(error.message);
      setApiTools([]);
    } finally {
      setIsLoadingApiTools(false);
    }
  }, [activeOrgId, getToken, handleLogout]);
  
  useEffect(() => {
    fetchApiTools();
  }, [fetchApiTools]);

  return {
    apiTools,
    isLoadingApiTools,
    apiToolsError,
    fetchApiTools,
    isApiToolsReady,
  };
}
*/
