'use client';

import { useUserContext } from '@/components/dashboard/context/UserProvider';
import SidebarComponent from '@/components/dashboard/left-panel/Sidebar'; 
import MiddlePanel from '@/components/dashboard/middle-panel/MiddlePanel'; 
import { Skeleton } from '@/components/ui/skeleton';
import RightPanel from '@/components/dashboard/right-panel/RightPanel';

/**
 * Main Dashboard Page
 * Renders the three-panel dashboard layout.
 */
export default function DashboardPage() {
  return <DashboardLayout />;
}

// Separate component to access the composed contexts
function DashboardLayout() {
  const { isClerkLoading } = useUserContext();

  if (isClerkLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gray-950">
          <Skeleton className="h-16 w-16 rounded-full bg-gray-700" /> 
          <p className="ml-4 text-lg text-gray-300">Loading User...</p>
        </div>
      );
  }

  // Render the layout once Clerk is loaded. Middleware ensures user is authenticated.
  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-50">
      <SidebarComponent className="w-64 flex-shrink-0" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MiddlePanel />
      </div>
      <div className="w-96 flex-shrink-0 border-l border-border overflow-y-auto">
        <RightPanel />
      </div>
    </div>
  );
} 