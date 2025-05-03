/**
 * Log Row Component
 * 
 * Displays a single log entry in the table
 */
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, formatDistanceToNow } from 'date-fns';
import { ApiLog } from './types';
import { LogDetails } from './LogDetails';

interface LogRowProps {
  log: ApiLog;
  isExpanded: boolean;
  toggleExpansion: () => void;
}

export function LogRow({ log, isExpanded, toggleExpansion }: LogRowProps) {
  const timestamp = new Date(log.timestamp);
  
  // Format method for display
  const getMethodBadge = (method: string) => {
    const methodColors = {
      GET: "bg-blue-600",
      POST: "bg-green-600",
      PUT: "bg-amber-600",
      DELETE: "bg-red-600",
      PATCH: "bg-purple-600"
    };
    
    const color = methodColors[method as keyof typeof methodColors] || "bg-gray-600";
    
    return <Badge className={color}>{method}</Badge>;
  };
  
  // Get status badge color based on status code
  const getStatusBadge = (statusCode: number | undefined) => {
    if (!statusCode) {
      return <Badge className="bg-gray-500">-</Badge>;
    }
    
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-500">{statusCode}</Badge>;
    } else if (statusCode >= 300 && statusCode < 400) {
      return <Badge className="bg-blue-500">{statusCode}</Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge className="bg-amber-500">{statusCode}</Badge>;
    } else {
      return <Badge className="bg-red-500">{statusCode}</Badge>;
    }
  };
  
  return (
    <React.Fragment>
      <TableRow 
        className={`cursor-pointer hover:bg-gray-800/50 ${isExpanded ? 'bg-gray-800/30' : ''}`}
        onClick={toggleExpansion}
      >
        <TableCell className="p-2">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </TableCell>
        <TableCell className="font-mono text-xs">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer">
                  {formatDistanceToNow(timestamp, { addSuffix: true })}
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                {format(timestamp, 'PPpp')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
        <TableCell className="font-mono text-xs truncate max-w-xs">
          {log.endpoint}
        </TableCell>
        <TableCell>
          {getMethodBadge(log.method)}
        </TableCell>
        <TableCell>
          {getStatusBadge(log.status_code)}
        </TableCell>
        <TableCell className="text-right font-mono">
          {log.duration_ms || '-'}
        </TableCell>
      </TableRow>
      
      {/* Expanded detail view */}
      {isExpanded && (
        <TableRow className="bg-gray-800/30">
          <TableCell colSpan={6} className="p-4">
            <LogDetails log={log} />
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
} 