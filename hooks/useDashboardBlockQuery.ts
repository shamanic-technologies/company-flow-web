'use client';

import { useEffect } from 'react';
import { DashboardBlockConfig } from '@agent-base/types';
import { useDashboardBlockQueryContext } from '@/components/dashboard/context/DashboardBlockQueryProvider';

export function useDashboardBlockQuery(config: DashboardBlockConfig) {
    const { fetchBlockData, blockData, loadingBlockData, errorBlockData } = useDashboardBlockQueryContext();

    const query = ('source' in config && config.source?.query) ? config.source.query as string : null;
    const source = 'source' in config ? config.source : undefined;
    const staticData = source && 'data' in source ? source.data : null;

    useEffect(() => {
        if (query) {
            fetchBlockData(query);
        }
    }, [query, fetchBlockData]);

    if (staticData) {
        return { data: staticData, loading: false, error: null };
    }
    
    if (query) {
        return { 
            data: blockData[query], 
            loading: loadingBlockData[query] ?? false, 
            error: errorBlockData[query] 
        };
    }

    return { data: null, loading: false, error: null };
} 