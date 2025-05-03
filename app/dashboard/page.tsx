'use client';

import { 
  WelcomeSection
} from '../../components/dashboard';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';

/**
 * Professional Dashboard Page
 * Displays welcome information and getting started guide
 * Uses the dashboard context for user data
 */
export default function Dashboard() {
  const { user } = useDashboard();

  return (
    /* Welcome Section */
    <WelcomeSection userId={user?.id} />
  );
} 