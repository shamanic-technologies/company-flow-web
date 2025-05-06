'use client';

import { useState, useCallback, useEffect } from 'react';
import { Webhook, ServiceResponse } from '@agent-base/types';

interface UseWebhooksProps {
  authToken: string;
  handleLogout: () => void;
}

/**
 * @description Hook to manage webhook data fetching, selection, and state.
 * @param {UseWebhooksProps} props - The authentication token and logout handler.
 * @returns An object containing user webhooks, selected webhook, loading/error states, and related functions.
 */
export function useWebhooks({ authToken, handleLogout }: UseWebhooksProps) {
  const [userWebhooks, setUserWebhooks] = useState<Webhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<Webhook | null>(null);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  // --- Fetch User Webhooks --- 
  const fetchUserWebhooks = useCallback(async () => {
    if (!authToken) {
      console.warn("useWebhooks: Auth token not available for fetching webhooks.");
      setUserWebhooks([]);
      setIsLoadingWebhooks(false);
      return;
    }

    console.log("🎣 useWebhooks - Fetching user webhooks...");
    setIsLoadingWebhooks(true);
    setWebhookError(null);
    // setUserWebhooks([]); // Clear previous webhooks while fetching? Let's clear on success/fail.

    try {
      const response = await fetch('/api/webhooks/get-created', {
        method: 'POST', // Keep POST as per original context
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json' // Explicitly set content type
        },
        // body: JSON.stringify({}) // Assuming no body needed, uncomment if required
      });

      console.log('📊 useWebhooks - User Webhooks API response status:', response.status);

      if (response.status === 401) {
        console.error('🚫 useWebhooks - Unauthorized fetching webhooks, logging out.');
        handleLogout();
        return;
      }

      const data: ServiceResponse<Webhook[]> = await response.json();

      if (!response.ok) {
        let errorDetail = `Status: ${response.status}`;
        if (data && data.error) {
          errorDetail = data.error;
        }
        throw new Error(`API error fetching webhooks: ${errorDetail}`);
      }

      if (data.success && data.data) {
        console.log(`✅ useWebhooks - ${data.data.length} User webhooks retrieved successfully.`);
        setUserWebhooks(data.data);
      } else {
        setUserWebhooks([]); // Clear on API error
        throw new Error(data.error || 'Invalid data format from webhooks API');
      }
    } catch (error: any) {
      console.error('❌ useWebhooks - Error fetching user webhooks:', error);
      setWebhookError(error.message || 'Failed to fetch webhooks.');
      setUserWebhooks([]); // Clear on exception
      setSelectedWebhook(null); // Clear selection on error
    } finally {
      setIsLoadingWebhooks(false);
    }
  }, [authToken, handleLogout]);

  // --- Effect to Fetch Webhooks When Token Available --- 
  useEffect(() => {
    if (authToken) {
      fetchUserWebhooks();
    } else {
      // Clear state if token disappears (logout)
      setUserWebhooks([]);
      setSelectedWebhook(null);
      setIsLoadingWebhooks(false);
      setWebhookError(null);
    }
  }, [authToken, fetchUserWebhooks]);

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