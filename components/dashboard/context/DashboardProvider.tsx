'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useDashboards } from '@/hooks/useDashboards';
import { DashboardInfo, DashboardFileTree } from '@agent-base/types';

interface DashboardContextType {
    dashboards: DashboardInfo[];
    isLoadingDashboards: boolean;
    dashboardError: string | null;
    refetchDashboards: () => Promise<void>;
    getDashboardConfig: (dashboardId: string) => Promise<DashboardFileTree | null>;
}

const DashboardContext = createContext<DashboardContextType>({
    dashboards: [],
    isLoadingDashboards: true,
    dashboardError: null,
    refetchDashboards: async () => { console.warn('refetchDashboards called outside of DashboardProvider') },
    getDashboardConfig: async (dashboardId: string) => {
        console.warn('getDashboardConfig called outside of DashboardProvider');
        return null;
    },
});

export function DashboardProvider({ children }: { children: ReactNode }) {
    const { dashboards, isLoading, error, refetchDashboards, getDashboardConfig } = useDashboards();

    const contextValue = useMemo(() => ({
        dashboards,
        isLoadingDashboards: isLoading,
        dashboardError: error,
        refetchDashboards,
        getDashboardConfig,
    }), [dashboards, isLoading, error, refetchDashboards, getDashboardConfig]);

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