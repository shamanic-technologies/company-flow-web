'use client';

import React, { useState, useEffect } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { UserProvider } from '@/providers/UserProvider';
import { AgentProvider, useAgentContext } from '@/providers/AgentProvider';
import { ConversationProvider } from '@/providers/ConversationProvider';
import { ChatProvider } from '@/providers/ChatProvider';
import { ApiToolsProvider } from '@/providers/ApiToolsProvider';
import { WebhookProvider } from '@/providers/WebhookProvider';
import { BillingProvider } from '@/providers/BillingProvider';
import { ViewProvider, useViewContext } from '@/providers/ViewProvider';
import { SidebarProvider } from "@/components/ui/sidebar";
import { LandingPromptProvider, useLandingPromptContext } from '@/providers/LandingPromptProvider';

import SidebarComponent from '@/components/dashboard/sidebar/Sidebar';
import RightPanel from '@/components/dashboard/right-panel/ChatPanel';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AgentSettingsPanel from '@/components/dashboard/right-panel/AgentSettingsPanel';
import QueryProvider from '@/providers/QueryProvider';

function AppLayout({ children }: { children: React.ReactNode }) {
  const isFetching = useIsFetching();
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    // Once fetching is complete for the first time, we mark it as loaded.
    // This prevents the main loader from showing up for background refetches.
    if (isFetching === 0 && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [isFetching, hasLoadedOnce]);

  const { isLandingPromptProcessing } = useLandingPromptContext();
  const { isRightPanelOpen, setIsRightPanelOpen } = useViewContext();
  const { selectedAgentForSettings } = useAgentContext();

  if (!hasLoadedOnce || isLandingPromptProcessing) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Skeleton className="h-16 w-16 rounded-full bg-muted" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background text-foreground flex-col">
      <DashboardNavbar />
      <div className="flex flex-1 overflow-hidden">
        <SidebarComponent className="w-64 flex-shrink-0" />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
        <Sheet open={isRightPanelOpen} onOpenChange={setIsRightPanelOpen}>
          <SheetContent className="w-[400px] sm:w-[540px] p-0">
            {/* The SheetTitle is required for accessibility but is visually hidden to not affect the UI */}
            <SheetHeader>
              <SheetTitle className="sr-only">
                {selectedAgentForSettings
                  ? `Agent Settings - ${selectedAgentForSettings.firstName} ${selectedAgentForSettings.lastName}`
                  : "Chat Panel"}
              </SheetTitle>
            </SheetHeader>
            {selectedAgentForSettings ? (
              <AgentSettingsPanel agent={selectedAgentForSettings} />
            ) : (
              <RightPanel />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <BillingProvider>
          <ConversationProvider>
            <AgentProvider>
              <ApiToolsProvider>
                <WebhookProvider>
                  <ViewProvider>
                    <SidebarProvider>
                      <ChatProvider>
                        <LandingPromptProvider>
                          <AppLayout>{children}</AppLayout>
                        </LandingPromptProvider>
                      </ChatProvider>
                    </SidebarProvider>
                  </ViewProvider>
                </WebhookProvider>
              </ApiToolsProvider>
            </AgentProvider>
          </ConversationProvider>
        </BillingProvider>
      </UserProvider>
    </QueryProvider>
  );
} 