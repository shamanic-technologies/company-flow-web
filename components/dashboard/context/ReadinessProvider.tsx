'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useAgentContext } from './AgentProvider';
import { useConversationContext } from './ConversationProvider';
import { useApiToolsContext } from './ApiToolsProvider';
import { useWebhookContext } from './WebhookProvider';
import { useBillingContext } from './BillingProvider';

interface ReadinessContextType {
  isSystemReady: boolean;
  hasInitiallyLoaded: boolean;
}

export const ReadinessContext = createContext<ReadinessContextType>({
  isSystemReady: false,
  hasInitiallyLoaded: false,
});

export function ReadinessProvider({ children }: { children: ReactNode }) {
  const { isOrganizationsReady } = useOrganizations();
  const { isAgentsReady } = useAgentContext();
  const { isConversationReadyRightPanel } = useConversationContext();
  const { isApiToolsReady } = useApiToolsContext();
  const { isWebhooksReady } = useWebhookContext();
  const { isBillingReady } = useBillingContext();
  
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);

  // The dynamic readiness of the system, which can change.
  const isSystemReady = 
    isOrganizationsReady && 
    isAgentsReady && 
    isConversationReadyRightPanel &&
    isApiToolsReady &&
    isWebhooksReady &&
    isBillingReady;

  // This effect sets the initial load flag once and never changes it back.
  useEffect(() => {
    if (isSystemReady && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [isSystemReady, hasInitiallyLoaded]);

  return (
    <ReadinessContext.Provider value={{ isSystemReady, hasInitiallyLoaded }}>
      {children}
    </ReadinessContext.Provider>
  );
}

export function useReadinessContext() {
  const context = useContext(ReadinessContext);
  if (context === undefined) {
    throw new Error('useReadinessContext must be used within a ReadinessProvider');
  }
  return context;
} 