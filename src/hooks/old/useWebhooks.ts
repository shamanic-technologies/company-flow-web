/*
'use client';

import { useState, useCallback, useEffect } from 'react';
import { SearchWebhookResultItem } from '@agent-base/types';
import { useAuth } from '@clerk/nextjs';

interface UseWebhooksProps {
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

export interface UseWebhooksReturn {
  userWebhooks: SearchWebhookResultItem[];
  isLoadingWebhooks: boolean;
  webhookError: string | null;
  fetchUserWebhooks: () => Promise<void>;
  isWebhooksReady: boolean;
}

export function useWebhooks({ handleLogout, activeOrgId }: UseWebhooksProps): UseWebhooksReturn {
  const { getToken } = useAuth();
  const [userWebhooks, setUserWebhooks] = useState<SearchWebhookResultItem[]>([]);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(true);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  const isWebhooksReady = !isLoadingWebhooks;

  const fetchUserWebhooks = useCallback(async () => {
    if (!activeOrgId) {
      setIsLoadingWebhooks(false);
      return;
    }

    setIsLoadingWebhooks(true);
    setWebhookError(null);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      const response = await fetch(`/api/webhooks/search?organizationId=${activeOrgId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: '',
          topK: 100,
        }),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch webhooks');
      }
      
      const data = await response.json();
      setUserWebhooks(data.items || []);

    } catch (error: any) {
      setWebhookError(error.message);
      setUserWebhooks([]);
    } finally {
      setIsLoadingWebhooks(false);
    }
  }, [activeOrgId, getToken, handleLogout]);
  
  useEffect(() => {
    fetchUserWebhooks();
  }, [fetchUserWebhooks]);

  return {
    userWebhooks,
    isLoadingWebhooks,
    webhookError,
    fetchUserWebhooks,
    isWebhooksReady,
  };
}
*/ 