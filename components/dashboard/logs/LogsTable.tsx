/**
 * Logs Table Component
 * 
 * Displays a table of API logs with expandable rows
 */
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ApiLog } from './types';
import { LogRow } from './LogRow';

interface LogsTableProps {
  logs: ApiLog[];
  loading: boolean;
  error: string | null;
}

export function LogsTable({ logs, loading, error }: LogsTableProps) {
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  // Toggle expanded state of a log entry
  const toggleLogExpansion = (logId: string) => {
    setExpandedLogIds(prevState => {
      const newState = new Set(prevState);
      if (newState.has(logId)) {
        newState.delete(logId);
      } else {
        newState.add(logId);
      }
      return newState;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <TooltipProvider>
      <ScrollArea className="h-[calc(100vh-220px)]">
        <Table>
          <TableHeader className="bg-gray-900 sticky top-0">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-44">Timestamp</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead className="w-24">Method</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32 text-right">Duration (ms)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <LogRow 
                key={log.id}
                log={log}
                isExpanded={expandedLogIds.has(log.id)}
                toggleExpansion={() => toggleLogExpansion(log.id)}
              />
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </TooltipProvider>
  );
} 