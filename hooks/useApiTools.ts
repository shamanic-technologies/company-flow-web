'use client';

import { useState, useCallback, useEffect } from 'react';
import { ApiTool, ErrorResponse, SearchApiToolResult, SearchApiToolResultItem, ServiceResponse } from '@agent-base/types';

interface UseApiToolsProps {
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

/**
 * @description Hook to manage API tool data fetching, selection, and state.
 * @param {UseApiToolsProps} props - The logout handler and activeOrgId.
 * @returns An object containing API tools, loading/error states, and related functions.
 */
export function useApiTools({ handleLogout, activeOrgId }: UseApiToolsProps) {
  const [apiTools, setApiTools] = useState<SearchApiToolResultItem[]>([]);
  const [isLoadingApiTools, setIsLoadingApiTools] = useState<boolean>(false);
  const [apiToolsError, setApiToolsError] = useState<string | null>(null);

  // --- Fetch API Tools ---
  const fetchApiTools = useCallback(async () => {
    if (!activeOrgId) {
      console.log("🎣 useApiTools - Waiting for activeOrgId to fetch API tools...");
      setApiTools([]);
      setIsLoadingApiTools(false);
      // setApiToolsError("Organization not selected. Cannot fetch API tools.");
      return;
    }
    console.log(`🎣 useApiTools - Polling for API tools for org: ${activeOrgId}`);
    setApiToolsError(null);

    try {
      const response = await fetch('/api/api-tools', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.error('🚫 useApiTools - Unauthorized fetching API tools');
        setApiToolsError('Unauthorized. Please log in again.');
        setApiTools([]);
        // handleLogout(); // Consider calling logout if policy dictates
        setIsLoadingApiTools(false);
        return;
      }

      const parsedJson: unknown = await response.json();

      if (!response.ok) {
        const errorPayload = parsedJson as ErrorResponse;
        console.error(`❌ useApiTools - HTTP error ${response.status}:`, errorPayload);
        
        let finalErrorMessage: string;
        if (typeof errorPayload.details === 'string' && errorPayload.details) {
            finalErrorMessage = errorPayload.details;
        } else if (typeof errorPayload.error === 'string' && errorPayload.error) {
            finalErrorMessage = errorPayload.error;
        } else {
            finalErrorMessage = `Failed to fetch API tools. Status: ${response.status}`;
        }
        
        setApiToolsError(finalErrorMessage);
        setApiTools([]);
        setIsLoadingApiTools(false);
        return;
      }
      
      const successData = parsedJson as SearchApiToolResult;
      
      if (successData && Array.isArray(successData.items)) {
        const toolsWithDateObjects: SearchApiToolResultItem[] = successData.items.map(item => {
          const createdDate = new Date(item.createdAt as unknown as string);
          const updatedDate = new Date(item.updatedAt as unknown as string);

          if (isNaN(createdDate.getTime())) {
            console.warn(`⚠️ useApiTools - Invalid createdAt date string received for tool ${item.apiToolId}: ${item.createdAt}`);
          }
          if (isNaN(updatedDate.getTime())) {
            console.warn(`⚠️ useApiTools - Invalid updatedAt date string received for tool ${item.apiToolId}: ${item.updatedAt}`);
          }

          return {
            ...item,
            createdAt: createdDate,
            updatedAt: updatedDate,
          };
        });
        setApiTools(toolsWithDateObjects);
        setApiToolsError(null);
      } else {
        console.error('❌ useApiTools - API request successful but data structure is not as expected:', successData);
        setApiTools([]);
        setApiToolsError('Received unexpected data structure from API tools endpoint.');
      }

    } catch (error: any) {
      console.error('❌ useApiTools - Exception during API tools fetch:', error);
      let specificMessage = 'An unexpected network or client-side error occurred.';
      if (error.message) {
        specificMessage = error.message;
      } else if (typeof error === 'string') {
        specificMessage = error;
      }
      setApiToolsError(specificMessage);
      setApiTools([]);
    } finally {
      setIsLoadingApiTools(false);
    }
  }, [activeOrgId, handleLogout]);

  // --- Effect to Poll for API Tools Every 5 Seconds ---
  useEffect(() => {
    if (!activeOrgId) {
      setApiTools([]);
      setIsLoadingApiTools(false);
      setApiToolsError(null);
      return;
    }
    // Initial fetch
    setIsLoadingApiTools(true);
    fetchApiTools();

    const intervalId = setInterval(() => {
      fetchApiTools();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      console.log("🛑 useApiTools - Stopped polling for API tools.");
    };
  }, [activeOrgId, fetchApiTools]);

  // --- Placeholder for Select API Tool (if needed later) ---
  // const [selectedApiTool, setSelectedApiTool] = useState<ApiTool | null>(null);
  // const selectApiTool = useCallback((tool: ApiTool | null) => {
  //   console.log(`useApiTools: Setting selected API tool to: ${tool?.id ?? 'None'}`);
  //   setSelectedApiTool(tool);
  // }, []);

  return {
    apiTools,
    // selectedApiTool, 
    // selectApiTool,   
    isLoadingApiTools,
    apiToolsError,
    fetchApiTools, 
  };
} 