'use client';

import { useContext, useEffect } from 'react'; // Import hooks
import { DashboardProvider, useDashboard } from '@/components/dashboard/context/DashboardContext'; // Import useDashboard
// Import the actual components we intend to use
import Sidebar from '@/components/dashboard/left-panel/Sidebar'; 
import MiddlePanel from '@/components/dashboard/middle-panel/MiddlePanel'; 
// Removed ChatInterface import as it's likely used within MiddlePanel or RightPanel
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton for loading state
import RightPanel from '@/components/dashboard/right-panel/RightPanel'; // IMPORT THE NEW COMPONENT
// Removed AgentList, ChatArea, AgentDetail, ConversationList, WebhookDetail imports as they are likely used within the panels
import { useRouter } from 'next/navigation';
// Import Clerk hook if needed for user data
import { useUser } from '@clerk/nextjs';

/**
 * Main Dashboard Page
 * Wraps the dashboard content with the DashboardProvider and sets up the 
 * three-panel layout (Left, Middle, Right) using existing components.
 */
export default function DashboardPage() {
  // Removed the initial useEffect checking localStorage

  return (
    <DashboardProvider>
      <DashboardLayout /> 
    </DashboardProvider>
  );
}

// Separate component to access the context provided by DashboardProvider
function DashboardLayout() {
  // Use Clerk's hook directly for user state if context relies on it or pass it down
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  
  // Get necessary state from context if still needed, but avoid redundant user checks
  const { 
    isLoadingAgents, // We might still use this for more granular loading inside panels
    // isLoadingConversations,
    // isLoadingWebhooks,
  } = useDashboard();

  // const router = useRouter(); // Remove if not used for other navigation

  // --- REMOVED useEffect that redirected based on context's user state --- 

  // Loading state based ONLY on Clerk's user loading state now
  const isInitialLoading = !isLoaded; // Wait only for Clerk user state resolution

  if (isInitialLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-full" /> 
          <p className="ml-4 text-lg">Loading User...</p> // Changed message slightly
        </div>
      );
  }

  // REMOVED the check for !isSignedIn - Middleware handles unauthorized access.
  // if (!isSignedIn) {
  //   return null; 
  // }

  // Render the layout once Clerk is loaded. Middleware ensures user is authenticated.
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Left Panel */}
      <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto">
        {/* Pass user info if Sidebar needs it directly, or let Sidebar use useUser() */}
        <Sidebar />
      </div>

      {/* Middle Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MiddlePanel />
      </div>

      {/* Right Panel */}
      <div className="w-96 flex-shrink-0 border-l border-border overflow-y-auto">
        <RightPanel />
      </div>
    </div>
  );
} 