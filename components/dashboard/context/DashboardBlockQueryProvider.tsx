'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

interface DashboardQueryContextType {
    fetchBlockData: (query: string) => void;
    blockData: Record<string, any>;
    loadingBlockData: Record<string, boolean>;
    errorBlockData: Record<string, string | null>;
}

const DashboardQueryContext = createContext<DashboardQueryContextType | undefined>(undefined);

export function DashboardBlockQueryProvider({ children }: { children: ReactNode }) {
    const { getToken } = useAuth();
    const [blockData, setBlockData] = useState<Record<string, any>>({});
    const [loadingBlockData, setLoadingBlockData] = useState<Record<string, boolean>>({});
    const [errorBlockData, setErrorBlockData] = useState<Record<string, string | null>>({});

    const fetchBlockData = useCallback(async (query: string) => {
        if (loadingBlockData[query] || blockData[query]) {
            return;
        }

        setLoadingBlockData(prev => ({ ...prev, [query]: true }));
        setErrorBlockData(prev => ({...prev, [query]: null}));
        try {
            const token = await getToken();
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
                throw new Error(errorBody || `Query failed: ${response.statusText}`);
            }

            const result = await response.json();
            setBlockData(prev => ({ ...prev, [query]: result }));
        } catch (err: any) {
            console.error(`Error fetching data for query "${query}":`, err);
            setErrorBlockData(prev => ({...prev, [query]: err.message}));
            setBlockData(prev => ({ ...prev, [query]: [] }));
        } finally {
            setLoadingBlockData(prev => ({ ...prev, [query]: false }));
        }
    }, [getToken, blockData, loadingBlockData]);

    const value = { fetchBlockData, blockData, loadingBlockData, errorBlockData };

    return (
        <DashboardQueryContext.Provider value={value}>
            {children}
        </DashboardQueryContext.Provider>
    );
}

export function useDashboardBlockQueryContext() {
    const context = useContext(DashboardQueryContext);
    if (context === undefined) {
        throw new Error('useDashboardQuery must be used within a DashboardQueryProvider');
    }
    return context;
} 