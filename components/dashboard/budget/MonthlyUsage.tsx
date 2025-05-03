/**
 * Monthly Usage Component
 * Displays monthly usage data in a bar chart format
 */

import { BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MonthlyUsageData, MonthlyUsageProps } from './types';

/**
 * Monthly Usage Component
 * Displays a bar chart visualization of monthly usage data
 */
export function MonthlyUsage({ monthlyUsageData, maxMonthlyUsage }: MonthlyUsageProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">Monthly Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {!monthlyUsageData.hasData ? (
          <div className="flex flex-col items-center justify-center py-2">
            <BarChart3 className="h-12 w-12 text-gray-600 mb-2" />
            <p className="text-sm text-gray-500">No usage data yet</p>
            <p className="text-xs text-gray-600">Start using the API to see monthly stats</p>
          </div>
        ) : (
          <>
            <div className="h-32 flex items-end justify-between space-x-1">
              {monthlyUsageData.values.map((value, i) => (
                <TooltipProvider key={i}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex flex-col items-center flex-1 group relative">
                        <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium text-white bg-gray-800 px-2 py-1 rounded pointer-events-none">
                          ${value.toFixed(2)}
                        </div>
                        <div 
                          className={`w-full rounded-t ${value > 0 ? 'bg-blue-600 group-hover:bg-blue-500' : 'bg-gray-800'} transition-colors duration-200`} 
                          style={{ 
                            height: `${Math.max(4, (value / maxMonthlyUsage) * 100)}%`,
                            minHeight: value > 0 ? '4px' : '0'
                          }}
                        />
                        <div className="text-xs text-gray-500 mt-1">{monthlyUsageData.months[i]}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-gray-800 text-white border-gray-700">
                      <p className="font-semibold">{monthlyUsageData.months[i]}</p>
                      <p>${value.toFixed(2)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">Last 6 months</span>
              <span className="text-xs text-gray-500">Total: ${monthlyUsageData.values.reduce((sum, v) => sum + v, 0).toFixed(2)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 