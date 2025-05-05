'use client';

import { DashboardProvider } from '@/components/dashboard/context/DashboardContext';
// Import the actual components we intend to use
import Sidebar from '@/components/dashboard/left-panel/Sidebar'; 
import MiddlePanel from '@/components/dashboard/middle-panel/MiddlePanel'; 
import ChatInterface from '@/components/dashboard/Chat/ChatInterface'; 

/**
 * Main Dashboard Page
 * Wraps the dashboard content with the DashboardProvider and sets up the 
 * three-panel layout (Left, Middle, Right) using existing components.
 */
export default function DashboardPage() {
  return (
    <DashboardProvider>
      <div className="flex h-full w-full">
        {/* Left Panel */}
        <div className="w-64 flex-shrink-0 border-r border-gray-700 overflow-y-auto">
          {/* Render the actual Sidebar component */}
          <Sidebar />
        </div>

        {/* Middle Panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Render the MiddlePanel component we created */}
          <MiddlePanel />
        </div>

        {/* Right Panel */}
        <div className="w-80 flex-shrink-0 border-l border-gray-700 overflow-y-auto bg-gray-900 flex flex-col">
          {/* Render the ChatInterface as the right panel */}
          {/* NOTE: ChatInterface might need specific props (agentId, conversationId, etc.) */}
          {/* depending on desired behavior and its implementation. For now, rendering without props. */}
          {/* It might rely on context, or it might error if props are expected. */}
           <div className="p-4 text-gray-400 border-b border-gray-700">
             {/* Example Header for Right Panel */} 
             Static Chat (Example)
           </div> 
           <div className="flex-1 overflow-hidden p-2">
             {/* <ChatInterface /> */}
             {/* Placeholder - ChatInterface likely needs props */}
             <div className="flex items-center justify-center h-full text-sm text-gray-500">
               Right Panel (ChatInterface placeholder)
             </div>
           </div>
        </div>
      </div>
    </DashboardProvider>
  );
} 