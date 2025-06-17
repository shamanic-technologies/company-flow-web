'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useWebhooks } from '@/hooks/useWebhooks';
import { useOrganizationContext } from './OrganizationProvider';
import { useUserContext } from './UserProvider';
import { SearchWebhookResultItem } from '@agent-base/types';

interface WebhookContextType {
  userWebhooks: SearchWebhookResultItem[];
  isLoadingWebhooks: boolean;
  webhookError: string | null;
  fetchUserWebhooks: () => Promise<void>;
}

export const WebhookContext = createContext<WebhookContextType>({
  userWebhooks: [],
  isLoadingWebhooks: false,
  webhookError: null,
  fetchUserWebhooks: async () => {},
});

export function WebhookProvider({ children }: { children: ReactNode }) {
  const { activeOrgId } = useOrganizationContext();
  const { handleClerkLogout } = useUserContext();

  const { 
    userWebhooks, 
    isLoadingWebhooks, 
    webhookError, 
    fetchUserWebhooks 
  } = useWebhooks({ handleLogout: handleClerkLogout, activeOrgId });

  const contextValue = useMemo(() => ({
    userWebhooks, 
    isLoadingWebhooks, 
    webhookError, 
    fetchUserWebhooks 
  }), [
    userWebhooks, 
    isLoadingWebhooks, 
    webhookError, 
    fetchUserWebhooks 
  ]);

  return (
    <WebhookContext.Provider value={contextValue}>
      {children}
    </WebhookContext.Provider>
  );
}

export function useWebhookContext() {
  const context = useContext(WebhookContext);
  if (context === undefined) {
    throw new Error('useWebhookContext must be used within a WebhookProvider');
  }
  return context;
} 