'use client';

import { ReactNode, useContext } from 'react';
import { DashboardContext, DashboardProvider } from '@/components/dashboard/context/DashboardContext';
// import Sidebar from '@/components/dashboard/Sidebar'; // Comment out alias import
import Sidebar from '../../components/dashboard/Sidebar'; // Use relative path import
import ChatInterface from '@/components/dashboard/Chat/ChatInterface';

/**
 * Dashboard Layout
 * Provides common dashboard UI elements (sidebar, static chat) and context
 * to all dashboard pages. Pages only need to implement their specific content
 * for the middle column.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  
  // Inner component to access context after provider
  const LayoutContent = () => {
    const { authToken, user } = useContext(DashboardContext); // Get context values

    // Basic check for user initials - use 'U' if not available
    // TODO: Improve handling if user/initials might be missing during load
    const userInitials = user?.email?.substring(0, 1).toUpperCase() || 'U';

    return (
      <div className="flex h-screen overflow-hidden bg-gray-950">
        {/* Sidebar - Fixed Width */}
        <Sidebar />

        {/* Main Content Area (Middle Column) - Use flex-grow, flex-shrink, flex-basis-0 */}
        <div className="flex flex-col flex-grow flex-shrink flex-basis-0 overflow-hidden min-w-0">
          <main className="flex-1 overflow-y-auto flex flex-col bg-gray-950 text-gray-200 p-6">
            {children}
          </main>
        </div>

        {/* Static Chat Column (Right) - Fixed Width */}
        <div className="w-96 flex flex-col h-screen overflow-hidden border-l border-gray-700 bg-gray-900">
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {/* 
              Pass props from context. 
              Using null for agentId and conversationId initially.
              Needs a valid authToken to function.
            */}
            {authToken ? (
              <ChatInterface
                authToken={authToken} // Pass token from context
                userInitials={userInitials} // Pass initials from context
                agentId={null} // TODO: Define how to get the static agent ID
                conversationId={null} // TODO: Define how to get/create the conversation ID
              />
            ) : (
              // Optional: Show a loading or placeholder state while auth token is missing
              <div className="text-gray-400 text-center mt-4">Loading chat...</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render the Provider and the inner component that uses the context
  return (
    <DashboardProvider>
      <LayoutContent />
    </DashboardProvider>
  );
} 