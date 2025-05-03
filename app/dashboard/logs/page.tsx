'use client';

/**
 * API Logs Page
 * Displays API usage logs for the current user
 * Uses the dashboard context for user data
 */
import { Loader2, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import { LogsTable } from '@/components/dashboard/logs/LogsTable';
import { useLogs } from '@/components/dashboard/logs/useLogs';

export default function LogsPage() {
  const { isLoading: isUserLoading } = useDashboard();
  const { logs, loading, error } = useLogs(isUserLoading);
  
  // Show loading state while user data is being fetched
  if (isUserLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-100">API Usage Logs</h1>
        <p className="text-gray-400">Monitor your API activity and requests</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Card>
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="flex items-center">
              <Terminal className="mr-2 h-5 w-5" />
              API Usage Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LogsTable logs={logs} loading={loading} error={error} />
          </CardContent>
        </Card>
      </div>
    </>
  );
} 