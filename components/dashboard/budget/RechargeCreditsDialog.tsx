/**
 * Recharge Credits Dialog Component
 * Dialog for adding credits to user account
 */
import React, { useState } from 'react';
import { AutoRechargeSettings } from './types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { CreditCard } from 'lucide-react';

/**
 * Props for the RechargeCreditsDialog component
 */
export interface RechargeCreditsDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Callback when dialog open state changes
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Current recharge amount
   */
  amount: number;
  
  /**
   * Callback when amount changes
   */
  onAmountChange: (amount: number) => void;
  
  /**
   * Temporary auto-recharge settings
   */
  tempSettings: AutoRechargeSettings;
  
  /**
   * Callback when temporary auto-recharge settings change
   */
  onTempSettingsChange: (settings: AutoRechargeSettings) => void;
  
  /**
   * Callback when recharge button is clicked
   */
  onRecharge: () => Promise<void>;
}

/**
 * Recharge Credits Dialog Component
 * Displays a dialog for adding credits to the user's account
 */
export const RechargeCreditsDialog: React.FC<RechargeCreditsDialogProps> = ({
  open,
  onOpenChange,
  amount,
  onAmountChange,
  tempSettings,
  onTempSettingsChange,
  onRecharge
}) => {
  // State for error handling
  const [error, setError] = useState<string | null>(null);
  
  // Reset state when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      // Reset error state when dialog closes
      setTimeout(() => {
        setError(null);
      }, 300); // Delay to allow for close animation
    }
  };
  
  // Handle auto-recharge toggle
  const handleAutoRechargeToggle = (checked: boolean) => {
    onTempSettingsChange({
      ...tempSettings,
      enabled: checked === true,
      // If enabling auto-recharge, set the recharge amount to match manual amount
      rechargeAmount: checked === true ? amount : tempSettings.rechargeAmount
    });
  };
  
  // Handle payment initiation
  const handleProceedToCheckout = async () => {
    setError(null);
    try {
      // Close dialog first for better UX
      handleOpenChange(false);
      // Call the onRecharge callback which will redirect to Stripe Checkout
      await onRecharge();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle>Recharge Credits</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add funds to your account to continue using the API.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recharge-amount" className="text-gray-300">Amount to add ($)</Label>
            <Input 
              id="recharge-amount" 
              type="number" 
              min="5" 
              value={amount}
              onChange={(e) => onAmountChange(parseFloat(e.target.value) || 10)}
              className="bg-gray-800 border-gray-700 text-gray-200" 
            />
            <p className="text-xs text-gray-400">Minimum recharge amount: $5.00</p>
          </div>
          
          <Separator className="bg-gray-800 my-2" />
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="auto-recharge-in-dialog" 
              checked={tempSettings.enabled}
              onCheckedChange={handleAutoRechargeToggle}
              className="data-[state=checked]:bg-blue-600"
            />
            <Label htmlFor="auto-recharge-in-dialog" className="text-gray-300">
              Set up auto-recharge to avoid interruptions
            </Label>
          </div>
          
          {tempSettings.enabled && (
            <div className="pl-6 space-y-4 border-l-2 border-gray-800">
              <div className="grid gap-2">
                <Label htmlFor="threshold-amount-in-dialog" className="text-gray-300">When credit balance goes below ($)</Label>
                <Input 
                  id="threshold-amount-in-dialog"
                  type="number"
                  min="1"
                  max="50"
                  value={tempSettings.thresholdAmount}
                  onChange={(e) => onTempSettingsChange({
                    ...tempSettings,
                    thresholdAmount: parseFloat(e.target.value) || tempSettings.thresholdAmount
                  })}
                  className="bg-gray-800 border-gray-700 text-gray-200"
                />
                <p className="text-xs text-gray-400">Enter an amount between $1 and $50</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="recharge-to-amount-in-dialog" className="text-gray-300">Bring credit balance back up to ($)</Label>
                <Input 
                  id="recharge-to-amount-in-dialog"
                  type="number"
                  min="10"
                  max="200"
                  value={tempSettings.rechargeAmount}
                  onChange={(e) => onTempSettingsChange({
                    ...tempSettings,
                    rechargeAmount: parseFloat(e.target.value) || tempSettings.rechargeAmount
                  })}
                  className="bg-gray-800 border-gray-700 text-gray-200"
                />
                <p className="text-xs text-gray-400">Enter an amount between $10 and $200</p>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={() => handleOpenChange(false)} className="text-gray-300 hover:text-gray-100 border-gray-700">
            Cancel
          </Button>
          
          <Button onClick={handleProceedToCheckout} className="bg-blue-600 hover:bg-blue-700 text-white">
            <CreditCard className="mr-2 h-4 w-4" />
            Checkout with Stripe
          </Button>
        </DialogFooter>
        
        {error && (
          <div className="mt-4 text-red-500 text-sm">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 