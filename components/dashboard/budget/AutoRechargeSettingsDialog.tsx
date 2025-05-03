/**
 * Auto-Recharge Settings Dialog Component
 * Dialog for configuring automatic recharge settings
 */
import React from 'react';
import { AutoRechargeSettings } from './types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Auto-Recharge Settings Dialog Component Props
 */
export interface AutoRechargeSettingsDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean;
  
  /**
   * Callback when dialog open state changes
   */
  onOpenChange: (open: boolean) => void;
  
  /**
   * Current auto-recharge settings
   */
  settings: AutoRechargeSettings;
  
  /**
   * Callback when settings change
   */
  onSettingsChange: (settings: AutoRechargeSettings) => void;
  
  /**
   * Callback when save button is clicked
   */
  onUpdateSettings: () => Promise<void>;
}

/**
 * Auto-Recharge Settings Dialog Component
 * Displays a dialog for configuring automatic recharge settings
 */
export const AutoRechargeSettingsDialog: React.FC<AutoRechargeSettingsDialogProps> = ({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onUpdateSettings
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle>Auto-Recharge Settings</DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure automatic recharge when your credit balance falls below a threshold.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="auto-recharge" 
              checked={settings.enabled}
              onCheckedChange={(checked) => 
                onSettingsChange({
                  ...settings,
                  enabled: checked === true
                })
              }
              className="data-[state=checked]:bg-blue-600"
            />
            <Label htmlFor="auto-recharge" className="text-gray-300">
              Automatically recharge my card when my credit balance falls below a threshold
            </Label>
          </div>
          
          {settings.enabled && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="threshold-amount" className="text-gray-300">When credit balance goes below ($)</Label>
                <Input 
                  id="threshold-amount"
                  type="number"
                  min="1"
                  max="50"
                  value={settings.thresholdAmount}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    thresholdAmount: parseFloat(e.target.value) || settings.thresholdAmount
                  })}
                  className="bg-gray-800 border-gray-700 text-gray-200"
                />
                <p className="text-xs text-gray-400">Enter an amount between $1 and $50</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="recharge-to-amount" className="text-gray-300">Bring credit balance back up to ($)</Label>
                <Input 
                  id="recharge-to-amount"
                  type="number"
                  min="10"
                  max="200"
                  value={settings.rechargeAmount}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    rechargeAmount: parseFloat(e.target.value) || settings.rechargeAmount
                  })}
                  className="bg-gray-800 border-gray-700 text-gray-200"
                />
                <p className="text-xs text-gray-400">Enter an amount between $10 and $200</p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="text-gray-300 hover:text-gray-100 border-gray-700">
            Cancel
          </Button>
          <Button onClick={onUpdateSettings} className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 