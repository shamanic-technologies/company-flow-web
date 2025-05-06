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
    isLoadingAgents, // Example: Keep loading states relevant to UI structure
    isLoadingConversations,
    isLoadingWebhooks,
  } = useDashboard();

  // const router = useRouter(); // Remove if not used for other navigation

  // --- REMOVED useEffect that redirected based on context's user state --- 
  // Middleware handles unauthorized access. Clerk hooks handle client-side state.

  // Loading state based on Clerk's user loading state and potentially other initial data
  const isInitialLoading = !isLoaded || isLoadingAgents; // Wait for Clerk user + agents

  if (isInitialLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-full" /> 
          <p className="ml-4 text-lg">Loading Dashboard...</p>
        </div>
      );
  }

  // Check if signed in after loading (Clerk handles redirect if not via middleware)
  if (!isSignedIn) {
    // This case should technically not be reached if middleware is correct,
    // but as a fallback or during development, you might show a message or null.
    // Returning null is often sufficient as middleware handles the redirect.
    return null; 
  }

  // Render the layout once essential data is ready and user is signed in
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