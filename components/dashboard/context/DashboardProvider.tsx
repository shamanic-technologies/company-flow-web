'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useDashboards } from '@/hooks/useDashboards';
import { Dashboard, DashboardInfo } from '@agent-base/types';

interface DashboardContextType {
    dashboards: DashboardInfo[];
    detailedDashboard: Dashboard | null;
    isLoading: boolean;
    error: string | null;
    refetchDashboards: () => Promise<void>;
    fetchDashboardById: (id: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType>({
    dashboards: [],
    detailedDashboard: null,
    isLoading: true,
    error: null,
    refetchDashboards: async () => { console.warn('refetchDashboards called outside of DashboardProvider') },
    fetchDashboardById: async (id: string) => { console.warn('fetchDashboardById called outside of DashboardProvider') },
});

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { 
        dashboards, 
        detailedDashboard, 
        isLoading, 
        error, 
        refetchDashboards, 
        fetchDashboardById 
    } = useDashboards();

    const contextValue = useMemo(() => ({
        dashboards,
        detailedDashboard,
        isLoading,
        error,
        refetchDashboards,
        fetchDashboardById,
    }), [dashboards, detailedDashboard, isLoading, error, refetchDashboards, fetchDashboardById]);

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboardContext() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboardContext must be used within a DashboardProvider');
    }
    return context;
} 