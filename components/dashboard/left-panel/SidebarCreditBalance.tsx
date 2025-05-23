/**
 * Sidebar Credit Balance Component
 * Compact version of credit balance display for sidebar usage
 */
import { usePlanInfo } from '@/hooks/usePlanInfo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, AlertTriangle, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';

interface SidebarCreditBalanceProps {
  className?: string;
}

export function SidebarCreditBalance({ className = '' }: SidebarCreditBalanceProps) {
  const { planInfo, isLoading, error } = usePlanInfo();

  if (error) {
    return (
      <div className={`p-2 bg-red-500/10 border border-red-500/20 rounded-md ${className}`}>
        <div className="flex items-center gap-2 text-red-400">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs">Error loading plan</span>
        </div>
      </div>
    );
  }

  if (isLoading || !planInfo) {
    return (
      <div className={`p-2 bg-muted/50 border border-border/30 rounded-md ${className}`}>
        <div className="flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Loading plan...</span>
        </div>
      </div>
    );
  }

  const { plan, credits, hasActiveSubscription } = planInfo;
  const isLowCredits = credits.balance < 10;
  const planName = plan?.name || 'Free Plan';
  const usagePercentage = credits.monthlyAllocation 
    ? Math.round(((credits.used || 0) / credits.monthlyAllocation) * 100)
    : 0;

  return (
    <div className={`p-2 bg-muted/30 border border-border/30 rounded-md ${className}`}>
      {/* First row: Plan name and status */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-blue-400" />
          <span className="text-xs font-medium text-foreground">{planName}</span>
        </div>
        {hasActiveSubscription && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
            Active
          </Badge>
        )}
      </div>
      
      {/* Second row: Credits and action button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CreditCard className={`h-3 w-3 ${isLowCredits ? 'text-yellow-500' : 'text-green-500'}`} />
          <span className="text-xs font-medium">
            {credits.balance.toLocaleString()}
          </span>
          {credits.monthlyAllocation ? (
            <span className="text-xs text-muted-foreground">
              / {credits.monthlyAllocation.toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">credits</span>
          )}
          {isLowCredits && (
            <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 text-[9px] px-1 py-0 h-3">
              Low
            </Badge>
          )}
        </div>
        
        {(isLowCredits || !hasActiveSubscription) && (
          <Link href="/settings/billing">
            <Button size="sm" variant={isLowCredits ? "default" : "outline"} className="h-5 px-2 text-[10px]">
              {isLowCredits ? 'Add' : 'Upgrade'}
            </Button>
          </Link>
        )}
      </div>
      
      {/* Third row: Usage progress bar (if monthly allocation exists) */}
      {credits.monthlyAllocation && credits.monthlyAllocation > 0 && (
        <div className="mt-1">
          <div className="w-full bg-muted-foreground/20 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all ${
                usagePercentage > 90 ? 'bg-red-500' : 
                usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Fourth row: Next billing or pricing info */}
      <div className="mt-1 pt-1 border-t border-border/20">
        {plan?.nextBilling ? (
          <div className="text-[10px] text-muted-foreground">
            Next: {new Date(plan.nextBilling).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        ) : (
          <div className="text-[10px] text-muted-foreground">
            {hasActiveSubscription ? plan?.price : 'No active plan'}
          </div>
        )}
      </div>
    </div>
  );
} 