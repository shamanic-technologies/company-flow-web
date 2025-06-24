import React from 'react';
import { Card, Metric, Text, Flex, Badge } from '@tremor/react';

interface MetricCardProps {
  title: string;
  source: {
    value?: string | number;
    previousValue?: string | number;
  };
  change?: string;
  changeType?: 'positive' | 'negative';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, source, change, changeType }) => (
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
        {source?.value || 'N/A'}
      </Metric>
      {source?.previousValue && (
        <Text className="text-xs text-gray-500 dark:text-gray-500 tabular-nums">
          from {source.previousValue}
        </Text>
      )}
    </Flex>
  </Card>
);