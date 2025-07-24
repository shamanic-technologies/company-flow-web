/*
import { useState, useCallback, useEffect } from 'react';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import type { UserResource, OrganizationMembershipResource, SetActive, OrganizationResource } from '@clerk/types';
import { ClientOrganization } from '@agent-base/types';

interface UseOrganizationsProps {
  // Optional: if you need to pass anything specific to this hook from where it's called
  // For now, it will derive most of its needs from the Clerk hooks directly.
}

interface UseOrganizationsReturn {
  organizations: ClientOrganization[];
  currentOrganization: ClientOrganization | null;
  isLoadingOrganizations: boolean;
  isOrganizationsReady: boolean;
  organizationError: string | null;
  switchOrganization: (organizationId: string) => Promise<void>;
  createOrganization: (name: string) => Promise<void>;
  createPersonalOrganization: () => Promise<void>;
  activeOrgId: string | null | undefined;
  // Potentially add a function to explicitly reload organizations if needed later
  // refreshOrganizations: () => Promise<void>; 
}

export function useOrganizations(): UseOrganizationsReturn {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { orgId: activeOrgIdFromClerk, isLoaded: authIsLoaded } = useAuth();
  const { setActive, createOrganization: createClerkOrganization } = useClerk();

  const [organizations, setOrganizations] = useState<ClientOrganization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<ClientOrganization | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true); // Start as true
  const [organizationError, setOrganizationError] = useState<string | null>(null);

  const isOrganizationsReady = clerkIsLoaded && authIsLoaded && !isLoadingOrganizations;

  const loadAndProcessOrganizations = useCallback(async () => {
    if (!clerkUser || !clerkIsLoaded || !authIsLoaded || !setActive) {
      // Dependencies from Clerk are not ready yet.
      // We'll wait for the useEffect to re-trigger when they are.
      // isLoadingOrganizations remains true.
      return;
    }

    // Set loading to true only when we are certain we are about to fetch.
    setIsLoadingOrganizations(true);
    setOrganizationError(null);

    try {
      const orgList: ClientOrganization[] = [];
      if (clerkUser.organizationMemberships) {
        clerkUser.organizationMemberships.forEach((membership: OrganizationMembershipResource) => {
          if (membership.organization) {
            const org: ClientOrganization = {
              id: membership.organization.id,
              name: membership.organization.name,
              clientAuthOrganizationId: membership.organization.id,
              creatorClientUserId: clerkUser.id, // Use current Clerk user's ID as a proxy for creator
              profileImage: membership.organization.imageUrl || undefined,
              createdAt: membership.organization.createdAt || new Date(),
              updatedAt: membership.organization.updatedAt || new Date(),
            };
            orgList.push(org);
          }
        });
      }

      orgList.sort((a, b) => {
        if (a.name === 'Personal' && b.name !== 'Personal') return -1;
        if (a.name !== 'Personal' && b.name === 'Personal') return 1;
        return a.name.localeCompare(b.name);
      });

      setOrganizations(orgList);

      // Handle current organization and automatic "Personal" org activation
      if (activeOrgIdFromClerk) {
        const currentOrg = orgList.find(org => org.clientAuthOrganizationId === activeOrgIdFromClerk);
        setCurrentOrganization(currentOrg || null);
      } else {
        // No active org from Clerk, try to activate "Personal" org
        const personalOrgMembership = orgList.find(
          (org) => org.name === "Personal" // Assuming creator check is handled by Clerk permissions or already part of orgList creation
        );

        if (personalOrgMembership && personalOrgMembership.clientAuthOrganizationId) {
          console.log(`[useOrganizations] No active organization. Attempting to set 'Personal' org (ID: ${personalOrgMembership.clientAuthOrganizationId}).`);
          try {
            await setActive({ organization: personalOrgMembership.clientAuthOrganizationId });
            setCurrentOrganization(personalOrgMembership);
            console.log("[useOrganizations] Successfully set 'Personal' org as active.");
          } catch (err: any) {
            console.error(`[useOrganizations] Error calling setActive for 'Personal' org ID ${personalOrgMembership.clientAuthOrganizationId}:`, err);
            // Set error or let it be handled by the general catch? For now, log and continue.
            // If this fails, currentOrganization will remain null, and activeOrgIdFromClerk will still be null.
          }
        } else {
          console.log("[useOrganizations] Could not find a 'Personal' org to activate automatically, or it has no ID.");
        }
      }
    } catch (error: any) {
      console.error('[useOrganizations] Error loading organizations:', error);
      setOrganizationError('Failed to load organizations');
      setOrganizations([]); // Clear organizations on error
      setCurrentOrganization(null);
    } finally {
      setIsLoadingOrganizations(false);
    }
  }, [clerkUser, clerkIsLoaded, authIsLoaded, activeOrgIdFromClerk, setActive]);

  const createPersonalOrganization = useCallback(async () => {
    if (!createClerkOrganization || !setActive || !clerkUser || !organizations) {
      const error = new Error('Clerk is not ready to create an organization.');
      console.error('[useOrganizations]', error);
      setOrganizationError(error.message);
      throw error;
    }
    
    try {
      // Find the next personal org name
      const personalOrgs = organizations.filter(
        (org: ClientOrganization) => org.name.startsWith("Personal")
      );

      let newOrgName = "Personal";
      if (personalOrgs.length > 0) {
        const personalOrgNumbers = personalOrgs
          .map((org: ClientOrganization) => {
            const name = org.name;
            if (name === "Personal") return 1;
            const match = name.match(/^Personal (\d+)$/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter(num => num > 0);
        
        const maxNumber = personalOrgNumbers.length > 0 ? Math.max(...personalOrgNumbers) : 0;
        newOrgName = `Personal ${maxNumber + 1}`;
      }
      
      console.log(`[useOrganizations] Creating and activating landing org: ${newOrgName}`);

      // Create the organization via Clerk
      const newClerkOrg = await createClerkOrganization({ name: newOrgName });
      if (!newClerkOrg || !newClerkOrg.id) {
        throw new Error("Organization creation failed or returned no ID.");
      }
      
      // Set the newly created organization as active
      await setActive({ organization: newClerkOrg.id });
      
      // Manually refresh the user object to get the latest memberships
      await clerkUser.reload();
      
      // The user object is now updated, so we can re-process the organizations list.
      await loadAndProcessOrganizations();
      
      console.log(`[useOrganizations] Successfully created and switched to organization: ${newOrgName}`);
    } catch (error: any) {
      console.error('[useOrganizations] Error creating landing organization:', error);
      setOrganizationError('Failed to create landing organization.');
      throw error; // Re-throw for the component to handle UI feedback
    }
  }, [createClerkOrganization, setActive, clerkUser, loadAndProcessOrganizations, organizations]);

  const createOrganization = useCallback(async (name: string) => {
    if (!createClerkOrganization || !setActive || !clerkUser) {
      const error = new Error('Clerk is not ready to create an organization.');
      console.error('[useOrganizations]', error);
      setOrganizationError(error.message);
      throw error;
    }
    
    try {
      // Create the organization via Clerk
      const newClerkOrg = await createClerkOrganization({ name });
      if (!newClerkOrg || !newClerkOrg.id) {
        throw new Error("Organization creation failed or returned no ID.");
      }
      
      // Set the newly created organization as active
      await setActive({ organization: newClerkOrg.id });
      
      // Manually refresh the user object to get the latest memberships
      await clerkUser.reload();
      
      // The user object is now updated, so we can re-process the organizations list.
      // The useEffect listening to `activeOrgIdFromClerk` will handle setting the `currentOrganization`.
      await loadAndProcessOrganizations();
      
      console.log(`[useOrganizations] Successfully created and switched to organization: ${name}`);

    } catch (error: any) {
      console.error('[useOrganizations] Error creating organization:', error);
      setOrganizationError('Failed to create organization.');
      throw error; // Re-throw for the component to handle UI feedback
    }
  }, [createClerkOrganization, setActive, clerkUser, loadAndProcessOrganizations]);

  const switchOrganization = useCallback(async (organizationId: string) => {
    if (!setActive) {
      console.error('[useOrganizations] setActive not available from Clerk.');
      setOrganizationError('Unable to switch organization: Clerk SDK issue.');
      throw new Error('Clerk setActive function is not available.');
    }
    if (!organizationId) {
        console.error('[useOrganizations] switchOrganization called with no organizationId.');
        setOrganizationError('Unable to switch organization: No organization ID provided.');
        throw new Error('No organization ID provided for switching.');
    }

    // Optimistically set loading state, or wait for activeOrgIdFromClerk to change?
    // For now, we rely on the useEffect below to update currentOrganization based on activeOrgIdFromClerk changes.
    setOrganizationError(null); // Clear previous errors
    try {
      await setActive({ organization: organizationId });
      // Clerk's activeOrgIdFromClerk should update, which will trigger the useEffect below
      // to update currentOrganization.
      console.log(`[useOrganizations] Successfully initiated switch to organization: ${organizationId}`);
    } catch (error: any) {
      console.error('[useOrganizations] Error switching organization:', error);
      setOrganizationError('Failed to switch organization');
      throw error; // Re-throw so the calling component can handle it (e.g., show a toast)
    }
  }, [setActive]);

  // Effect to load organizations when Clerk user/auth state changes
  useEffect(() => {
    loadAndProcessOrganizations();
  }, [loadAndProcessOrganizations]);
  
  // Effect to automatically create the initial "Personal" organization if the user has none.
  useEffect(() => {
    // This check runs after the initial loading attempt is complete.
    const hasLandingPrompt = localStorage.getItem('landing_page_message');

    if (!isLoadingOrganizations && clerkIsLoaded && clerkUser && organizations.length === 0 && !hasLandingPrompt) {
      // A second check on the raw membership data to be certain.
      if (clerkUser.organizationMemberships.length === 0) {
        console.log("[useOrganizations] User has no organizations and no landing prompt. Creating initial 'Personal' org.");
        createPersonalOrganization();
      }
    }
  }, [isLoadingOrganizations, organizations, clerkUser, clerkIsLoaded, createPersonalOrganization]);

  // Effect to update currentOrganization when activeOrgIdFromClerk changes from Clerk hooks
  // This ensures currentOrganization is in sync with Clerk's state after a switchOrganization call or initial load.
  useEffect(() => {
    if (activeOrgIdFromClerk && organizations.length > 0) {
      const orgDetails = organizations.find(org => org.clientAuthOrganizationId === activeOrgIdFromClerk);
      setCurrentOrganization(orgDetails || null);
    } else if (!activeOrgIdFromClerk) {
      // If activeOrgId becomes null (e.g., user leaves all orgs, or error), clear currentOrganization
      setCurrentOrganization(null);
    }
  }, [activeOrgIdFromClerk, organizations]);

  return {
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    isOrganizationsReady,
    organizationError,
    switchOrganization,
    createOrganization,
    createPersonalOrganization: createPersonalOrganization,
    activeOrgId: activeOrgIdFromClerk, // Directly return the activeOrgId from Clerk Auth
  };
}
*/ 