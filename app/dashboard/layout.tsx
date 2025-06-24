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
import { ViewProvider } from '@/components/dashboard/context/ViewProvider';
import { SidebarProvider } from "@/components/ui/sidebar";
import { ReadinessProvider } from '@/components/dashboard/context/ReadinessProvider';
import { LandingPromptProvider } from '@/components/dashboard/context/LandingPromptProvider';
import { DashboardProvider } from '@/components/dashboard/context/DashboardProvider';

/**
 * Layout for the main dashboard area.
 * It sets up all the necessary context providers for the dashboard functionality.
 * This ensures that these providers are only active for authenticated dashboard routes,
 * preventing them from running on public pages like the landing page.
 */
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
                    <DashboardProvider>
                      <ViewProvider>
                        <SidebarProvider>
                          <ReadinessProvider>
                            <LandingPromptProvider>
                              <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
                                {/* The DashboardProvider and specific page structure (3 panels) will be in page.tsx */}
                                {children}
                              </div>
                            </LandingPromptProvider>
                          </ReadinessProvider>
                        </SidebarProvider>
                      </ViewProvider>
                    </DashboardProvider>
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