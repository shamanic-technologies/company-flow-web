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
import { useApiToolsQuery } from '@/hooks/useApiToolsQuery';
import { useWebhooksQuery } from '@/hooks/useWebhooksQuery';
import { useOrganizationsQuery } from "@/hooks/useOrganizationsQuery";
import { useUserContext } from '@/providers/UserProvider';
import { Agent, DashboardInfo } from '@agent-base/types';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
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
  const { currentOrganization } = useOrganizationsQuery();
  const { agents, isLoadingAgents, agentError } = useAgentContext();
  const { isRightPanelOpen, setIsRightPanelOpen } = useViewContext();
  const { apiTools, isLoadingApiTools, apiToolsError } = useApiToolsQuery();
  const { webhooks, isLoadingWebhooks, webhooksError } = useWebhooksQuery();

  const [isCreateOrgOpen, setCreateOrgOpen] = useState(false);

  // State for main collapsible sections
  const [isDashboardsOpen, setIsDashboardsOpen] = useState(true)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isWebhooksOpen, setIsWebhooksOpen] = useState(true)

  // --- Filter Webhooks by Status --- 
  // No longer needed as we will simplify the display
  
  // --- Tools are no longer filtered by status in this component ---

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
            {webhooks && webhooks.length > 0 && (
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
                      ) : webhooksError ? (
                        <div className="p-1 text-xs text-red-400">Error: {webhooksError.message}</div>
                      ) : webhooks.length === 0 ? (
                        <div className="p-1 text-xs text-muted-foreground">No webhooks found.</div>
                      ) : (
                        <>
                          {webhooks.map((webhook) => (
                            <SidebarMenuItem key={webhook.id}>
                                <SidebarMenuButton className="w-full justify-start text-xs h-6 px-1 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-1">
                                    <WebhookIcon className="h-3.5 w-3.5" />
                                    <span className="flex-1 text-left">{webhook.name}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
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
            {apiTools && apiTools.length > 0 && (
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
                        <div className="p-1 text-xs text-red-400">Error: {apiToolsError.message}</div>
                      ) : !apiTools || apiTools.length === 0 ? (
                        <div className="p-1 text-xs text-muted-foreground">No tools found.</div>
                      ) : (
                        <>
                          {apiTools.map((tool) => (
                            <SidebarMenuItem key={tool.apiToolId}>
                                <SidebarMenuButton className="w-full justify-start text-xs h-6 px-1 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-1">
                                    <ToyBrick className="h-3.5 w-3.5" />
                                    <span className="flex-1 text-left">{tool.name}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
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
