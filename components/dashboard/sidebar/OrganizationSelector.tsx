'use client';

import * as React from "react"
import { useState } from 'react';
import {
  Plus,
  Building2,
  Check,
  ChevronsUpDown,
  FolderClosed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { CreateOrganizationDialog } from './CreateOrganizationDialog'
import { toast } from "@/hooks/use-toast"
import { useOrganizationContext } from '../context/OrganizationProvider';
import { ClientOrganization } from '@agent-base/types'

interface OrganizationSelectorProps {
  onOrganizationChange?: (organization: ClientOrganization) => void;
}

/**
 * Modern organization selector component with create functionality
 * Integrates seamlessly with the existing sidebar design system
 * 
 * Features:
 * - Switch between personal and organization workspaces using real Clerk data
 * - Create new organizations with modal dialog
 * - Visual distinction between personal and organization types
 * - Responsive design with proper hover states
 * - Keyboard navigation support
 * - Toast notifications for user feedback
 * - Integration with DashboardContext for real organization management
 */
export function OrganizationSelector({ 
  onOrganizationChange
}: OrganizationSelectorProps) {
  const {
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    organizationError,
    switchOrganization,
  } = useOrganizationContext();

  const [isOpen, setIsOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateOrganization = () => {
    setIsOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleSwitchOrganization = async (org: ClientOrganization) => {
    if (!org.clientAuthOrganizationId) {
      console.error('[OrganizationSelector] Organization missing clientAuthOrganizationId:', org);
      toast({
        title: 'Error switching organization',
        description: 'Organization ID not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    const previousOrg = currentOrganization;
    setIsOpen(false);
    
    try {
      await switchOrganization(org.clientAuthOrganizationId);
      
      // Show switch confirmation toast
      if (!previousOrg || org.clientAuthOrganizationId !== previousOrg.clientAuthOrganizationId) {
        toast({
          title: `Switched to ${org.name}`,
          description: `You're now working in ${org.name === 'Personal' ? 'your personal workspace' : org.name}.`,
        });
      }
      
      if (onOrganizationChange) {
        onOrganizationChange(org);
      }
      
    } catch (error: any) {
      console.error('[OrganizationSelector] Error switching organization:', error);
      toast({
        title: 'Failed to switch organization',
        description: 'There was an error switching organizations. Please try again.',
        variant: 'destructive',
      });
    }
  }

  // Show loading state
  if (isLoadingOrganizations) {
    return (
      <Button
        variant="ghost"
        disabled
        className="group flex h-9 w-full items-center justify-between rounded-md border border-dashed border-border/70 px-3 text-xs font-medium text-muted-foreground opacity-50"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FolderClosed className="h-4 w-4 shrink-0" />
          <span className="truncate">Loading...</span>
        </div>
      </Button>
    );
  }

  // Show error state
  if (organizationError) {
    return (
      <Button
        variant="ghost"
        disabled
        className="group flex h-9 w-full items-center justify-between rounded-md border border-dashed border-border/70 px-3 text-xs font-medium text-destructive opacity-75"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FolderClosed className="h-4 w-4 shrink-0" />
          <span className="truncate">Error loading organizations</span>
        </div>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group flex h-9 w-full items-center justify-between rounded-md border border-dashed border-border/70 px-3 text-xs font-medium text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border focus-visible:ring-inset transition-colors"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              {currentOrganization?.name === 'Personal' ? (
                <FolderClosed className="h-4 w-4 shrink-0" />
              ) : (
                <Building2 className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">
                {currentOrganization?.name || 'Select Organization'}
              </span>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" side="bottom">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          {organizations.map((org: ClientOrganization) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitchOrganization(org)}
              className="flex items-center gap-2 cursor-pointer text-xs"
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

export default OrganizationSelector; 