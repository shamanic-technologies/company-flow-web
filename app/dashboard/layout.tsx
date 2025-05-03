'use client';

import { ReactNode } from 'react';
import { DashboardProvider } from '@/components/dashboard/context/DashboardContext';
import Sidebar from '@/components/dashboard/Sidebar';

/**
 * Dashboard Layout
 * Provides common dashboard UI elements (header) and context
 * to all dashboard pages so they only need to implement their specific content
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  
  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-gray-950">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area - Adjusted for Sidebar */}
        <div className="flex flex-1 flex-col overflow-hidden ml-64">
          <main className="flex-1 overflow-y-auto flex flex-col bg-gray-950 text-gray-200 p-6">
            {children}
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
} 