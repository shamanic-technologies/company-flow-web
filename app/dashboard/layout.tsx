'use client';

import React from 'react';
import { UserProvider } from '@/components/dashboard/context/UserProvider';
import { OrganizationProvider } from '@/components/dashboard/context/OrganizationProvider';
import { AgentProvider } from '@/components/dashboard/context/AgentProvider';
import { ConversationProvider } from '@/components/dashboard/context/ConversationProvider';
import { ChatProvider } from '@/components/dashboard/context/ChatProvider';
import { ApiToolsProvider } from '@/components/dashboard/context/ApiToolsProvider';
import { WebhookProvider } from '@/components/dashboard/context/WebhookProvider';
import { BillingProvider } from '@/components/dashboard/context/BillingProvider';
import { ViewProvider, useViewContext } from '@/components/dashboard/context/ViewProvider';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReadinessProvider, useReadinessContext } from '@/components/dashboard/context/ReadinessProvider';
import { LandingPromptProvider, useLandingPromptContext } from '@/components/dashboard/context/LandingPromptProvider';

import SidebarComponent from '@/components/dashboard/left-panel/Sidebar';
import RightPanel from '@/components/dashboard/right-panel/RightPanel';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function AppLayout({ children }: { children: React.ReactNode }) {
  const { hasInitiallyLoaded } = useReadinessContext();
  const { isLandingPromptProcessing } = useLandingPromptContext();
  const { isRightPanelOpen, setIsRightPanelOpen } = useViewContext();

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
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Create New Agent</SheetTitle>
            </SheetHeader>
            <RightPanel />
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