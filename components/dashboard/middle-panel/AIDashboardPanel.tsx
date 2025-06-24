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
    isLoadingDetails, 
    error, 
    fetchDashboardById 
  } = useDashboardContext();

  useEffect(() => {
    if (selectedDashboard) {
      fetchDashboardById(selectedDashboard.id);
    }
  }, [selectedDashboard, fetchDashboardById]);
          
  const renderContent = () => {
    if (isLoadingDetails && !detailedDashboard) { // Show skeleton only on initial load
      return <Skeleton className="w-full h-full" />;
    }
    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-xs text-red-700 dark:text-red-300">Error: {error}</p>
        </div>
      );
    }
    if (detailedDashboard && detailedDashboard.id === selectedDashboard?.id) {
      return <DashboardRenderer layout={detailedDashboard.layout} />;
    }
    if (selectedDashboard) {
      return (
        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
          <p className="text-xs text-gray-600 dark:text-gray-400">Select a dashboard to view its preview.</p>
        </div>
      );
    }
    return (
      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg p-8 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">No dashboard selected.</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 text-foreground p-6 gap-6">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-50">
            {selectedDashboard?.name || 'AI Dashboard'}
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {isLoadingDetails ? 'Loading...' : detailedDashboard ? 'Live Preview' : 'Select a dashboard'}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
} 