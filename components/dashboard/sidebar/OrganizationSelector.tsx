'use client';

import * as React from "react"
import { useState, useMemo } from 'react';
import { useOrganizationsQuery } from "@/hooks/useOrganizationsQuery"; 
import { ChevronsUpDown, Check, Plus, FolderClosed, Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CreateOrganizationDialog } from "./CreateOrganizationDialog";
import { ClientOrganization } from "@agent-base/types";

interface OrganizationSelectorProps {
  onOrganizationChange?: (orgId: string) => void;
}

export function OrganizationSelector({ 
  onOrganizationChange
}: OrganizationSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Replace the old context with the new React Query hook
  const {
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    switchOrganization,
    isSwitchingOrganization,
  } = useOrganizationsQuery();

  const handleSwitchOrganization = async (org: ClientOrganization) => {
    if (org.id === currentOrganization?.id) return;
    try {
      await switchOrganization(org.id);
      onOrganizationChange?.(org.id);
    } catch (error) {
      console.error("Failed to switch organization", error);
      // Optionally show a toast notification here
    }
  };

  const handleCreateOrganization = () => {
    setIsCreateDialogOpen(true);
  };

  const sortedOrganizations = useMemo(() => {
    return [...organizations].sort((a, b) => {
      if (a.name === 'Personal') return -1;
      if (b.name === 'Personal') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [organizations]);

  if (isLoadingOrganizations) {
    return (
      <div className="flex items-center gap-2 px-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const triggerLabel = currentOrganization?.name 
    ? (currentOrganization.name.length > 20 ? `${currentOrganization.name.substring(0, 18)}...` : currentOrganization.name)
    : "Select Organization";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-10 px-2 group"
            disabled={isSwitchingOrganization}
          >
            <div className="flex items-center gap-2 truncate">
              {currentOrganization ? (
                currentOrganization.name === 'Personal' ? (
                  <FolderClosed className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Building2 className="h-4 w-4 flex-shrink-0" />
                )
              ) : <div className="h-4 w-4" />}
              <span className="truncate text-sm font-medium">{triggerLabel}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" side="bottom">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          {sortedOrganizations.map((org: ClientOrganization) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitchOrganization(org)}
              className="flex items-center gap-2 cursor-pointer text-xs"
              disabled={isSwitchingOrganization}
            >
              <div className="flex h-4 w-4 items-center justify-center">
                {currentOrganization?.id === org.id && <Check className="h-3.5 w-3.5" />}
              </div>
              {org.name === 'Personal' ? (
                <FolderClosed className="h-4 w-4" />
              ) : (
                <Building2 className="h-4 w-4" />
              )}
              <span className="flex-1 truncate">{org.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleCreateOrganization}
            className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Organization</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateOrganizationDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  )
} 