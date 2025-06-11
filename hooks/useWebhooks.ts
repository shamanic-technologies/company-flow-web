'use client';

import { useState, useCallback, useEffect } from 'react';
import { Webhook, ServiceResponse, SearchWebhookResultItem, SearchWebhookResult } from '@agent-base/types';
import { useAuth } from '@clerk/nextjs';

interface UseWebhooksProps {
  handleLogout: () => void;
  activeOrgId: string | null | undefined;
}

/**
 * @description Hook to manage webhook data fetching, selection, and state.
 * @param {UseWebhooksProps} props - The logout handler and activeOrgId.
 * @returns An object containing user webhooks, selected webhook, loading/error states, and related functions.
 */
export function useWebhooks({ handleLogout, activeOrgId }: UseWebhooksProps) {
  const { getToken } = useAuth();
  const [userWebhooks, setUserWebhooks] = useState<SearchWebhookResultItem[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<SearchWebhookResultItem | null>(null);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState<boolean>(false);
  const [webhookError, setWebhookError] = useState<string | null>(null);

  // --- Fetch User Webhooks --- 
  const fetchUserWebhooks = useCallback(async () => {
    if (!activeOrgId) {
      console.log("🎣 useWebhooks - Waiting for activeOrgId to fetch webhooks...");
      setUserWebhooks([]); // Clear if orgId is lost or not available
      setIsLoadingWebhooks(false); // Not truly loading if prerequisites aren't met
      // setWebhookError("Organization not selected. Cannot fetch webhooks."); // Optional: set an error
      return;
    }
    console.log(`🎣 useWebhooks - Polling for user webhooks for org: ${activeOrgId}`);
    setWebhookError(null); // Clear previous errors

    // setUserWebhooks([]); // Clear previous webhooks while fetching? Let's clear on success/fail.

    try {
      const token = await getToken();
      const response = await fetch('/api/webhook-tools/get-created', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', // Explicitly set content type
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        console.error('🚫 useWebhooks - Unauthorized fetching webhooks');
        // handleLogout(); // Consider if logout is appropriate here or if context should handle
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
  }, [activeOrgId, handleLogout, getToken]); // Added activeOrgId to dependencies

  // --- Effect to Poll for Webhooks Every 5 Seconds --- 
  useEffect(() => {
    if (!activeOrgId) {
      // If no active org, ensure state is clean and don't attempt to fetch/poll
      setUserWebhooks([]);
      setSelectedWebhook(null);
      setIsLoadingWebhooks(false);
      setWebhookError(null); // Or set a specific error like "No organization selected"
      return; // Do not proceed to fetch or set up interval
    }
    setIsLoadingWebhooks(true); // Set loading true only when proceeding with fetch

    // Fetch immediately on mount if activeOrgId is present
    fetchUserWebhooks(); 

    // Then set up the interval for polling
    const intervalId = setInterval(() => {
      fetchUserWebhooks();
    }, 5000); // 5000 milliseconds = 5 seconds

    // Cleanup function to clear the interval when the component unmounts
    // or if the dependencies of useEffect change (e.g., activeOrgId)
    return () => {
      clearInterval(intervalId);
      console.log("🛑 useWebhooks - Stopped polling for webhooks.");
    };
  }, [activeOrgId, fetchUserWebhooks]); // Added activeOrgId to dependencies

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