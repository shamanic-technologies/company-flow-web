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

/**
 * Main Dashboard Page
 * Wraps the dashboard content with the DashboardProvider and sets up the 
 * three-panel layout (Left, Middle, Right) using existing components.
 */
export default function DashboardPage() {
  // This outer component mainly sets up the Provider.
  // We can add a basic loading/redirect check here before the provider mounts.
  const router = useRouter();
  // Minimal check: Attempt to get token. If absent after a brief moment, redirect.
  // A more robust check happens in the useAuth hook within the provider.
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    if (!token) {
        // Delay redirect slightly to allow context/hook to potentially handle it
        // Or redirect immediately if preferred
        console.warn("DashboardPage: No token found on initial check, potential redirect soon.");
        // Optional: router.push('/'); 
    }
  }, [router]);

  return (
    <DashboardProvider>
      <DashboardLayout /> 
    </DashboardProvider>
  );
}

// Separate component to access the context provided by DashboardProvider
function DashboardLayout() {
  // Destructure only what's needed for the LAYOUT component itself.
  // Most data fetching/selection logic is now handled by hooks/provider.
  const { 
    user, // Needed for potential checks or display
    isLoadingUser, // Needed for loading state
    isLoadingAgents, // Overall loading indicator can use this
    isLoadingConversations, // Could combine for initial load skeleton
    isLoadingWebhooks, // Could combine for initial load skeleton
    // No need for agents, selectedAgentId, conversations etc. directly here
    // unless the layout *itself* changes based on them.
    // We also don't need the action functions (selectAgent, handleCreate, etc.) here.
    // Those are used by the components *inside* the layout panels (Sidebar, MiddlePanel, RightPanel).
  } = useDashboard();

  const router = useRouter(); // Keep router if needed for redirects inside layout

  // Redirect check specifically within the layout AFTER context is available
  useEffect(() => {
    if (!isLoadingUser && !user) {
      console.log("DashboardLayout: Context loaded, no user found, redirecting.");
      router.push('/');
    }
  }, [user, isLoadingUser, router]);

  // --- Removed all old useEffects for fetching/selecting agents/conversations --- 
  // This logic is now handled within the custom hooks (useAgents, useConversations) 
  // triggered by changes in authToken and selectedAgentId.

  // Loading state for the entire dashboard shell before context is ready
  // or while essential initial data (user, potentially agents) is loading.
  const isInitialLoading = isLoadingUser || isLoadingAgents; // Combine loading states

  if (isInitialLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          {/* Basic full-page skeleton or spinner */}
          <Skeleton className="h-16 w-16 rounded-full" /> 
          <p className="ml-4 text-lg">Loading Dashboard...</p>
        </div>
      );
  }

  // Render the layout once essential data is ready
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden"> {/* Use h-screen and overflow-hidden */}
      {/* Left Panel */}
      <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto"> {/* Use border-border */}
        <Sidebar />
      </div>

      {/* Middle Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <MiddlePanel />
      </div>

      {/* Right Panel */}
      <div className="w-96 flex-shrink-0 border-l border-border overflow-y-auto"> {/* Example width, use border-border */}
        <RightPanel />
      </div>
    </div>
  );
} 