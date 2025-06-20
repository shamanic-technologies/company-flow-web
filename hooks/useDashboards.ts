'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dashboard, DashboardInfo, DashboardFileTree, ServiceResponse } from '@agent-base/types';
import { useAuth } from '@clerk/nextjs';
import { useUserContext } from '@/components/dashboard/context/UserProvider';

export function useDashboards() {
    const { getToken, isLoaded } = useAuth();
    const { handleClerkLogout } = useUserContext(); // Get logout handler
    const [dashboards, setDashboards] = useState<DashboardInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboards = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch('/api/dashboard/list', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                console.error('🚫 useDashboards - Unauthorized, logging out.');
                handleClerkLogout();
                return;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: DashboardInfo[] = await response.json();
            
            // Prevent re-renders if the data is identical
            setDashboards(prevDashboards => {
                const newDashboards = result || [];
                return JSON.stringify(prevDashboards) !== JSON.stringify(newDashboards)
                    ? newDashboards
                    : prevDashboards;
            });
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [getToken, handleClerkLogout]);

    const getDashboardConfig = useCallback(async (dashboardId: string): Promise<DashboardFileTree | null> => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await getToken();
            const response = await fetch(`/api/dashboard/get?id=${dashboardId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                console.error('🚫 useDashboards:getDashboardConfig - Unauthorized, logging out.');
                handleClerkLogout();
                return null;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: Dashboard = await response.json();
            
            return result.webContainerConfig;

        } catch (e: any) {
            setError(e.message);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [getToken, handleClerkLogout]);

    // We no longer need the useEffect here, as polling will be handled by useDashboardPolling
    // useEffect(() => {
    //     if (isLoaded) { // Only fetch when clerk is ready
    //        fetchDashboards();
    //     }
    // }, [isLoaded, fetchDashboards]);

    return { dashboards, isLoading, error, refetchDashboards: fetchDashboards, getDashboardConfig };
} 