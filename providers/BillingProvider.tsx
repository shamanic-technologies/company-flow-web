'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useOrganizationsQuery } from '@/hooks/useOrganizationsQuery';
import { CreditBalance, PlanInfo, PlanDetails, PlansList } from '@/types/credit';
import { useAuth } from '@clerk/nextjs';

interface BillingContextType {
  planInfo: PlanInfo | null;
  creditBalance: CreditBalance | null;
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  plans: PlanDetails[];
  refetchBillingInfo: () => void;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export function BillingProvider({ children }: { children: ReactNode }) {
  const { getToken } = useAuth();
  const { activeOrgId, isOrganizationsReady } = useOrganizationsQuery();

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingInfo = useCallback(async () => {
    if (!activeOrgId) return;

    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('/api/credits/plan-info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch billing info');
      }

      const data = await response.json();
      setPlanInfo(data); // The response is the PlanInfo object itself
      // We need to derive CreditBalance from PlanInfo
      const derivedCreditBalance: CreditBalance = {
        balance: data.credits.balance,
        hasCredits: data.credits.balance > 0,
        // These fields might not be directly available, adjust as needed
        stripeCustomerId: data.stripeCustomerId || null, 
      };
      setCreditBalance(derivedCreditBalance);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeOrgId, getToken]);

  useEffect(() => {
    if (isOrganizationsReady && activeOrgId) {
      fetchBillingInfo();
    }
  }, [isOrganizationsReady, activeOrgId, fetchBillingInfo]);

  const contextValue = useMemo(
    () => ({
      planInfo,
      creditBalance,
      isLoading,
      error,
      isReady: !isLoading && !error,
      plans: PlansList, // Use the imported PlansList
      refetchBillingInfo: fetchBillingInfo,
    }),
    [planInfo, creditBalance, isLoading, error, fetchBillingInfo]
  );

  return (
    <BillingContext.Provider value={contextValue}>
      {children}
    </BillingContext.Provider>
  );
}

export function useBillingContext() {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBillingContext must be used within a BillingProvider');
  }
  return context;
} 