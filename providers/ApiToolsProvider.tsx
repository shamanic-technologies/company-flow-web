'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useApiToolsQuery } from '@/hooks/useApiToolsQuery';
import { SearchApiToolResultItem } from '@agent-base/types';

interface ApiToolsContextType {
  apiTools: SearchApiToolResultItem[];
  isLoadingApiTools: boolean;
  apiToolsError: string | null;
  isApiToolsReady: boolean;
}

export const ApiToolsContext = createContext<ApiToolsContextType | undefined>(undefined);

export function ApiToolsProvider({ children }: { children: ReactNode }) {
  const { 
    apiTools, 
    isLoadingApiTools, 
    apiToolsError 
  } = useApiToolsQuery();
  
  const contextValue = useMemo(() => ({
    apiTools,
    isLoadingApiTools,
    apiToolsError: apiToolsError?.message ?? null,
    isApiToolsReady: !isLoadingApiTools && !apiToolsError,
  }), [apiTools, isLoadingApiTools, apiToolsError]);

  return (
    <ApiToolsContext.Provider value={contextValue}>
      {children}
    </ApiToolsContext.Provider>
  );
}

export function useApiToolsContext() {
  const context = useContext(ApiToolsContext);
  if (context === undefined) {
    throw new Error('useApiToolsContext must be used within an ApiToolsProvider');
  }
  return context;
} 