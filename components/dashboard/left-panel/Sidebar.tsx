'use client';

import * as React from "react"
import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  File,
  Folder,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  User,
  Bot,
  FolderClosed,
  MessageSquare,
  List,
  MemoryStick,
  ToyBrick,
  Webhook as WebhookIcon,
  FolderKanban,
  Package,
  CreditCard,
  ChevronsUpDown,
  PlusCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
// import { useDashboard } from '../context/DashboardContext'
import { SearchWebhookResultItem, WebhookStatus, SearchApiToolResultItem, ApiToolStatus } from '@agent-base/types';
import WebhookSubfolder from './WebhookSubfolder';
import { renderSectionContent } from './SidebarSectionRenderer';
import ToolSubfolder from './ToolSubfolder';
import { SidebarCreditBalance } from "./SidebarCreditBalance"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAgentContext } from '../context/AgentProvider';
import { useViewContext } from '../context/ViewProvider';
import { useApiToolsContext } from '../context/ApiToolsProvider';
import { useWebhookContext } from '../context/WebhookProvider';
import { useOrganizationContext } from '../context/OrganizationProvider';
import { useUserContext } from '../context/UserProvider';
import { useDashboardContext } from '../context/DashboardProvider';
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

// Agent sub-menu configuration (moved from old sidebar)
const agentSubMenuItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'conversations', label: 'Conversations', icon: List },
  { id: 'memory', label: 'Memory', icon: MemoryStick },
]

// Main Sidebar Component
export default function SidebarComponent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { clerkUser, getClerkUserInitials, handleClerkLogout } = useUserContext();
  const { organizations, currentOrganization, switchOrganization } = useOrganizationContext();
  const { agents, isLoadingAgents, agentError, selectedAgentIdMiddlePanel } = useAgentContext();
  const { 
    activeAgentView, 
    setActiveAgentView, 
    selectAgentAndSetView,
    selectedWebhook,
    selectWebhookAndSetView,
    selectedTool,
    selectToolAndSetView,
    selectDashboardAndSetView,
    selectedDashboard,
  } = useViewContext();
  const { apiTools, isLoadingApiTools, apiToolsError } = useApiToolsContext();
  const { userWebhooks, isLoadingWebhooks, webhookError } = useWebhookContext();
  const { dashboards, isLoading, error } = useDashboardContext();

  const [isCreateOrgOpen, setCreateOrgOpen] = useState(false);

  // State to track which agent's sub-menu is expanded (from old sidebar)
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(selectedAgentIdMiddlePanel)

  // State for main collapsible sections
  const [isDashboardsOpen, setIsDashboardsOpen] = useState(true)
  const [isAgentsOpen, setIsAgentsOpen] = useState(true)
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
        <SidebarHeader className="p-2 border-b border-border/40">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="w-full flex justify-between items-center p-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentOrganization?.profileImage} />
                    <AvatarFallback>{currentOrganization?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{currentOrganization?.name}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-1 bg-gray-800 border-gray-700 text-gray-200">
              {organizations.map((org) => (
                <Button
                  key={org.id}
                  variant="ghost"
                  className="w-full justify-start p-2 text-sm"
                  onClick={() => switchOrganization(org.id)}
                >
                  {org.name}
                </Button>
              ))}
              <div className="border-t border-gray-700 my-1" />
              <Button variant="ghost" className="w-full justify-start p-2 text-sm" onClick={() => setCreateOrgOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create Organization
              </Button>
              <div className="border-t border-gray-700 my-1" />
              <Button variant="ghost" className="w-full justify-start p-2 text-sm" onClick={() => router.push('/dashboard/settings/billing')}>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start p-2 text-sm" onClick={handleClerkLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </PopoverContent>
          </Popover>
        </SidebarHeader>

        <SidebarContent className="flex-1 overflow-y-auto p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Collapsible open={isDashboardsOpen} onOpenChange={setIsDashboardsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-start text-xs h-6 px-1 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-1">
                    <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isDashboardsOpen && "rotate-90")} />
                    <span className="flex-1 text-left">Dashboards</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="pl-1">
                     {isLoading ? (
                       <div className="p-1 flex flex-col gap-1"><Skeleton className="h-6 w-full" /></div>
                     ) : error ? (
                       <div className="p-1 text-xs text-red-400">Error: {error}</div>
                     ) : dashboards.length === 0 ? (
                       <SidebarMenuItem>
                          <SidebarMenuButton
                              data-active={activeAgentView === 'dashboard'}
                              className={cn(
                                  "w-full justify-start text-xs h-6 px-1 gap-1",
                                  "hover:text-accent-foreground",
                                  activeAgentView === 'dashboard'
                                  ? "text-accent-foreground font-semibold"
                                  : "font-normal text-muted-foreground"
                              )}
                              onClick={() => selectDashboardAndSetView(null)}
                          >
                              <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                              Welcome dashboard
                          </SidebarMenuButton>
                      </SidebarMenuItem>
                     ) : (
                       dashboards.map((dashboard: DashboardInfo) => (
                         <SidebarMenuItem key={dashboard.id}>
                           <SidebarMenuButton
                               // Add active state logic if needed later
                               data-active={activeAgentView === 'dashboard' && selectedDashboard?.id === dashboard.id}
                               className={cn(
                                   "w-full justify-start text-xs h-6 px-1 gap-1",
                                   "hover:text-accent-foreground",
                                   (activeAgentView === 'dashboard' && selectedDashboard?.id === dashboard.id)
                                   ? "text-accent-foreground font-semibold"
                                   : "font-normal text-muted-foreground"
                               )}
                               onClick={() => selectDashboardAndSetView(dashboard)}
                           >
                               <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
                               <span className="truncate">{dashboard.name}</span>
                           </SidebarMenuButton>
                         </SidebarMenuItem>
                       ))
                     )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            {/* Webhooks Section (renamed to Inbound) */}
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
                        <WebhookSubfolder key="active-webhooks" title="Active" webhooks={activeWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} />
                        <WebhookSubfolder key="unset-webhooks" title="Unset" webhooks={unsetWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} />
                        <WebhookSubfolder key="disabled-webhooks" title="Disabled" webhooks={disabledWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} />
                      </>
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            {/* Agents Section (moved below Inbound) */}
            <SidebarMenuItem key="agents-section">
              <Collapsible open={isAgentsOpen} onOpenChange={setIsAgentsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton className="w-full justify-start text-xs h-6 px-1 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-1">
                    <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isAgentsOpen && "rotate-90")} />
                    <span className="flex-1 text-left">Agents</span>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="pl-1">
                    {renderSectionContent(
                      isLoadingAgents,
                      agentError,
                      agents,
                      "No agents found.",
                      (agent: Agent) => (
                        <SidebarMenuItem key={agent.id}>
                          <Collapsible
                            open={expandedAgentId === agent.id}
                            onOpenChange={(isOpen) => setExpandedAgentId(isOpen ? agent.id : null)}
                          >
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                data-active={selectedAgentIdMiddlePanel === agent.id && activeAgentView === null}
                                className={cn(
                                  "w-full justify-start text-xs h-6 px-1 gap-1",
                                  "data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground",
                                  "data-[active=true]:text-accent-foreground data-[active=true]:font-semibold"
                                )}
                                onClick={(e) => {
                                  if (expandedAgentId === agent.id && e.target === e.currentTarget) {
                                    selectAgentAndSetView(agent.id)
                                  } else if (expandedAgentId !== agent.id) {
                                    selectAgentAndSetView(agent.id)
                                  }
                                }}
                              >
                                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", expandedAgentId === agent.id && "rotate-90")} />
                                <span className="truncate flex-1 text-left">{`${agent.firstName} ${agent.lastName}`}</span>
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className="pl-1">
                                {agentSubMenuItems.map((item) => {
                                  const Icon = item.icon
                                  const isActive = activeAgentView === item.id && selectedAgentIdMiddlePanel === agent.id
                                  return (
                                    <SidebarMenuItem key={item.id}>
                                      <SidebarMenuButton
                                        data-active={isActive}
                                        className={cn(
                                          "w-full justify-start text-xs h-6 px-1 gap-1",
                                          "hover:text-accent-foreground",
                                          isActive
                                            ? "text-accent-foreground font-semibold"
                                            : "font-normal text-muted-foreground"
                                        )}
                                        onClick={() => setActiveAgentView(item.id as any)}
                                      >
                                        <Icon className="h-3.5 w-3.5 shrink-0" />
                                        {item.label}
                                      </SidebarMenuButton>
                                    </SidebarMenuItem>
                                  )
                                })}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

            {/* Tools Section (now last) */}
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
                        <ToolSubfolder key="active-tools" title="Active" tools={activeTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} />
                        <ToolSubfolder key="unset-tools" title="Unset" tools={unsetTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} />
                      </>
                    )}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            </SidebarMenuItem>

          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2 border-t border-border/40">
          {/* Credit Balance Display */}
          <div className="mb-2">
            <SidebarCreditBalance 
              className="border-border/30" 
            />
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
