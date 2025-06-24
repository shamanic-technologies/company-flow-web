'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dashboard, DashboardInfo, ServiceResponse } from '@agent-base/types';
import { useAuth } from '@clerk/nextjs';
import { useUserContext } from '@/components/dashboard/context/UserProvider';

export function useDashboards() {
    const { getToken, isLoaded } = useAuth();
    const { handleClerkLogout } = useUserContext();
    const [dashboards, setDashboards] = useState<DashboardInfo[]>([]);
    const [detailedDashboard, setDetailedDashboard] = useState<Dashboard | null>(null);
    const [isLoadingList, setIsLoadingList] = useState<boolean>(true);
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboards = useCallback(async (): Promise<void> => {
        try {
            const token = await getToken();
            const response = await fetch('/api/dashboard/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result: DashboardInfo[] = await response.json();
            setDashboards(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoadingList(false);
        }
    }, [getToken]);
    
    const fetchDashboardById = useCallback(async (dashboardId: string): Promise<void> => {
        setIsLoadingDetails(true);
        setError(null);
        setDetailedDashboard(null);
        try {
            const token = await getToken();
            const response = await fetch(`/api/dashboard/get?id=${dashboardId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result: Dashboard = await response.json();
            setDetailedDashboard(result);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoadingDetails(false);
        }
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
        isLoading: isLoadingList || isLoadingDetails,
        error, 
        refetchDashboards: fetchDashboards,
        fetchDashboardById
    };
} 