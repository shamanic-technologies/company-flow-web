import React from 'react';
import { Card, Metric, Text, Flex, Badge } from '@tremor/react';

// This defines the structure of the 'source' prop for static or dynamic data,
// aligning with the singleValueSourceSchema.
type MetricSource = 
  | { value: string | number; query?: undefined; }
  | { query: string; value?: undefined; };

interface MetricCardProps {
  title: string;
  source: MetricSource;
  data?: Record<string, any>[]; // Injected by DashboardRenderer for dynamic data
  change?: string;
  changeType?: 'positive' | 'negative';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, source, data, change, changeType }) => {
  let displayValue: string | number = 'N/A';
  let previousValue: string | number | undefined = undefined;

  // Case 1: Dynamic data from API query
  if (data && data.length > 0) {
    const firstResult = data[0];
    if (firstResult) {
      const keys = Object.keys(firstResult);
      if (keys.length > 0) {
        displayValue = firstResult[keys[0]];
      }
      // Support for a second column as previous value for trend
      if (keys.length > 1) {
          previousValue = firstResult[keys[1]];
      }
    }
  // Case 2: Static data from configuration
  } else if (source && 'value' in source && source.value !== undefined) {
    displayValue = source.value;
  }
  
  return (
    <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
      <Flex alignItems="start" justifyContent="between">
        <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </Text>
        {change && (
          <Badge 
            size="xs" 
            color={changeType === 'positive' ? 'emerald' : 'red'}
            className="text-xs font-medium"
          >
            {change}
          </Badge>
        )}
      </Flex>
      <Flex
        className="mt-3 space-x-2 truncate"
        justifyContent="start"
        alignItems="baseline"
      >
        <Metric className="text-2xl font-bold text-gray-900 dark:text-gray-50 tabular-nums">
          {displayValue}
        </Metric>
        {previousValue && (
          <Text className="text-xs text-gray-500 dark:text-gray-500 tabular-nums">
            from {previousValue}
          </Text>
        )}
      </Flex>
    </Card>
  );
};