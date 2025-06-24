import React from 'react';
import { Card, Title, Text, Metric, Flex } from '@tremor/react';

interface DetailsCardItem {
  label: string;
  value: string;
}

interface DetailsCardProps {
  title: string;
  text: string;
  metric: string;
  items: DetailsCardItem[];
}

export const DetailsCard: React.FC<DetailsCardProps> = ({ title, text, metric, items }) => (
  <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
    <Title className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1">
      {title}
    </Title>
    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-3">
      {text}
    </Text>
    <Metric className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4 tabular-nums">
      {metric}
    </Metric>
    <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
      {items?.map((item, index) => (
        <Flex key={index} className="justify-between">
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            {item.label}
          </Text>
          <Text className="text-xs font-medium text-gray-900 dark:text-gray-50 tabular-nums">
            {item.value}
          </Text>
        </Flex>
      ))}
    </div>
  </Card>
); 