'use client';

import * as React from "react"
import { useState } from 'react';
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
 */
export function CreateOrganizationDialog({ 
  open, 
  onOpenChange, 
  onOrganizationCreated 
}: CreateOrganizationDialogProps) {
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
    
    try {
      // Simulate API call - replace with actual organization creation logic
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newOrganization = {
        id: `org-${Date.now()}`,
        name: formData.name.trim(),
        type: 'organization' as const,
        createdAt: new Date().toISOString(),
      }

      // TODO: Replace with actual API call
      console.log('Creating organization:', newOrganization)
      
      // Call the callback with the new organization
      if (onOrganizationCreated) {
        onOrganizationCreated(newOrganization)
      }

      // Reset form and close dialog
      setFormData({ name: '' })
      setErrors({})
      onOpenChange(false)
      
    } catch (error) {
      console.error('Error creating organization:', error)
      setErrors({ general: 'Failed to create organization. Please try again.' })
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