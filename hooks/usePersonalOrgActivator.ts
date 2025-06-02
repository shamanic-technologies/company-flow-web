import { useEffect } from 'react';
import type { UserResource, OrganizationMembershipResource, SetActive } from '@clerk/types';

interface UsePersonalOrgActivatorProps {
  clerkIsLoaded: boolean;
  authIsLoaded: boolean;
  isSignedIn: boolean | undefined;
  clerkUser: UserResource | null | undefined;
  activeOrgId: string | null | undefined;
  setActive: SetActive | undefined; // setActive can be undefined before Clerk is fully loaded
}

/**
 * Custom hook to ensure the "Personal" organization is active if no other organization is active.
 * It finds the user's "Personal" organization (if they are an admin of it)
 * and calls setActive if appropriate conditions are met.
 */
export function usePersonalOrgActivator({
  clerkIsLoaded,
  authIsLoaded,
  isSignedIn,
  clerkUser,
  activeOrgId,
  setActive,
}: UsePersonalOrgActivatorProps): void {
  useEffect(() => {
    const ensurePersonalOrgIsActive = async () => {
      // Proceed only if Clerk is loaded, user is signed in, no org is active, and setActive is available
      if (clerkIsLoaded && authIsLoaded && isSignedIn && clerkUser && !activeOrgId && typeof setActive === 'function') {
        console.log("[usePersonalOrgActivator] No active organization. Attempting to find and set 'Personal' org.");

        // @ts-ignore - Clerk's user.organizationMemberships type might not perfectly align with OrganizationMembershipResource[]
        const personalOrgMembership = clerkUser.organizationMemberships?.find(
          (mem: OrganizationMembershipResource) => 
            mem.organization.name === "Personal" && 
            (mem.role === 'org:admin' || mem.role === 'admin') // User must be an admin of the 'Personal' org
        );

        if (personalOrgMembership && personalOrgMembership.organization.id) {
          console.log(`[usePersonalOrgActivator] Found "Personal" org (ID: ${personalOrgMembership.organization.id}) with admin role. Setting it active.`);
          try {
            await setActive({ organization: personalOrgMembership.organization.id });
            console.log("[usePersonalOrgActivator] Successfully set 'Personal' org as active.");
          } catch (err: any) {
            console.error(`[usePersonalOrgActivator] Error calling setActive for org ID ${personalOrgMembership.organization.id}:`, err);
          }
        } else {
          console.log("[usePersonalOrgActivator] Could not find a 'Personal' org where user is admin, or clerkUser.organizationMemberships not available.");
        }
      }
    };

    ensurePersonalOrgIsActive();
  }, [clerkIsLoaded, authIsLoaded, isSignedIn, clerkUser, activeOrgId, setActive]);
} 