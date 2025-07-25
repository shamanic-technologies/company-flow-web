/*
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { CreditBalance, PlanInfo, PlanDetails } from '@/types/credit';

interface BillingInfo {
    planInfo: PlanInfo | null;
    creditBalance: CreditBalance | null;
    plans: PlanDetails[];
}

async function fetchBillingInfo(getToken: () => Promise<string | null>, organizationId: string): Promise<BillingInfo> {
    const token = await getToken();
    const response = await fetch(`/api/billing/info?organizationId=${organizationId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
        throw new Error('Failed to fetch billing info');
    }
    return response.json();
}

export function useBillingQuery(organizationId: string | null | undefined) {
    const { getToken } = useAuth();
    const queryKey = ['billingInfo', organizationId];

    const { data, isLoading, isError, error } = useQuery<BillingInfo>({
        queryKey,
        queryFn: () => fetchBillingInfo(getToken, organizationId!),
        enabled: !!organizationId,
    });

    return {
        planInfo: data?.planInfo ?? null,
        creditBalance: data?.creditBalance ?? null,
        plans: data?.plans ?? [],
        isLoadingBilling: isLoading,
        billingError: error?.message ?? null,
    };
}
*/ 