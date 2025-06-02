'use client';

import * as React from "react"
import { useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { Building2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast";
import { ClientOrganization } from "@agent-base/types";

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizationCreated?: (organization: any) => void;
}

/**
 * Modern organization creation dialog
 * 
 * Features:
 * - Clean, minimal design inspired by Stripe/Airbnb
 * - Form validation and loading states
 * - Responsive design
 * - Accessibility compliant
 * - Uses Clerk to create organizations
 */
export function CreateOrganizationDialog({ 
  open, 
  onOpenChange, 
  onOrganizationCreated 
}: CreateOrganizationDialogProps) {
  const { createOrganization, setActive } = useClerk();
  const [formData, setFormData] = useState({
    name: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Organization name must be at least 2 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({});
    
    try {
      if (!createOrganization || !setActive) {
        toast({
          title: "Error",
          description: "Clerk is not ready. Please try again shortly.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const organizationName = formData.name.trim();

      // Create organization using Clerk
      const newClerkOrg = await createOrganization({ name: organizationName });

      if (!newClerkOrg || !newClerkOrg.id) {
        throw new Error("Organization creation failed or returned no ID.");
      }

      console.log('Clerk: Organization created:', newClerkOrg);

      // Set the new organization as active
      await setActive({ organization: newClerkOrg.id });
      console.log('Clerk: Set new organization as active:', newClerkOrg.id);
      
      // Call the callback with the new organization data from Clerk
      if (onOrganizationCreated) {
        onOrganizationCreated(newClerkOrg);
      }

      toast({
        title: "Organization Created",
        description: `Successfully created and switched to ${organizationName}.`,
      });

      // Reset form and close dialog
      setFormData({ name: '' })
      onOpenChange(false)
      
    } catch (error: any) {
      console.error('Error creating organization with Clerk:', error);
      const errorMessage = error.errors?.[0]?.message || error.message || 'Failed to create organization. Please try again.';
      setErrors({ general: errorMessage });
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({ name: '' })
    setErrors({})
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-medium flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Add Organization
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create a new organization to organize your work.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          {errors.general && (
            <div className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
              {errors.general}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="org-name" className="text-xs font-medium">
              Organization Name
            </Label>
            <Input
              id="org-name"
              placeholder="Acme Corp"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              className={`h-8 text-xs placeholder:text-xs ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="h-8 text-xs flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="h-8 text-xs flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Organization'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateOrganizationDialog; 