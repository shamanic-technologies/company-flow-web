'use client';

import { ReactNode, useState } from 'react';
import { 
  Header, 
  Sidebar,
  DashboardProvider 
} from '@/components/dashboard';
import { MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Dashboard Layout
 * Provides common dashboard UI elements (header, sidebar) and context
 * to all dashboard pages so they only need to implement their specific content
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  return (
    <DashboardProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-gray-950">
        {/* Header */}
        <Header>
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden mr-2 text-gray-300" 
            onClick={() => setShowMobileSidebar(true)}
          >
            <MenuIcon size={20} />
          </Button>
        </Header>

        <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
          {/* Sidebar - hidden on mobile unless toggled */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          {/* Mobile sidebar */}
          {showMobileSidebar && (
            <div className="md:hidden">
              <div 
                className="fixed inset-0 bg-black/50 z-30"
                onClick={() => setShowMobileSidebar(false)}
              />
              <Sidebar 
                isMobile={true} 
                onMobileClose={() => setShowMobileSidebar(false)} 
              />
            </div>
          )}
          
          {/* Main Content - Pages will render their content here */}
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