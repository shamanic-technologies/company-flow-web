'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlatformUser, ServiceResponse } from '@agent-base/types';

/**
 * @description Hook to manage user authentication state, token, and related actions.
 * @returns An object containing user data, auth token, loading/error states, and auth functions.
 */
export function useAuth() {
  const [user, setUser] = useState<PlatformUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial user fetch
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string>('');
  const router = useRouter();

  // --- Effect to load token on mount ---
  useEffect(() => {
    console.log("useAuth: Attempting to load token from local storage.");
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    if (!token) {
      console.warn("useAuth: No auth token found in local storage on initial load.");
      // Redirect immediately if no token is found during initial check
      // Except if we are already on the home page to avoid loops
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        router.push('/');
      }
      setIsLoading(false); // Stop loading if no token
    } else {
      console.log("useAuth: Auth token found.");
      setAuthToken(token); // Trigger user data fetch via the other effect
    }
  }, [router]);

  // --- Logout Handler ---
  const handleLogout = useCallback(() => {
    console.log('useAuth: Logging out...');
    localStorage.removeItem('auth-token');
    setUser(null);
    setAuthToken('');
    setError(null);
    // Let the context provider reset other states
    router.push('/'); // Redirect to home page after logout
  }, [router]);

  // --- Function to fetch user data ---
  const fetchUserData = useCallback(async () => {
    if (!authToken) {
      console.warn('⚠️ useAuth - fetchUserData called without auth token!');
      // If fetchUserData is called without a token (e.g., race condition),
      // ensure loading is false and potentially trigger logout/redirect
      setIsLoading(false);
      // Avoid redirect loop if already on home
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        // handleLogout(); // Optionally trigger full logout
      }
      return;
    }

    console.log('👤 useAuth - Fetching user data...');
    setIsLoading(true); // Set loading true when fetch starts
    setError(null);

    try {
      const userFetch = await fetch('/api/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      console.log('📊 useAuth - User API response status:', userFetch.status);

      if (userFetch.status === 401) {
        console.error('🚫 useAuth - Unauthorized fetching user, logging out.');
        handleLogout(); // Use logout handler
        return;
      }

      if (!userFetch.ok) {
        let errorDetail = `Status: ${userFetch.status}`;
        try {
          const errorData = await userFetch.json();
          errorDetail = errorData.error || errorDetail;
        } catch (e) { /* ignore parsing error */ }
        throw new Error(`API error fetching user: ${errorDetail}`);
      }

      const userResponse: ServiceResponse<PlatformUser> = await userFetch.json();

      if (userResponse.success && userResponse.data) {
        console.log('✅ useAuth - User data retrieved successfully.');
        setUser(userResponse.data);
      } else {
        throw new Error(userResponse.error || 'Invalid data format from user API');
      }
    } catch (error: any) {
      console.error('❌ useAuth - Error fetching user data:', error);
      setError(error.message || 'Failed to fetch user data.');
      setUser(null);
    } finally {
      setIsLoading(false); // Ensure loading is false after fetch completes or fails
    }
  }, [authToken, handleLogout]);

  // --- Effect to fetch user data when token becomes available ---
  useEffect(() => {
    if (authToken) {
      console.log("useAuth: Auth token available, fetching user data...");
      fetchUserData();
    } else {
        // Handled by initial token check or logout
        console.log("useAuth: No auth token, skipping user data fetch.");
        // If token becomes null/empty after being set (e.g. logout), ensure loading is false
        setIsLoading(false);
        setUser(null); // Clear user data on logout
    }
  }, [authToken, fetchUserData]);

  // --- Utility Functions ---
  const getUserInitials = useCallback(() => {
    if (user?.displayName) {
      const names = user.displayName.split(' ');
      if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
      } else if (names.length === 1 && names[0].length > 0) {
        return names[0][0].toUpperCase();
      }
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return '?'; // Default fallback
  }, [user]);

  return {
    user,
    setUser, // Keep setter if direct manipulation is needed (rare)
    isLoadingUser: isLoading, // Rename for clarity
    authError: error, // Rename for clarity
    setAuthError: setError, // Rename for clarity
    authToken,
    fetchUserData,
    getUserInitials,
    handleLogout,
  };
}
