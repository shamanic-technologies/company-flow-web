import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser, useAuth, useClerk } from '@clerk/nextjs';
import type { OrganizationMembershipResource } from '@clerk/types';
import { ClientOrganization } from '@agent-base/types';

async function fetchOrganizations(
  clerkUser: any,
  setActive: any,
  activeOrgIdFromClerk: string | null | undefined
): Promise<{ orgList: ClientOrganization[], activeOrg: ClientOrganization | null }> {
  if (!clerkUser) {
    throw new Error("User not loaded");
  }

  const orgList: ClientOrganization[] = clerkUser.organizationMemberships.map(
    (membership: OrganizationMembershipResource) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      clientAuthOrganizationId: membership.organization.id,
      creatorClientUserId: clerkUser.id,
      profileImage: membership.organization.imageUrl || undefined,
      createdAt: membership.organization.createdAt || new Date(),
      updatedAt: membership.organization.updatedAt || new Date(),
    })
  ).sort((a: ClientOrganization, b: ClientOrganization) => {
    if (a.name === 'Personal') return -1;
    if (b.name === 'Personal') return 1;
    return a.name.localeCompare(b.name);
  });

  let activeOrg: ClientOrganization | null = null;
  if (activeOrgIdFromClerk) {
    activeOrg = orgList.find(org => org.clientAuthOrganizationId === activeOrgIdFromClerk) || null;
  } else {
    const personalOrg = orgList.find(org => org.name === "Personal");
    if (personalOrg?.clientAuthOrganizationId) {
      try {
        await setActive({ organization: personalOrg.clientAuthOrganizationId });
        activeOrg = personalOrg;
      } catch (err) {
        console.error("Failed to set personal org as active", err);
        // Do not throw, as this is a non-critical side-effect
      }
    }
  }

  return { orgList, activeOrg };
}

export function useOrganizationsQuery() {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const { orgId: activeOrgIdFromClerk, isLoaded: authIsLoaded } = useAuth();
  const { setActive, createOrganization: createClerkOrganization } = useClerk();
  const queryClient = useQueryClient();

  const queryKey = ['organizations', clerkUser?.id];

  const { data, isLoading, isPending, isError, error } = useQuery({
    queryKey,
    queryFn: () => fetchOrganizations(clerkUser, setActive, activeOrgIdFromClerk),
    enabled: !!clerkUser && clerkIsLoaded && authIsLoaded && !!setActive,
  });
  
  const createOrganizationMutation = useMutation({
    mutationFn: async (name: string) => {
      const newClerkOrg = await createClerkOrganization({ name });
      if (!newClerkOrg || !newClerkOrg.id) {
        throw new Error("Organization creation failed");
      }
      await setActive({ organization: newClerkOrg.id });
      return newClerkOrg;
    },
    onSuccess: () => {
      // Invalidate the organizations query to refetch the list
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const createPersonalOrganizationMutation = useMutation({
    mutationFn: async () => {
      if (!clerkUser) throw new Error("User not available");

      const personalOrgs = data?.orgList.filter(org => org.name.startsWith("Personal")) ?? [];
      let newOrgName = "Personal";
      if (personalOrgs.length > 0) {
        const personalOrgNumbers = personalOrgs
          .map(org => {
            const match = org.name.match(/^Personal (\d+)$/);
            return match ? parseInt(match[1], 10) : (org.name === "Personal" ? 1 : 0);
          })
          .filter(num => num > 0);
        const maxNumber = personalOrgNumbers.length > 0 ? Math.max(...personalOrgNumbers) : 0;
        newOrgName = `Personal ${maxNumber + 1}`;
      }

      const newClerkOrg = await createClerkOrganization({ name: newOrgName });
      if (!newClerkOrg || !newClerkOrg.id) {
        throw new Error("Personal organization creation failed");
      }
      await setActive({ organization: newClerkOrg.id });
      await clerkUser.reload(); // Reload user to get new memberships
      return newClerkOrg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const switchOrganizationMutation = useMutation({
    mutationFn: async (organizationId: string) => {
      if (!organizationId) {
        throw new Error("No organization ID provided");
      }
      await setActive({ organization: organizationId });
    },
    onSuccess: () => {
       // Clerk's hooks will update the activeOrgId, triggering a re-render.
       // We can also optimistically update the cache here if needed, or simply refetch.
       queryClient.invalidateQueries({ queryKey });
    }
  });
  
  return {
    // Data from query
    organizations: data?.orgList ?? [],
    currentOrganization: data?.activeOrg ?? null,
    isLoadingOrganizations: isLoading,
    isPendingOrganizations: isPending,
    isOrganizationsReady: !isLoading && !isError,
    organizationError: error?.message ?? null,
    
    // Mutations
    createOrganization: createOrganizationMutation.mutateAsync,
    isCreatingOrganization: createOrganizationMutation.isPending,
    createPersonalOrganization: createPersonalOrganizationMutation.mutateAsync,
    isCreatingPersonalOrganization: createPersonalOrganizationMutation.isPending,

    switchOrganization: switchOrganizationMutation.mutateAsync,
    isSwitchingOrganization: switchOrganizationMutation.isPending,

    // Raw Clerk state
    activeOrgId: activeOrgIdFromClerk,
  };
} 