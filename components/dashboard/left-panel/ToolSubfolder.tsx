'use client';

import * as React from "react";
import { useState } from 'react';
import { ChevronRight, Package } from "lucide-react"; // Using Package icon for tools
import { cn } from "@/lib/utils";
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

// --- Placeholder ToolItem Interface ---
// This would ideally be in a shared types package like @agent-base/types
export interface ToolItem {
  id: string;
  name: string;
  // providerId?: SomeToolProviderEnum; // Example for future dynamic icons
  status?: 'active' | 'available' | 'beta'; // Example for categorization
}

// --- Helper Function to get Tool Icon ---
// Simplified for now, returns a generic Package icon.
// Could be expanded later to return different icons based on tool properties.
const getToolIcon = (_tool?: ToolItem) => {
  return Package;
};

// --- Props Interface for ToolSubfolder ---
export interface ToolSubfolderProps {
  title: string;
  tools: ToolItem[];
  selectedTool: ToolItem | null;
  selectToolAndSetView: (tool: ToolItem | null) => void;
}

// --- Tool Subfolder Component ---
export default function ToolSubfolder({
  title,
  tools,
  selectedTool,
  selectToolAndSetView
}: ToolSubfolderProps) {
  const [isOpen, setIsOpen] = useState(title === 'Active Tools'); // Default open for a common category e.g. 'Active Tools'

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
            {tools.map((tool: ToolItem) => {
              // Get the appropriate icon for this tool
              const IconComponent = getToolIcon(tool);
              return (
                <SidebarMenuItem key={tool.id}>
                  <SidebarMenuButton
                    data-active={selectedTool?.id === tool.id}
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