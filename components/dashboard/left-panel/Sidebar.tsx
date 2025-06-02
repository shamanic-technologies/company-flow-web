'use client';

import * as React from "react"
import { useState } from 'react';
import Link from "next/link";
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboard } from '../context/DashboardContext'
import { SearchWebhookResultItem, WebhookStatus, SearchApiToolResultItem, ApiToolStatus } from '@agent-base/types';
import WebhookSubfolder from './WebhookSubfolder';
import { renderSectionContent } from './SidebarSectionRenderer';
import ToolSubfolder from './ToolSubfolder';
import { OrganizationSelector } from './OrganizationSelector';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarCreditBalance } from "./SidebarCreditBalance"

// Agent sub-menu configuration (moved from old sidebar)
const agentSubMenuItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'conversations', label: 'Conversations', icon: List },
  { id: 'memory', label: 'Memory', icon: MemoryStick },
  { id: 'actions', label: 'Actions', icon: ToyBrick },
]

// Main Sidebar Component
export default function SidebarComponent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    clerkUser,
    getClerkUserInitials,
    handleClerkLogout,
    agents,
    isLoadingAgents,
    agentError,
    selectedAgentIdMiddlePanel: selectedAgentId,
    selectAgentAndSetView,
    activeAgentView,
    setActiveAgentView,
    userWebhooks,
    isLoadingWebhooks,
    webhookError,
    selectedWebhook,
    selectWebhookAndSetView,
    apiTools,
    isLoadingApiTools,
    apiToolsError,
    selectedTool,
    selectToolAndSetView,
  } = useDashboard();

  // State to track which agent's sub-menu is expanded (from old sidebar)
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(selectedAgentId)

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
    <Sidebar {...props} className="border-r border-border/40">
      <SidebarHeader className="p-2 border-b border-border/40">
        <OrganizationSelector />
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
                  <div className="p-1 text-xs text-muted-foreground">Dashboards coming soon...</div>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {/* Webhooks Section (renamed to Inbound) */}
          <SidebarMenuItem>
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
                    <div className="p-1 flex flex-col gap-1">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : webhookError ? (
                    <div className="p-1 text-xs text-red-400">Error: {webhookError}</div>
                  ) : (
                    <>
                      { /* Active Webhooks Subfolder */ }
                      <WebhookSubfolder title="Active" webhooks={activeWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} />
                      { /* Unset Webhooks Subfolder */ }
                      <WebhookSubfolder title="Unset" webhooks={unsetWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} />
                      { /* Disabled Webhooks Subfolder */ }
                      <WebhookSubfolder title="Disabled" webhooks={disabledWebhooks} selectedWebhook={selectedWebhook} selectWebhookAndSetView={selectWebhookAndSetView} />
                      {/* Message if all lists are empty */}
                      {typedUserWebhooks.length === 0 && (
                        <div className="p-1 text-xs text-muted-foreground">No webhooks found.</div>
                      )}
                    </>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {/* Agents Section (moved below Inbound) */}
          <SidebarMenuItem>
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
                    (agent) => (
                      <SidebarMenuItem key={agent.id}>
                        <Collapsible
                          open={expandedAgentId === agent.id}
                          onOpenChange={(isOpen) => setExpandedAgentId(isOpen ? agent.id : null)}
                        >
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton
                              data-active={selectedAgentId === agent.id && activeAgentView === null}
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
                                const isActive = activeAgentView === item.id && selectedAgentId === agent.id
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
          <SidebarMenuItem>
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
                    <div className="p-1 flex flex-col gap-1">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : apiToolsError ? (
                    <div className="p-1 text-xs text-red-400">Error: {apiToolsError}</div>
                  ) : (
                    <>
                      <ToolSubfolder title="Active" tools={activeTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} />
                      <ToolSubfolder title="Unset" tools={unsetTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} />
                      {apiTools.length === 0 && activeTools.length === 0 && unsetTools.length === 0 && (
                        <div className="p-1 text-xs text-muted-foreground">No tools found.</div>
                      )}
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-9 w-full items-center justify-between rounded-md px-3 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={clerkUser?.imageUrl || ''} alt={clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress || 'User'} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">{getClerkUserInitials()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-xs text-foreground truncate">
                  {clerkUser?.fullName || clerkUser?.primaryEmailAddress?.emailAddress || 'Guest'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings/billing" className="flex items-center w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleClerkLogout} className="text-red-500 focus:text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
