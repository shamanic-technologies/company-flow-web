'use client';

import { useState, useCallback, useEffect } from 'react';
import { Webhook, ServiceResponse } from '@agent-base/types';

interface UseWebhooksProps {
  handleLogout: () => void;
}

/**
 * @description Hook to manage webhook data fetching, selection, and state.
 * @param {UseWebhooksProps} props - The logout handler.
 * @returns An object containing user webhooks, selected webhook, loading/error states, and related functions.
 */
export function useWebhooks({ handleLogout }: UseWebhooksProps) {
  const [userWebhooks, setUserWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  // --- Fetch User Webhooks --- 
  const fetchUserWebhooks = useCallback(async () => {
    console.log("🎣 useWebhooks - Fetching user webhooks...");
    setIsLoadingWebhooks(true);
    setWebhookError(null);
    // setUserWebhooks([]); // Clear previous webhooks while fetching? Let's clear on success/fail.

    try {
      const response = await fetch('/api/webhooks/get-created', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json' // Explicitly set content type
        },
      });

      if (response.status === 401) {
        console.error('🚫 useWebhooks - Unauthorized fetching webhooks');
        throw new Error('Unauthorized fetching webhooks');
      }

      const webhookData: Webhook[] = await response.json();

      setUserWebhooks(webhookData);

    } catch (error: any) {
      console.error('❌ useWebhooks - Error fetching user webhooks:', error);
      setWebhookError(error.message || 'Failed to fetch webhooks.');
      setUserWebhooks([]); // Clear on exception
      setSelectedWebhook(null); // Clear selection on error
    } finally {
      setIsLoadingWebhooks(false);
    }
  }, []);

  // --- Effect to Fetch Webhooks When Token Available --- 
  useEffect(() => {
    fetchUserWebhooks();
  }, [fetchUserWebhooks]);

  // --- Select Webhook --- 
  // This hook only manages the state. The context provider will handle view changes.
  const selectWebhook = useCallback((webhook: Webhook | null) => {
    console.log(`useWebhooks: Setting selected webhook to: ${webhook?.id ?? 'None'}`);
    setSelectedWebhook(webhook);
  }, []);

  return {
    userWebhooks,
    selectedWebhook,
    selectWebhook,
    isLoadingWebhooks,
    webhookError,
    fetchUserWebhooks, // Expose for potential manual refresh
  };
} 