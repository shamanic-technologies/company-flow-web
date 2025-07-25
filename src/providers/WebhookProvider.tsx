'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useWebhooksQuery } from '@/hooks/useWebhooksQuery';
import { Webhook } from '@agent-base/types';

interface WebhookContextType {
  webhooks: Webhook[];
  isLoadingWebhooks: boolean;
  webhookError: string | null;
  isWebhooksReady: boolean;
}

export const WebhookContext = createContext<WebhookContextType | undefined>(undefined);

export function WebhookProvider({ children }: { children: ReactNode }) {
  const { 
    webhooks, 
    isLoadingWebhooks, 
    webhooksError 
  } = useWebhooksQuery();

  const contextValue = useMemo(() => ({
    webhooks,
    isLoadingWebhooks,
    webhookError: webhooksError?.message ?? null,
    isWebhooksReady: !isLoadingWebhooks && !webhooksError,
  }), [webhooks, isLoadingWebhooks, webhooksError]);

  return (
    <WebhookContext.Provider value={contextValue}>
      {children}
    </WebhookContext.Provider>
  );
}

export function useWebhookContext() {
  const context = useContext(WebhookContext);
  if (!context) {
    throw new Error('useWebhookContext must be used within a WebhookProvider');
  }
  return context;
} 