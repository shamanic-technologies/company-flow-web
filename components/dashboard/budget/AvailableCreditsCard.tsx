/**
 * Available Credits Card Component
 * Displays available credits and recharge options
 */

import { DollarSign, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AutoRechargeSettings } from './types';

/**
 * Props for the AvailableCreditsCard component
 */
export interface AvailableCreditsCardProps {
  availableCredits: number;
  autoRechargeSettings: AutoRechargeSettings;
  onRechargeClick: () => void;
  onAutoRechargeClick: () => void;
  isLoading?: boolean;
}

/**
 * Available Credits Card Component
 * Displays current credit balance and provides recharge options
 */
export function AvailableCreditsCard({ 
  availableCredits, 
  autoRechargeSettings, 
  onRechargeClick,
  onAutoRechargeClick,
  isLoading = false
}: AvailableCreditsCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">Available Credits</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-100">${availableCredits.toFixed(2)}</div>
        <p className="text-sm text-gray-500 mb-3">Current balance</p>
        
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onRechargeClick}
            disabled={isLoading}
          >
            <DollarSign size={16} className="mr-1" />
            Recharge Credit
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-gray-300 hover:text-gray-100 border-gray-700"
            onClick={onAutoRechargeClick}
            disabled={isLoading}
          >
            <Settings size={16} className="mr-1" />
            Auto-Recharge
          </Button>
        </div>
        
        {autoRechargeSettings.enabled && (
          <div className="mt-3 text-xs text-gray-400 flex items-center">
            <RefreshCw size={12} className="mr-1 text-green-500" />
            Auto-recharge enabled at ${autoRechargeSettings.thresholdAmount.toFixed(2)}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 