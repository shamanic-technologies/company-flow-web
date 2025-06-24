'use client';

import React, { useEffect } from 'react';
import { DashboardInfo } from '@agent-base/types';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardRenderer } from './DashboardRenderer';
import { useDashboardContext } from '../context/DashboardProvider';

interface AIDashboardPanelProps {
  selectedDashboard: DashboardInfo | null;
}

export default function AIDashboardPanel({ selectedDashboard }: AIDashboardPanelProps) {
  const { 
    detailedDashboard, 
    isLoading, 
    error, 
    fetchDashboardById 
  } = useDashboardContext();

  useEffect(() => {
    if (selectedDashboard) {
      fetchDashboardById(selectedDashboard.id);
    }
  }, [selectedDashboard, fetchDashboardById]);
          
  const renderContent = () => {
    if (isLoading && !detailedDashboard) { // Show skeleton only on initial load
      return <Skeleton className="w-full h-full" />;
    }
    if (error) {
      return <div className="text-destructive">Error: {error}</div>;
        }
    if (detailedDashboard && detailedDashboard.id === selectedDashboard?.id) {
      return <DashboardRenderer layout={detailedDashboard.layout} />;
    }
    if (selectedDashboard) {
        return <div>Select a dashboard to view its preview.</div>;
    }
    return <div>No dashboard selected.</div>;
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground p-4 gap-4">
      <div className="flex justify-between items-center border-b pb-2">
        <div>
          <h2 className="text-lg font-semibold">{selectedDashboard?.name || 'AI Dashboard'}</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : detailedDashboard ? 'Live Preview' : 'Select a dashboard'}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
} 