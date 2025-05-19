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
  Webhook,
  FolderKanban,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDashboard } from '../context/DashboardContext'
import { SearchWebhookResultItem, WebhookStatus, UtilityProvider } from '@agent-base/types';
import WebhookSubfolder from './WebhookSubfolder';
import { renderSectionContent } from './SidebarSectionRenderer';
import ToolSubfolder, { ToolItem as ImportedToolItem } from './ToolSubfolder';

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
    // --- Add placeholder tool data and handlers ---
    // These would normally come from useDashboard() context
  } = useDashboard();

  // --- Placeholder Tool Data and State (to be moved to context) ---
  const [userTools, setUserTools] = useState<ImportedToolItem[]>([
    { id: 'tool1', name: 'Data Analyzer X', status: 'active' },
    { id: 'tool2', name: 'Email Assistant', status: 'active' },
    { id: 'tool3', name: 'Calendar Connector', status: 'available' },
    { id: 'tool4', name: 'File Converter', status: 'beta' },
    { id: 'tool5', name: 'Image Generator (New)', status: 'beta' },
    { id: 'tool6', name: 'Sentiment Analysis Pro', status: 'active'},
    { id: 'tool7', name: 'Quick Translator', status: 'available'}
  ]);
  const [isLoadingTools, setIsLoadingTools] = useState(false); // Mock loading state
  const [toolError, setToolError] = useState<string | null>(null); // Mock error state
  const [selectedTool, setSelectedTool] = useState<ImportedToolItem | null>(null);

  const selectToolAndSetView = (tool: ImportedToolItem | null) => {
    setSelectedTool(tool);
    // Potentially also set a view, similar to selectWebhookAndSetView
    // e.g., setActiveToolView('detail');
    console.log("Selected tool:", tool);
  };
  // --- End of Placeholder Tool Data ---

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

  // --- Filter Tools by Status (using placeholder data) ---
  const activeTools = userTools.filter((t: ImportedToolItem) => t.status === 'active');
  const availableTools = userTools.filter((t: ImportedToolItem) => t.status === 'available');
  const betaTools = userTools.filter((t: ImportedToolItem) => t.status === 'beta');

  return (
    <Sidebar {...props} className="border-r border-border/40">
      <SidebarHeader className="p-2 border-b border-border/40">
        <div className="group flex h-9 w-full shrink-0 items-center justify-center rounded-md border border-dashed border-border/70 text-xs font-medium text-muted-foreground">
          <FolderClosed className="h-4 w-4 mr-2" />
          Personal
        </div>
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
                  {/* Using Package icon for the Tools section header */}
                  <Package className="h-3.5 w-3.5 shrink-0 mr-0.5" />
                  <span className="flex-1 text-left">Tools</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="pl-1">
                  {isLoadingTools ? (
                    <div className="p-1 flex flex-col gap-1">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ) : toolError ? (
                    <div className="p-1 text-xs text-red-400">Error: {toolError}</div>
                  ) : (
                    <>
                      <ToolSubfolder title="Active Tools" tools={activeTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} />
                      <ToolSubfolder title="Available Tools" tools={availableTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} />
                      <ToolSubfolder title="Beta Tools" tools={betaTools} selectedTool={selectedTool} selectToolAndSetView={selectToolAndSetView} />
                      {userTools.length === 0 && (
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
