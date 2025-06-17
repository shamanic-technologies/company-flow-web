'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { usePlanInfo } from '@/hooks/usePlanInfo';
import { useCredits } from '@/hooks/useCredits';
import { useOrganizationContext } from './OrganizationProvider';
import { PlanInfo, CreditBalance } from '@/types/credit';

interface BillingContextType {
  planInfo: PlanInfo | null;
  isLoadingPlanInfo: boolean;
  planInfoError: string | null;
  isValidating: boolean;
  isConsuming: boolean;
  creditBalance: CreditBalance | null;
  error: string | null;
  validateCredits: (estimatedCredits?: number) => Promise<boolean>;
  consumeCredits: (totalAmountInUSDCents: number, conversationId: string) => Promise<boolean>;
  clearError: () => void;
  fetchPlanInfo: () => Promise<void>;
  isBillingReady: boolean;
}

export const BillingContext = createContext<BillingContextType>({
  planInfo: null,
  isLoadingPlanInfo: true,
  planInfoError: null,
  isValidating: false,
  isConsuming: false,
  creditBalance: null,
  error: null,
  validateCredits: async () => false,
  consumeCredits: async () => false,
  clearError: () => {},
  fetchPlanInfo: async () => {},
  isBillingReady: false,
});

export function BillingProvider({ children }: { children: ReactNode }) {
  const { activeOrgId } = useOrganizationContext();
  
  const {
    planInfo,
    isLoading: isLoadingPlanInfo,
    error: planInfoError,
    fetch: fetchPlanInfo
  } = usePlanInfo({ activeOrgId });

  const {
    isValidating,
    isConsuming,
    creditBalance,
    error,
    validateCredits,
    consumeCredits,
    clearError,
  } = useCredits({ activeOrgId });

  const isBillingReady = !isLoadingPlanInfo && !isValidating && !isConsuming;

  const contextValue = useMemo(() => ({
    planInfo,
    isLoadingPlanInfo,
    planInfoError,
    fetchPlanInfo,
    isValidating,
    isConsuming,
    creditBalance,
    error,
    validateCredits,
    consumeCredits,
    clearError,
    isBillingReady,
  }), [
    planInfo,
    isLoadingPlanInfo,
    planInfoError,
    fetchPlanInfo,
    isValidating,
    isConsuming,
    creditBalance,
    error,
    validateCredits,
    consumeCredits,
    clearError,
    isBillingReady,
  ]);

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