'use client';

import * as React from "react";
import { useState } from 'react';
import { ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchApiToolResultItem, ApiToolStatus } from '@agent-base/types'; // Import SearchApiToolResultItem
import { CrispIcon, StripeIcon } from '@/components/icons'; // Import provider icons
// import { SomeToolProviderEnum } from '@agent-base/types'; // Placeholder if specific tool icons are needed later

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from "@/components/ui/sidebar";

// --- ToolItem Interface Removed ---
// No longer needed, using ApiTool from @agent-base/types

// --- Helper Function to get Tool Icon ---
const getToolIcon = (tool?: SearchApiToolResultItem) => {
  // Access utilityProvider safely, defaulting to lowercase for case-insensitive matching
  const provider = tool?.utilityProvider?.toLowerCase();

  switch (provider) {
    case 'crisp':
      return CrispIcon;
    case 'stripe':
      return StripeIcon;
    // Add more cases here for other utility providers and their icons
    // e.g. case 'slack': return SlackIcon;
    default:
      return Package; // Default icon if provider is not matched or not specified
  }
};

// --- Props Interface for ToolSubfolder ---
export interface ToolSubfolderProps {
  title: string;
  tools: SearchApiToolResultItem[];
  selectedTool: SearchApiToolResultItem | null;
  selectToolAndSetView: (tool: SearchApiToolResultItem | null) => void;
}

// --- Tool Subfolder Component ---
export default function ToolSubfolder({
  title,
  tools,
  selectedTool,
  selectToolAndSetView
}: ToolSubfolderProps) {
  const [isOpen, setIsOpen] = useState(title === 'Active'); // Default open for 'Active' category

  // Don't render the subfolder if there are no tools in this category
  if (tools.length === 0) {
    return null;
  }

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="w-full justify-start text-xs h-6 px-1 data-[state=closed]:hover:bg-accent/50 data-[state=open]:text-accent-foreground gap-1">
             <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")} />
            <span className="flex-1 text-left font-medium">{title}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="pl-1">
            {tools.map((tool: SearchApiToolResultItem) => {
              // Get the appropriate icon for this tool
              const IconComponent = getToolIcon(tool);
              return (
                <SidebarMenuItem key={tool.apiToolId}>
                  <SidebarMenuButton
                    data-active={selectedTool?.apiToolId === tool.apiToolId}
                    className={cn(
                      "w-full justify-start text-xs h-6 px-1 gap-1",
                      "hover:text-accent-foreground",
                      "data-[active=true]:text-accent-foreground data-[active=true]:font-semibold"
                    )}
                    onClick={() => selectToolAndSetView(tool)}
                  >
                    <IconComponent className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate flex-1 text-left">{tool.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
} 