'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { 
  TransactionHistory,
  MonthlyUsage,
  AvailableCreditsCard,
  RechargeCreditsDialog,
  AutoRechargeSettingsDialog,
} from '@/components/dashboard';
import { 
  Transaction,
  BillingData,
  AutoRechargeSettings,
  formatDate,
  getTypeBadge,
  getUserInitials,
  getMonthlyUsageData,
  calculateEstimatedRunway,
  fetchBillingData,
  saveAutoRechargeSettings as saveAutoRechargeSettingsAPI,
  processManualRecharge,
  updateAutoRechargeSettings
} from '@/components/dashboard/budget';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { Badge } from "@/components/ui/badge";

/**
 * Budget Page Content Component
 */
function BudgetPageContent() {
  const router = useRouter();
  const { user, isLoading, error } = useDashboard();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null); // Define local error state
  
  // Auto-recharge state
  const [autoRechargeSettings, setAutoRechargeSettings] = useState<AutoRechargeSettings>({
    enabled: false,
    thresholdAmount: 5,
    rechargeAmount: 10
  });
  const [tempAutoRechargeSettings, setTempAutoRechargeSettings] = useState<AutoRechargeSettings>({
    enabled: false,
    thresholdAmount: 5,
    rechargeAmount: 10
  });
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [autoRechargeDialogOpen, setAutoRechargeDialogOpen] = useState(false);
  const [manualRechargeAmount, setManualRechargeAmount] = useState(10);
  
  // Calculate total credits (available and used)
  const availableCredits = billingData?.credit?.available || 0;
  const usedCredits = billingData?.credit?.used || 0;
  const totalCreditHistory = billingData?.transactions?.length || 0;
  
  // Count different types of transactions
  const creditTransactions = billingData?.transactions?.filter(tx => tx.type === 'credit')?.length || 0;
  const debitTransactions = billingData?.transactions?.filter(tx => tx.type === 'debit')?.length || 0;
  
  // Calculate the monthly budget percentage (assuming $5 monthly budget)
  const monthlyBudget = 5.00;
  const budgetPercentage = monthlyBudget > 0 ? Math.min(100, ((usedCredits / monthlyBudget) * 100)) || 0 : 0;
  
  // Calculate monthly usage data for bar chart
  const monthlyUsageData = getMonthlyUsageData(billingData?.transactions);
  const maxMonthlyUsage = Math.max(...monthlyUsageData.values, 0.01); // Avoid division by zero
  
  // Calculate estimated runway
  const runway = calculateEstimatedRunway(availableCredits, billingData?.transactions);
  
  // Handle logout
  const handleLogout = () => {
    router.push('/');
  };

  // Refresh data function
  const refreshData = async () => {
    await fetchBillingData(
      setLoading,
      setLocalError, // Use the local error state setter
      (data, settings) => {
        setBillingData(data);
        setAutoRechargeSettings(settings);
        setTempAutoRechargeSettings(settings);
      }
    );
  };

  // Fetch billing data
  useEffect(() => {
    const fetchData = async () => {
      // Wait for user data to be loaded
      if (isLoading) {
        return;
      }

      await refreshData();
    };

    fetchData();
    // Refresh data every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle saving auto-recharge settings
  const handleSaveAutoRechargeSettings = async () => {
    const success = await saveAutoRechargeSettingsAPI(
      tempAutoRechargeSettings,
      setLoading,
      setLocalError,
      () => {
        setAutoRechargeSettings(tempAutoRechargeSettings);
        setAutoRechargeDialogOpen(false);
        refreshData();
      }
    );
  };
  
  // Handle manual recharge
  const handleManualRecharge = async () => {
    // Close dialog first for better UX
    setRechargeDialogOpen(false);
    
    const success = await processManualRecharge(
      manualRechargeAmount,
      setLoading,
      setLocalError,
      (checkoutUrl) => {
        // If we have a checkout URL from the response, redirect to it
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          // Show error if no checkout URL was provided
          toast({
            title: 'Checkout Error',
            description: 'Unable to redirect to payment page. Please try again.',
            variant: 'destructive',
          });
          // Refresh the data in case something changed
          refreshData();
        }
      }
    );
  };

  // Handler for opening recharge dialog
  const handleRechargeClick = () => {
    setRechargeDialogOpen(true);
  };

  // Handler for opening auto-recharge settings dialog
  const handleAutoRechargeClick = () => {
    setTempAutoRechargeSettings(autoRechargeSettings);
    setAutoRechargeDialogOpen(true);
  };

  // Handle recharge request
  const handleRecharge = async () => {
    try {
      // First save auto-recharge settings if they were modified
      if (tempAutoRechargeSettings.enabled !== autoRechargeSettings.enabled ||
          tempAutoRechargeSettings.thresholdAmount !== autoRechargeSettings.thresholdAmount ||
          tempAutoRechargeSettings.rechargeAmount !== autoRechargeSettings.rechargeAmount) {
        await updateAutoRechargeSettings(tempAutoRechargeSettings);
      }
      
      // Trigger manual recharge which will redirect to Stripe Checkout
      await handleManualRecharge();
    } catch (err) {
      console.error('Error during recharge:', err);
      toast({
        title: 'Recharge Failed',
        description: 'There was an error processing your payment. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle auto-recharge settings update
  const handleUpdateAutoRechargeSettings = async () => {
    try {
      await updateAutoRechargeSettings(tempAutoRechargeSettings);
      
      // Refresh data
      await refreshData();
      
      // Reset dialog state
      setAutoRechargeDialogOpen(false);
      
      toast({
        title: 'Settings Saved',
        description: 'Your auto-recharge settings have been updated.',
      });
    } catch (err) {
      console.error('Error updating auto-recharge settings:', err);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your settings. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle UI transitions during loading and errors
  if (isLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || localError) {
    return (
      <div className="p-4 flex-1 text-center">
        <h2 className="text-xl font-semibold mb-2 text-red-500">Error</h2>
        <p className="text-gray-400 mb-4">{error || localError}</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-4 flex-1 text-center">
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-gray-400 mb-4">Please log in to view your billing information.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-100">Budget</h1>
        <p className="text-gray-400">Manage your credits and view usage</p>
      </div>
      
      <div className="flex-1 overflow-auto space-y-6">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AvailableCreditsCard 
            availableCredits={availableCredits}
            autoRechargeSettings={autoRechargeSettings}
            onRechargeClick={handleRechargeClick}
            onAutoRechargeClick={handleAutoRechargeClick}
            isLoading={loading}
          />
          
          <MonthlyUsage
            monthlyUsageData={monthlyUsageData}
            maxMonthlyUsage={maxMonthlyUsage}
          />
          
          <TransactionHistory 
            transactions={billingData?.transactions || []}
            loading={loading}
            error={localError}
            refreshData={refreshData}
          />
        </div>
      </div>

      {/* Recharge Dialog */}
      <RechargeCreditsDialog
        open={rechargeDialogOpen}
        onOpenChange={setRechargeDialogOpen}
        amount={manualRechargeAmount}
        onAmountChange={setManualRechargeAmount}
        onRecharge={handleRecharge}
        tempSettings={tempAutoRechargeSettings}
        onTempSettingsChange={setTempAutoRechargeSettings}
      />
      
      {/* Auto-Recharge Settings Dialog */}
      <AutoRechargeSettingsDialog
        open={autoRechargeDialogOpen}
        onOpenChange={setAutoRechargeDialogOpen}
        settings={tempAutoRechargeSettings}
        onSettingsChange={setTempAutoRechargeSettings}
        onUpdateSettings={handleUpdateAutoRechargeSettings}
      />
    </>
  );
}

/**
 * Budget Page
 * Wrapper with Suspense for the main content
 */
export default function BudgetPage() {
  return (
    <Suspense fallback={<BudgetPageLoadingSkeleton />}>
      <BudgetPageContent />
    </Suspense>
  );
}

// Optional: Define a simple loading skeleton component
function BudgetPageLoadingSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
} 