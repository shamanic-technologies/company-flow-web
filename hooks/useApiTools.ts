'use client';

import { useState, useCallback, useEffect } from 'react';
import { ApiTool, ErrorResponse, SearchApiToolResult, SearchApiToolResultItem, ServiceResponse } from '@agent-base/types';


interface UseApiToolsProps {
  handleLogout: () => void;
}

/**
 * @description Hook to manage API tool data fetching, selection, and state.
 * @param {UseApiToolsProps} props - The logout handler.
 * @returns An object containing API tools, loading/error states, and related functions.
 */
export function useApiTools({ handleLogout }: UseApiToolsProps) {
  const [apiTools, setApiTools] = useState<SearchApiToolResultItem[]>([]);
  const [isLoadingApiTools, setIsLoadingApiTools] = useState<boolean>(false);
  const [apiToolsError, setApiToolsError] = useState<string | null>(null);

  // --- Fetch API Tools ---
  const fetchApiTools = useCallback(async () => {
    console.log("🎣 useApiTools - Polling for API tools...");
    // setIsLoadingApiTools(true);
    // setApiToolsError(null); // Clear error at start of every fetch if preferred

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
        setIsLoadingApiTools(false); // Ensure loading state is reset
        return;
      }

      // The response.json() will be parsed here. 
      // If !response.ok, it should contain the error structure from createErrorResponse.
      // If response.ok, it should contain ApiTool[] directly.
      const parsedJson: unknown = await response.json();

      if (!response.ok) {
        const errorPayload = parsedJson as ErrorResponse;
        // responseData here is the parsed JSON from createErrorResponse, e.g., { error: "...", errorCode: "..." }
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
        setIsLoadingApiTools(false); // Ensure loading state is reset
        return;
      }
      
      // If response.ok, responseData is ApiTool[] (which is SearchApiToolResult)
      const successData = parsedJson as SearchApiToolResult;
      
      if (successData && Array.isArray(successData.items)) {
        const toolsWithDateObjects: SearchApiToolResultItem[] = successData.items.map(item => {
          // The item from successData.items has createdAt/updatedAt as string (from JSON)
          // but SearchApiToolResultItem types them as Date. We need to convert.
          const createdDate = new Date(item.createdAt as unknown as string);
          const updatedDate = new Date(item.updatedAt as unknown as string);

          // Validate dates after conversion, just in case of invalid date strings from API
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

        // --- BEGIN DEBUG LOG ---
        console.log("✅ useApiTools - Fetched and processed API tools:", JSON.stringify(toolsWithDateObjects.map(t => ({...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString()})), null, 2)); // Log ISO strings for readability
        // Check for duplicate IDs
        const ids = toolsWithDateObjects.map(tool => tool.apiToolId);
        const uniqueIds = new Set(ids);
        if (ids.length !== uniqueIds.size) {
          console.warn("⚠️ useApiTools - Duplicate IDs found in fetched data:", ids);
          const duplicateIdMap = ids.reduce((acc, id, index) => {
            if (ids.indexOf(id) !== index) { // Found a duplicate
              if (!acc[id]) acc[id] = [];
              acc[id].push(index); // Log indices of duplicates
            }
            return acc;
          }, {} as Record<string, number[]>);
          console.warn("⚠️ useApiTools - Duplicate ID details (ID: [indices]):", duplicateIdMap);
        }
        // Check for missing IDs
        const itemsWithMissingIds = toolsWithDateObjects.filter(tool => tool.apiToolId === undefined || tool.apiToolId === null || tool.apiToolId === '');
        if (itemsWithMissingIds.length > 0) {
            console.warn("⚠️ useApiTools - Items with missing or invalid IDs found:", itemsWithMissingIds);
        }
        // --- END DEBUG LOG ---
        setApiTools(toolsWithDateObjects);
        setApiToolsError(null); // Clear any previous error on success
      } else {
        // This case should ideally not happen if the API contract is followed for successful responses.
        console.error('❌ useApiTools - API request successful but data structure is not as expected (expected { items: [], total: number }):', successData);
        setApiTools([]);
        setApiToolsError('Received unexpected data structure from API tools endpoint.');
      }

    } catch (error: any) {
      console.error('❌ useApiTools - Exception during API tools fetch:', error);
      // This catch block handles network errors or errors during response.json() parsing itself (e.g. if not valid JSON)
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
  }, [handleLogout]);

  // --- Effect to Poll for API Tools Every 5 Seconds ---
  useEffect(() => {
    setIsLoadingApiTools(true);
    setApiToolsError(null); // Clear errors before the first fetch or on re-mount
    fetchApiTools();

    const intervalId = setInterval(() => {
      fetchApiTools();
    }, 5000);

    return () => {
      clearInterval(intervalId);
      console.log("🛑 useApiTools - Stopped polling for API tools.");
    };
  }, [fetchApiTools]);

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