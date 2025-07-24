'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import type { UserResource } from '@clerk/types';
import { useOrganizationsQuery } from '@/hooks/useOrganizationsQuery';
import type { Organization } from '@agent-base/types';

interface UserContextType {
  clerkUser: UserResource | null | undefined;
  isClerkLoading: boolean;
  isSignedIn: boolean | undefined;
  handleClerkLogout: () => Promise<void>;
  getClerkUserInitials: () => string;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoadingOrganizations: boolean;
  isPendingOrganizations: boolean;
  isOrganizationsReady: boolean;
  switchOrganization: (orgId: string) => void;
}

export const UserContext = createContext<UserContextType>({
  clerkUser: undefined,
  isClerkLoading: true,
  isSignedIn: undefined,
  handleClerkLogout: async () => {},
  getClerkUserInitials: () => '?',
  organizations: [],
  currentOrganization: null,
  isLoadingOrganizations: true,
  isPendingOrganizations: false,
  isOrganizationsReady: false,
  switchOrganization: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { isSignedIn, isLoaded: authIsLoaded } = useAuth();
  const { signOut } = useClerk();

  const { 
    organizations, 
    currentOrganization, 
    isLoadingOrganizations, 
    isPendingOrganizations,
    isOrganizationsReady,
    switchOrganization 
  } = useOrganizationsQuery();

  const handleClerkLogout = useCallback(async () => {
    try {
      await signOut(() => { router.push('/'); });
    } catch (error) {
      console.error("UserProvider: Error during Clerk signOut:", error);
      router.push('/');
    }
  }, [signOut, router]);

  const getClerkUserInitials = useCallback(() => {
    if (!clerkUser) return '?';
    const { firstName, lastName, primaryEmailAddress } = clerkUser;
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return firstName[0].toUpperCase();
    if (primaryEmailAddress) return primaryEmailAddress.emailAddress[0].toUpperCase();
    return '?';
  }, [clerkUser]);

  const isClerkLoading = !clerkIsLoaded || !authIsLoaded;
  
  useEffect(() => {
    if (!isClerkLoading && !isSignedIn) {
      router.push('/');
    }
  }, [isClerkLoading, isSignedIn, router]);

  const contextValue = useMemo(() => ({
    clerkUser,
    isClerkLoading,
    isSignedIn,
    handleClerkLogout,
    getClerkUserInitials,
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    isPendingOrganizations,
    isOrganizationsReady,
    switchOrganization,
  }), [
    clerkUser, 
    isClerkLoading,
    isSignedIn,
    handleClerkLogout,
    getClerkUserInitials,
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    isPendingOrganizations,
    isOrganizationsReady,
    switchOrganization
  ]);
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
} 