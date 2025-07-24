'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { ClientOrganization } from '@agent-base/types';

interface OrganizationContextType {
  organizations: ClientOrganization[];
  currentOrganization: ClientOrganization | null;
  activeOrgId: string | null | undefined;
  isLoadingOrganizations: boolean;
  organizationError: string | null;
  switchOrganization: (organizationId: string) => Promise<void>; 
}

export const OrganizationContext = createContext<OrganizationContextType>({
  organizations: [],
  currentOrganization: null,
  activeOrgId: null,
  isLoadingOrganizations: true,
  organizationError: null,
  switchOrganization: async () => { console.warn("switchOrganization called on default context"); },
});

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const {
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    organizationError,
    switchOrganization,
    activeOrgId,
  } = useOrganizations();

  const contextValue = useMemo(() => ({
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    organizationError,
    switchOrganization,
    activeOrgId,
  }), [
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    organizationError,
    switchOrganization,
    activeOrgId,
  ]);

  return (
    <OrganizationContext.Provider value={contextValue}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
} 