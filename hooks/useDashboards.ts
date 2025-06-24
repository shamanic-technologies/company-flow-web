'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Dashboard, DashboardInfo, ServiceResponse } from '@agent-base/types';
import { useAuth } from '@clerk/nextjs';
import { useUserContext } from '@/components/dashboard/context/UserProvider';

export function useDashboards() {
    const { getToken, isLoaded } = useAuth();
    const { handleClerkLogout } = useUserContext();
    const [dashboards, setDashboards] = useState<DashboardInfo[]>([]);
    const [detailedDashboard, setDetailedDashboard] = useState<Dashboard | null>(null);
    const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const detailedDashboardIdRef = useRef<string | null>(null);

    useEffect(() => {
        detailedDashboardIdRef.current = detailedDashboard?.id ?? null;
    }, [detailedDashboard]);

    const fetchDashboardById = useCallback(async (dashboardId: string): Promise<void> => {
        // setIsLoadingDetails(true);
        // Do not clear detailedDashboard here to avoid flickering during polling
        try {
            const token = await getToken();
            const response = await fetch(`/api/dashboard/get?id=${dashboardId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            const result: Dashboard = await response.json();
            setDetailedDashboard(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoadingDetails(false);
        }
    }, [getToken]);

    const fetchDashboards = useCallback(async (): Promise<void> => {
        try {
            const token = await getToken();
            const response = await fetch('/api/dashboard/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status} ${response.statusText}`);
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            const result: DashboardInfo[] = await response.json();
            setDashboards(result);

            // If a detailed dashboard is being viewed, refresh its data as well.
            if (detailedDashboardIdRef.current) {
                await fetchDashboardById(detailedDashboardIdRef.current);
            }
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoadingList(false);
        }
    }, [getToken, fetchDashboardById]);

    const fetchBlockData = useCallback(async (query: string): Promise<any> => {
        const token = await getToken();
        if (!token) {
            // This case should ideally be handled by Clerk's authentication state,
            // but as a safeguard, we prevent the API call.
            throw new Error("Authentication token not found. User might be logged out.");
        }
        const response = await fetch(`/api/dashboard/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Query failed with status ${response.status}:`, errorBody);
            throw new Error(`Failed to fetch block data. Status: ${response.status}`);
        }

        return await response.json();
    }, [getToken]);

    useEffect(() => {
        if (isLoaded) {
           setIsLoadingList(true);
           setError(null);
           fetchDashboards();
        }
    }, [isLoaded, fetchDashboards]);

    return { 
        dashboards, 
        detailedDashboard,
        isLoadingList,
        isLoadingDetails,
        error, 
        refetchDashboards: fetchDashboards,
        fetchDashboardById,
        fetchBlockData
    };
} 