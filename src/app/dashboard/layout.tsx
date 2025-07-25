'use client';

import React, { useState, useEffect } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { UserProvider } from '../../providers/UserProvider';
import { AgentProvider, useAgentContext } from '../../providers/AgentProvider';
import { LangGraphConversationProvider } from '../../providers/langgraph/LangGraphConversationProvider';
import { LangGraphChatProvider } from '../../providers/langgraph/LangGraphChatProvider';
import { ApiToolsProvider } from '../../providers/ApiToolsProvider';
import { WebhookProvider } from '../../providers/WebhookProvider';
import { BillingProvider } from '../../providers/BillingProvider';
import { ViewProvider, useViewContext } from '../../providers/ViewProvider';
import { SidebarProvider } from "../../components/ui/sidebar";
import { LangGraphLandingPromptProvider } from '../../providers/langgraph/LangGraphLandingPromptProvider';
import { usePathname } from 'next/navigation';

import SidebarComponent from '../../components/dashboard/sidebar/Sidebar';
import RightPanel from '../../components/dashboard/right-panel/langgraph/LangGraphChatPanel';
import DashboardNavbar from '../../components/dashboard/DashboardNavbar';
import { Skeleton } from '../../components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../components/ui/sheet";
import LangGraphAgentSettingsPanel from '../../components/dashboard/right-panel/langgraph/LangGraphAgentSettingsPanel';
import QueryProvider from '../../providers/QueryProvider';
import { useLangGraphConversationContext } from '../../providers/langgraph/LangGraphConversationProvider';
import { DashboardShellSkeleton } from '../../components/dashboard/skeletons/skeletons';
import { useUserContext } from '../../providers/UserProvider';

function DebugDisplay() {
  const { selectedAgentForChat } = useAgentContext();
  const { currentConversationId } = useLangGraphConversationContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black/70 p-3 text-white shadow-lg">
      <h3 className="mb-2 border-b border-gray-500 pb-1 text-sm font-bold">
        Debug Info
      </h3>
      <div className="text-xs">
        <p>
          <span className="font-semibold">Agent ID:</span>{' '}
          {selectedAgentForChat?.id ?? 'null'}
        </p>
        <p>
          <span className="font-semibold">Conv. ID:</span>{' '}
          {currentConversationId ?? 'null'}
        </p>
      </div>
    </div>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isRightPanelOpen, setIsRightPanelOpen } = useViewContext();
  const { selectedAgentForSettings } = useAgentContext();

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
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
              <LangGraphAgentSettingsPanel agent={selectedAgentForSettings} />
            ) : (
              <RightPanel />
            )}
          </SheetContent>
        </Sheet>
      </div>
      <DebugDisplay />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // This is a temporary wrapper to access the hook.
  // In a real app, you might have a different structure
  // if the skeleton needs to be outside the UserProvider.
  const InnerLayout = ({ children }: { children: React.ReactNode }) => {
    const { isPendingOrganizations } = useUserContext();

    if (isPendingOrganizations) {
      return <DashboardShellSkeleton />;
    }

    return <AppLayout>{children}</AppLayout>;
  };

  return (
    <QueryProvider>
      <UserProvider>
        <BillingProvider>
          <AgentProvider>
            <LangGraphConversationProvider>
                <ApiToolsProvider>
                  <WebhookProvider>
                    <ViewProvider>
                      <SidebarProvider>
                        <LangGraphChatProvider>
                          <LangGraphLandingPromptProvider>
                            <InnerLayout>{children}</InnerLayout>
                          </LangGraphLandingPromptProvider>
                        </LangGraphChatProvider>
                      </SidebarProvider>
                    </ViewProvider>
                  </WebhookProvider>
                </ApiToolsProvider>
            </LangGraphConversationProvider>
          </AgentProvider>
        </BillingProvider>
      </UserProvider>
    </QueryProvider>
  );
} 