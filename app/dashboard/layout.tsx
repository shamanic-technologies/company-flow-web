'use client';

import React from 'react';
import { UserProvider } from '@/providers/UserProvider';
import { OrganizationProvider } from '@/providers/OrganizationProvider';
import { AgentProvider, useAgentContext } from '@/providers/AgentProvider';
import { ConversationProvider } from '@/providers/ConversationProvider';
import { ChatProvider } from '@/providers/ChatProvider';
import { ApiToolsProvider } from '@/providers/ApiToolsProvider';
import { WebhookProvider } from '@/providers/WebhookProvider';
import { BillingProvider } from '@/providers/BillingProvider';
import { ViewProvider, useViewContext } from '@/providers/ViewProvider';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReadinessProvider, useReadinessContext } from '@/providers/ReadinessProvider';
import { LandingPromptProvider, useLandingPromptContext } from '@/providers/LandingPromptProvider';

import SidebarComponent from '@/components/dashboard/sidebar/Sidebar';
import RightPanel from '@/components/dashboard/right-panel/ChatPanel';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AgentSettingsPanel from '@/components/dashboard/right-panel/AgentSettingsPanel';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { hasInitiallyLoaded } = useReadinessContext();
  const { isLandingPromptProcessing } = useLandingPromptContext();
  const { isRightPanelOpen, setIsRightPanelOpen } = useViewContext();
  const { selectedAgentForPanel } = useAgentContext();

  if (!hasInitiallyLoaded || isLandingPromptProcessing) {
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
                {selectedAgentForPanel
                  ? `Agent Settings - ${selectedAgentForPanel.firstName} ${selectedAgentForPanel.lastName}`
                  : "Chat Panel"}
              </SheetTitle>
            </SheetHeader>
            {selectedAgentForPanel ? (
              <AgentSettingsPanel agent={selectedAgentForPanel} />
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
    <UserProvider>
      <OrganizationProvider>
        <BillingProvider>
          <AgentProvider>
            <ConversationProvider>
              <ApiToolsProvider>
                <WebhookProvider>
                  <ChatProvider>
                    <ViewProvider>
                      <SidebarProvider>
                        <ReadinessProvider>
                          <LandingPromptProvider>
                            <AppLayout>{children}</AppLayout>
                          </LandingPromptProvider>
                        </ReadinessProvider>
                      </SidebarProvider>
                    </ViewProvider>
                  </ChatProvider>
                </WebhookProvider>
              </ApiToolsProvider>
            </ConversationProvider>
          </AgentProvider>
        </BillingProvider>
      </OrganizationProvider>
    </UserProvider>
  );
} 