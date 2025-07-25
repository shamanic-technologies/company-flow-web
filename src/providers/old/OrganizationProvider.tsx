/*
'use client';

import { createContext, useContext } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';

interface OrganizationContextType {
  organizations: any[];
  currentOrganization: any;
  isLoadingOrganizations: boolean;
  isOrganizationsReady: boolean;
  organizationError: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<void>;
  createPersonalOrganization: () => Promise<void>;
  activeOrgId: string | null | undefined;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizations = useOrganizations();

  return (
    <OrganizationContext.Provider value={organizations}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      'useOrganizationContext must be used within an OrganizationProvider'
    );
  }
  return context;
}
*/ 