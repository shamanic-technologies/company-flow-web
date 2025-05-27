'use client';

import { useState, useCallback, useEffect } from 'react';
import { Webhook, ServiceResponse, SearchWebhookResultItem, SearchWebhookResult } from '@agent-base/types';

interface UseWebhooksProps {
  handleLogout: () => void;
}

/**
 * @description Hook to manage webhook data fetching, selection, and state.
 * @param {UseWebhooksProps} props - The logout handler.
 * @returns An object containing user webhooks, selected webhook, loading/error states, and related functions.
 */
export function useWebhooks({ handleLogout }: UseWebhooksProps) {
  const [userWebhooks, setUserWebhooks] = useState<SearchWebhookResultItem[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<SearchWebhookResultItem | null>(null);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  // --- Fetch User Webhooks --- 
  const fetchUserWebhooks = useCallback(async () => {
    console.log("🎣 useWebhooks - Polling for user webhooks...");

    // setUserWebhooks([]); // Clear previous webhooks while fetching? Let's clear on success/fail.

    try {
      const response = await fetch('/api/webhook-tools/get-created', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json' // Explicitly set content type
        },
      });

      if (response.status === 401) {
        console.error('🚫 useWebhooks - Unauthorized fetching webhooks');
        throw new Error('Unauthorized fetching webhooks');
      }

      const webhookData: SearchWebhookResult = await response.json();

      if (webhookData && Array.isArray(webhookData.items)) {
        setUserWebhooks(webhookData.items);
      } else {
        console.error('❌ useWebhooks - Invalid data structure received:', webhookData);
        setUserWebhooks([]);
        throw new Error('Invalid data structure received for webhooks.');
      }

    } catch (error: any) {
      console.error('❌ useWebhooks - Error fetching user webhooks:', error);
      setWebhookError(error.message || 'Failed to fetch webhooks.');
      setUserWebhooks([]); // Clear on exception
      setSelectedWebhook(null); // Clear selection on error
    } finally {
      setIsLoadingWebhooks(false);
    }
  }, []);

  // --- Effect to Poll for Webhooks Every 5 Seconds --- 
  useEffect(() => {

    // Fetch immediately on mount
    setIsLoadingWebhooks(true);
    setWebhookError(null);
    fetchUserWebhooks(); 

    // Then set up the interval for polling
    const intervalId = setInterval(() => {
      fetchUserWebhooks();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup function to clear the interval when the component unmounts
    // or if the dependencies of useEffect change (though fetchUserWebhooks is stable here)
    return () => {
      clearInterval(intervalId);
      console.log("🛑 useWebhooks - Stopped polling for webhooks.");
    };
  }, [fetchUserWebhooks]); // fetchUserWebhooks is a dependency

  // --- Select Webhook --- 
  // This hook only manages the state. The context provider will handle view changes.
  const selectWebhook = useCallback((webhook: SearchWebhookResultItem | null) => {
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