'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useApiTools } from '@/hooks/useApiTools';
import { useOrganizationContext } from './OrganizationProvider';
import { useUserContext } from './UserProvider';
import { SearchApiToolResultItem } from '@agent-base/types';

interface ApiToolsContextType {
  apiTools: SearchApiToolResultItem[];
  isLoadingApiTools: boolean;
  apiToolsError: string | null;
  fetchApiTools: () => Promise<void>;
  isApiToolsReady: boolean;
}

export const ApiToolsContext = createContext<ApiToolsContextType>({
  apiTools: [],
  isLoadingApiTools: false,
  apiToolsError: null,
  fetchApiTools: async () => {},
  isApiToolsReady: false,
});

export function ApiToolsProvider({ children }: { children: ReactNode }) {
  const { activeOrgId } = useOrganizationContext();
  const { handleClerkLogout } = useUserContext();

  const {
    apiTools,
    isLoadingApiTools,
    apiToolsError,
    fetchApiTools,
    isApiToolsReady,
  } = useApiTools({ handleLogout: handleClerkLogout, activeOrgId });

  const contextValue = useMemo(() => ({
    apiTools,
    isLoadingApiTools,
    apiToolsError,
    fetchApiTools,
    isApiToolsReady,
  }), [
    apiTools,
    isLoadingApiTools,
    apiToolsError,
    fetchApiTools,
    isApiToolsReady,
  ]);

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