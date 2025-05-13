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
    selectedAgentId,
    selectAgentAndSetView,
    activeAgentView,
    setActiveAgentView,
    userWebhooks,
    isLoadingWebhooks,
    webhookError,
    selectedWebhook,
    selectWebhookAndSetView,
  } = useDashboard()

  // State to track which agent's sub-menu is expanded (from old sidebar)
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(selectedAgentId)

  // State for main collapsible sections
  const [isDashboardsOpen, setIsDashboardsOpen] = useState(true)
  const [isAgentsOpen, setIsAgentsOpen] = useState(true)
  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isWebhooksOpen, setIsWebhooksOpen] = useState(true)

  // Helper to render loading/error/empty states
  const renderSectionContent = (
    isLoading: boolean,
    error: string | null,
    items: any[],
    emptyMessage: string,
    renderItem: (item: any, index: number) => React.ReactNode
  ) => {
    if (isLoading) {
      return (
        <div className="p-2 flex flex-col gap-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      )
    }
    if (error) {
      return <div className="p-2 text-sm text-red-400">Error: {error}</div>
    }
    if (items.length === 0) {
      return <div className="p-2 text-sm text-gray-400">{emptyMessage}</div>
    }
    return items.map(renderItem)
  }

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
          <SidebarMenuItem className="mb-1">
            <Collapsible open={isDashboardsOpen} onOpenChange={setIsDashboardsOpen}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-start text-xs h-8 px-2 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-0">
                  <ChevronRight className={cn("h-4 w-4 transition-transform", isDashboardsOpen && "rotate-90")} />
                  <span className="flex-1 text-left ml-1">Dashboards</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="pl-3">
                  <div className="p-1 text-xs text-muted-foreground">Dashboards coming soon...</div>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          <SidebarMenuItem className="mb-1">
            <Collapsible open={isAgentsOpen} onOpenChange={setIsAgentsOpen}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-start text-xs h-8 px-2 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-0">
                  <ChevronRight className={cn("h-4 w-4 transition-transform", isAgentsOpen && "rotate-90")} />
                  <span className="flex-1 text-left ml-1">Agents</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="pl-3">
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
                                "w-full justify-start text-xs h-7 pl-2 pr-2 gap-0",
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
                              <span className="truncate flex-1 text-left pl-1">{`${agent.firstName} ${agent.lastName}`}</span>
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub className="pl-2">
                              {agentSubMenuItems.map((item) => {
                                const Icon = item.icon
                                const isActive = activeAgentView === item.id && selectedAgentId === agent.id
                                return (
                                  <SidebarMenuItem key={item.id}>
                                    <SidebarMenuButton
                                      data-active={isActive}
                                      className={cn(
                                        "w-full justify-start text-xs h-7 pl-2",
                                        "hover:text-accent-foreground",
                                        isActive
                                          ? "text-accent-foreground font-semibold"
                                          : "font-normal text-muted-foreground"
                                      )}
                                      onClick={() => setActiveAgentView(item.id as any)}
                                    >
                                      <Icon className="mr-2 h-3.5 w-3.5 shrink-0" />
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

          <SidebarMenuItem className="mb-1">
            <Collapsible open={isToolsOpen} onOpenChange={setIsToolsOpen}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-start text-xs h-8 px-2 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-0">
                  <ChevronRight className={cn("h-4 w-4 transition-transform", isToolsOpen && "rotate-90")} />
                  <span className="flex-1 text-left ml-1">Tools</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="pl-3">
                  <div className="p-1 text-xs text-muted-foreground">Tools coming soon...</div>
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          <SidebarMenuItem className="mb-1">
            <Collapsible open={isWebhooksOpen} onOpenChange={setIsWebhooksOpen}>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-start text-xs h-8 px-2 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-0">
                  <ChevronRight className={cn("h-4 w-4 transition-transform", isWebhooksOpen && "rotate-90")} />
                  <span className="flex-1 text-left ml-1">Webhooks</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className="pl-3">
                  {renderSectionContent(
                    isLoadingWebhooks,
                    webhookError,
                    userWebhooks,
                    "No webhooks found.",
                    (webhook) => (
                      <SidebarMenuItem key={webhook.id}>
                        <SidebarMenuButton
                          data-active={selectedWebhook?.id === webhook.id}
                          className={cn(
                            "w-full justify-start text-xs h-7 pl-2 pr-2",
                            "hover:text-accent-foreground",
                            "data-[active=true]:text-accent-foreground data-[active=true]:font-semibold"
                          )}
                          onClick={() => selectWebhookAndSetView(webhook)}
                        >
                          <span className="truncate flex-1 text-left">{webhook.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
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
