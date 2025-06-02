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

// Organization type definition
type Organization = {
  id: string;
  name: string;
  type: 'personal' | 'organization';
  description?: string;
  createdAt?: string;
}

// Mock organizations data - replace with actual data from your backend
const mockOrganizations: Organization[] = [
  {
    id: 'personal',
    name: 'Personal',
    type: 'personal',
  },
  {
    id: 'acme-corp',
    name: 'Acme Corp',
    type: 'organization',
  },
  {
    id: 'startup-inc',
    name: 'Startup Inc',
    type: 'organization',
  },
  {
    id: 'techflow-ai',
    name: 'TechFlow AI',
    type: 'organization',
  },
]

interface OrganizationSelectorProps {
  onOrganizationChange?: (organization: Organization) => void;
  onCreateOrganization?: () => void;
}

/**
 * Modern organization selector component with create functionality
 * Integrates seamlessly with the existing sidebar design system
 * 
 * Features:
 * - Switch between personal and organization workspaces
 * - Create new organizations with modal dialog
 * - Visual distinction between personal and organization types
 * - Responsive design with proper hover states
 * - Keyboard navigation support
 * - Toast notifications for user feedback
 */
export function OrganizationSelector({ 
  onOrganizationChange, 
  onCreateOrganization 
}: OrganizationSelectorProps) {
  const [selectedOrg, setSelectedOrg] = useState<Organization>(mockOrganizations[0])
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations)
  const [isOpen, setIsOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const handleCreateOrganization = () => {
    setIsOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleOrganizationCreated = (newOrganization: Organization) => {
    // Add the new organization to the list
    setOrganizations(prev => [...prev, newOrganization])
    
    // Automatically switch to the new organization
    setSelectedOrg(newOrganization)
    
    // Show success toast
    toast({
      title: 'Organization created successfully!',
      description: `Welcome to ${newOrganization.name}. You can now start organizing your work.`,
    })

    // Call the callback if provided
    if (onOrganizationChange) {
      onOrganizationChange(newOrganization);
    }

    // Call the create callback if provided
    if (onCreateOrganization) {
      onCreateOrganization();
    }
  }

  const handleSwitchOrganization = (org: Organization) => {
    const previousOrg = selectedOrg
    setSelectedOrg(org)
    setIsOpen(false)
    
    // Show switch confirmation toast
    if (org.id !== previousOrg.id) {
      toast({
        title: `Switched to ${org.name}`,
        description: `You're now working in ${org.type === 'personal' ? 'your personal workspace' : org.name}.`,
      })
    }
    
    if (onOrganizationChange) {
      onOrganizationChange(org);
    } else {
      // Default behavior - you can customize this
      console.log('Switched to organization:', org.name);
      // TODO: Implement organization switching logic (context update, API calls, etc.)
    }
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
              {selectedOrg.type === 'personal' ? (
                <FolderClosed className="h-4 w-4 shrink-0" />
              ) : (
                <Building2 className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{selectedOrg.name}</span>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start" side="bottom">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
            Organizations
          </DropdownMenuLabel>
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSwitchOrganization(org)}
              className="flex items-center gap-2 cursor-pointer text-xs"
            >
              <div className="flex h-4 w-4 items-center justify-center">
                {selectedOrg.id === org.id && <Check className="h-3.5 w-3.5" />}
              </div>
              {org.type === 'personal' ? (
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
        onOrganizationCreated={handleOrganizationCreated}
      />
    </>
  )
}

export default OrganizationSelector; 