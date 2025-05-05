'use client';

import { useState } from 'react';
import Link from "next/link";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  User, 
  Bot, 
  FolderClosed,
  MessageSquare,
  List,
  MemoryStick,
  ToyBrick,
  Webhook
} from "lucide-react";
import { useDashboard } from '../context/DashboardContext';
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

export default function Sidebar() {
  const { 
    user, 
    getUserInitials, 
    handleLogout, 
    agents, 
    isLoadingAgents, 
    agentError,
    selectedAgentId,
    setSelectedAgentId,
    activeAgentView,
    setActiveAgentView,
    userWebhooks,       
    isLoadingWebhooks,  
    webhookError,       
    selectedWebhook,    
    selectWebhook,      
  } = useDashboard();

  // State to track which agent's sub-menu is expanded
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  // Sub-menu items configuration
  const agentSubMenuItems = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'conversations', label: 'Conversations', icon: List },
    { id: 'memory', label: 'Memory', icon: MemoryStick },
    { id: 'actions', label: 'Actions', icon: ToyBrick },
  ];

  return (
    <aside className="w-64 flex flex-col h-screen border-r border-gray-800 bg-gray-950 sm:flex flex-shrink-0">
      <nav className="flex flex-1 flex-col gap-4 px-4 py-4 overflow-y-auto">
        {/* Organization Selector - Placeholder */} 
        <div className="group flex h-9 w-full shrink-0 items-center justify-center rounded-md border border-dashed border-gray-700 text-sm font-medium text-gray-400">
          <FolderClosed className="h-4 w-4 mr-2" />
          Personal
        </div>

        {/* Dashboards Section */}
        <div className="flex flex-col gap-1">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dashboards</h3>
          {/* Placeholder for Dashboards content */}
          <div className="p-2 text-sm text-gray-400">Dashboards coming soon...</div>
        </div>

        {/* AI Agents Section */} 
        <div className="flex flex-col gap-1">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Agents</h3>
          {isLoadingAgents ? (
            <div className="p-2 text-sm text-gray-400">Loading agents...</div>
          ) : agentError ? (
            <div className="p-2 text-sm text-red-400">Error: {agentError}</div>
          ) : agents.length === 0 ? (
            <div className="p-2 text-sm text-gray-400">No agents found.</div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="flex flex-col">
                {/* Agent Selection Button */}
                <Button
                  variant={selectedAgentId === agent.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-xs h-8 font-medium pl-2 pr-2"
                  onClick={() => {
                    // Only select the agent if it's not already selected
                    if (selectedAgentId !== agent.id) {
                      setSelectedAgentId(agent.id); 
                    }
                    // Always toggle expansion
                    setExpandedAgentId(prevId => (prevId === agent.id ? null : agent.id)); 
                  }}
                >
                  <ChevronRight 
                    className={cn(
                      "mr-1 h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200",
                      expandedAgentId === agent.id && "rotate-90"
                    )} 
                  />
                  <span className="truncate pl-1">{`${agent.firstName} ${agent.lastName}`}</span>
                </Button>
                
                {/* Sub-menu for the selected and expanded agent */}
                {expandedAgentId === agent.id && (
                  <div className="mt-1 mb-1 pl-7 flex flex-col gap-0.5">
                    {agentSubMenuItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeAgentView === item.id && selectedAgentId === agent.id;
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "secondary" : "ghost"} 
                          className={cn(
                            "w-full justify-start text-xs h-7 pl-2",
                            isActive 
                              ? "font-semibold text-gray-100"
                              : "font-normal text-gray-400 hover:text-gray-200 hover:bg-gray-800/50",
                            !isActive && "hover:bg-gray-800/50"
                          )}
                          onClick={() => setActiveAgentView(item.id as any)}
                        >
                          <Icon className="mr-2 h-3.5 w-3.5 shrink-0" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Tools Section */}
        <div className="flex flex-col gap-1">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</h3>
          {/* Placeholder for Tools content */}
          <div className="p-2 text-sm text-gray-400">Tools coming soon...</div>
        </div>

        {/* Webhooks Section */}
        <div className="flex flex-col gap-1">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Webhooks</h3>
          {/* Display loading, error, or webhook list */}
          {isLoadingWebhooks ? (
            <div className="p-2 text-sm text-gray-400">Loading webhooks...</div>
          ) : webhookError ? (
            <div className="p-2 text-sm text-red-400">Error: {webhookError}</div>
          ) : userWebhooks.length === 0 ? (
            <div className="p-2 text-sm text-gray-400">No webhooks found.</div>
          ) : (
            userWebhooks.map((webhook) => (
              <Button
                key={webhook.id}
                variant={selectedWebhook?.id === webhook.id ? "secondary" : "ghost"}
                className="w-full justify-start text-xs h-8 font-medium pl-2 pr-2"
                onClick={() => selectWebhook(webhook)}
              >
                <Webhook className="mr-2 h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{webhook.name}</span>
              </Button>
            ))
          )}
        </div>
      </nav>

      {/* User Profile Section at the bottom */} 
      <nav className="mt-auto flex flex-col gap-4 px-4 py-4 border-t border-gray-800">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-10 w-full items-center justify-between rounded-md px-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.profileImage || ''} alt={user?.displayName || 'User'} />
                  <AvatarFallback className="bg-gray-700 text-gray-200 text-xs">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm text-gray-200 truncate">{user?.displayName || 'Guest'}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56 bg-gray-900 border-gray-700">
            <DropdownMenuLabel className="text-gray-300">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-700" />
            {/* Add profile/settings link if needed */}
            {/* 
            <DropdownMenuItem className="text-gray-200 focus:bg-gray-800 focus:text-gray-100">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem> 
            */}
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:bg-gray-800 focus:text-red-300">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </aside>
  );
} 