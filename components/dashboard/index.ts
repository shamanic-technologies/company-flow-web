/**
 * Dashboard Components
 * 
 * Entry point for all dashboard-related components
 */

// Dashboard components
export { default as WelcomeSection } from './WelcomeSection';
export { default as Header } from './Header';
export { default as Sidebar } from './Sidebar';
export { default as QuickStartGuide } from './QuickStartGuide';
export { default as UtilitiesSection } from './UtilitiesSection';

// Context
export { DashboardProvider, useDashboard } from './context/DashboardContext';

// Export Chat components as a group
export * from './Chat';

// Export utility data
export { utilityCategories } from './utility-data';

// Re-export budget components
export { 
  TransactionHistory,
  MonthlyUsage,
  AvailableCreditsCard,
  RechargeCreditsDialog,
  AutoRechargeSettingsDialog
} from './budget';

