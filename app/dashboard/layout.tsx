'use client';

import { ReactNode } from 'react';
import { 
  Header, 
  DashboardProvider 
} from '@/components/dashboard';

/**
 * Dashboard Layout
 * Provides common dashboard UI elements (header) and context
 * to all dashboard pages so they only need to implement their specific content
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  
  return (
    <DashboardProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-950">
        {/* Header */}
        <Header>
        </Header>

        <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
          
          {/* Main Content - Takes full width now */}
          <main className="flex-1 overflow-hidden flex flex-col bg-gray-950 text-gray-200">
            <div className="p-4 flex flex-col flex-1 overflow-hidden">
              {children}
            </div>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
} 