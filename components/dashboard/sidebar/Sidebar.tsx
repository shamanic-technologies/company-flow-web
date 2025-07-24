'use client';

import * as React from "react"
import { useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronRight,
  File,
  Folder,
  LayoutDashboard,
  Home,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Bot,
  FolderClosed,
  MessageSquare,
  MemoryStick,
  ToyBrick,
  Webhook as WebhookIcon,
  FolderKanban,
  Package,
  CreditCard,
  ChevronsUpDown,
  PlusCircle,
  MoreVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SearchWebhookResultItem, WebhookStatus, SearchApiToolResultItem, ApiToolStatus } from '@agent-base/types';
// import WebhookSubfolder from './WebhookSubfolder';
// import { renderSectionContent } from './SidebarSectionRenderer';
// import ToolSubfolder from './ToolSubfolder';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAgentContext } from '@/providers/AgentProvider';
import { useViewContext } from '@/providers/ViewProvider';
import { useApiToolsContext } from '@/providers/ApiToolsProvider';
import { useWebhookContext } from '@/providers/WebhookProvider';
import { useOrganizationContext } from '@/providers/OrganizationProvider';
import { useUserContext } from '@/providers/UserProvider';
import { Agent, DashboardInfo } from '@agent-base/types';
import CreateOrganizationDialog from './CreateOrganizationDialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"



// Main Sidebar Component
export default function SidebarComponent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const { clerkUser, getClerkUserInitials, handleClerkLogout } = useUserContext();
  const { organizations, currentOrganization, switchOrganization } = useOrganizationContext();
  const { agents, isLoadingAgents, agentError } = useAgentContext();
  const { isRightPanelOpen, setIsRightPanelOpen } = useViewContext();
  const { apiTools, isLoadingApiTools, apiToolsError } = useApiToolsContext();
  const { userWebhooks, isLoadingWebhooks, webhookError } = useWebhookContext();

  const [isCreateOrgOpen, setCreateOrgOpen] = useState(false);

  // State for main collapsible sections
  const [isDashboardsOpen, setIsDashboardsOpen] = useState(true)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isWebhooksOpen, setIsWebhooksOpen] = useState(true)

  // --- Filter Webhooks by Status --- 
  // Explicitly type userWebhooks from context to match imported type
  const typedUserWebhooks = userWebhooks as SearchWebhookResultItem[];
  // Use the correct property and enum values for filtering
  const activeWebhooks = typedUserWebhooks.filter(wh => wh.currentUserWebhookStatus === WebhookStatus.ACTIVE);
  const unsetWebhooks = typedUserWebhooks.filter(wh => wh.currentUserWebhookStatus === WebhookStatus.UNSET || !wh.currentUserWebhookStatus); // Include undefined/null as UNSET
  const disabledWebhooks = typedUserWebhooks.filter(wh => wh.currentUserWebhookStatus === WebhookStatus.DISABLED);

  // --- Filter Tools by Status (using live data from context) ---
  const activeTools = apiTools.filter((t: SearchApiToolResultItem) => t.status === ApiToolStatus.ACTIVE);
  const unsetTools = apiTools.filter((t: SearchApiToolResultItem) => t.status === ApiToolStatus.UNSET);

  return (
    <>
      <CreateOrganizationDialog open={isCreateOrgOpen} onOpenChange={setCreateOrgOpen} />
      <Sidebar {...props} className="border-r border-border/40">
        <SidebarContent className="flex-1 overflow-y-auto p-2">
          <SidebarMenu>
            {/* Home Button */}
            <SidebarMenuItem key="home-section">
              <Link href="/dashboard" passHref>
                <SidebarMenuButton
                  className="group/button w-full justify-start text-sm h-8 px-2 gap-2"
                  data-active={pathname === '/dashboard'}
                >
                  <Home className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left font-medium">Home</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            {/* Webhooks Section (renamed to Inbound) */}
            {typedUserWebhooks.length > 0 && (
              <SidebarMenuItem key="webhooks-section">
                <Collapsible open={isWebhooksOpen} onOpenChange={setIsWebhooksOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-start text-xs h-6 px-1 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-1">
                      <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isWebhooksOpen && "rotate-90")} />
                      <span className="flex-1 text-left">Inbound</span> {/* Renamed from Webhooks */}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="pl-1">
                      {isLoadingWebhooks ? (
                        <div className="p-1 flex flex-col gap-1"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div>
                      ) : webhookError ? (
                        <div className="p-1 text-xs text-red-400">Error: {webhookError}</div>
                      ) : typedUserWebhooks.length === 0 ? (
                        <div className="p-1 text-xs text-muted-foreground">No webhooks found.</div>
                      ) : (
                        <>
                          {/* <WebhookSubfolder key="active-webhooks" title="Active" webhooks={activeWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} />
                          <WebhookSubfolder key="unset-webhooks" title="Unset" webhooks={unsetWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} />
                          <WebhookSubfolder key="disabled-webhooks" title="Disabled" webhooks={disabledWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} /> */}
                        </>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}

            {/* Agents Section - Changed from collapsible to single button */}
            <SidebarMenuItem key="agents-section">
              <Link href="/dashboard/agents" passHref>
                <SidebarMenuButton
                  className="group/button w-full justify-start text-sm h-8 px-2 gap-2"
                  data-active={pathname.startsWith('/dashboard/agents')}
                >
                  <Bot className="h-4 w-4 shrink-0 transition-transform duration-200 ease-in-out group-hover/button:scale-110" />
                  <span className="flex-1 text-left font-medium">Agents</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            {/* Tools Section (now last) */}
            {apiTools.length > 0 && (
              <SidebarMenuItem key="tools-section">
                <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-start text-xs h-6 px-1 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-1">
                      <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isToolsOpen && "rotate-90")} />
                      <span className="flex-1 text-left">Tools</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="pl-1">
                      {isLoadingApiTools ? (
                        <div className="p-1 flex flex-col gap-1"><Skeleton className="h-6 w-full" /><Skeleton className="h-6 w-full" /></div>
                      ) : apiToolsError ? (
                        <div className="p-1 text-xs text-red-400">Error: {apiToolsError}</div>
                      ) : apiTools.length === 0 ? (
                        <div className="p-1 text-xs text-muted-foreground">No tools found.</div>
                      ) : (
                        <>
                          {/* <ToolSubfolder key="active-tools" title="Active" tools={activeTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} />
                          <ToolSubfolder key="unset-tools" title="Unset" tools={unsetTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} /> */}
                        </>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )}

          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t border-border/40">
          {/* Credit Balance Display moved to settings page */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full flex justify-between items-center p-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={clerkUser?.imageUrl} />
                    <AvatarFallback>{getClerkUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{clerkUser?.firstName} {clerkUser?.lastName}</span>
                </div>
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-1 bg-popover border-border text-popover-foreground">
              <Button variant="ghost" className="w-full justify-start p-2 text-sm" onClick={() => router.push('/dashboard/settings/billing')}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
              <div className="border-t border-border my-1" />
              <Button variant="ghost" className="w-full justify-start p-2 text-sm" onClick={handleClerkLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </PopoverContent>
          </Popover>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
