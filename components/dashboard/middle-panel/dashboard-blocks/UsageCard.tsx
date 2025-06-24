import React from 'react';
import { Card, Title, Text, Flex, ProgressBar } from '@tremor/react';

interface UsageCardItem {
  label: string;
  value: string;
  percentage: number;
  color: any;
}

interface UsageCardProps {
  title: string;
  text: string;
  items: UsageCardItem[];
}

export const UsageCard: React.FC<UsageCardProps> = ({ title, text, items }) => (
  <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
    <Title className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-1">
      {title}
    </Title>
    <Text className="text-xs text-gray-600 dark:text-gray-400 mb-4">
      {text}
    </Text>
    <div className="space-y-3">
      {items?.map((item, index) => (
        <div key={index} className="space-y-2">
          <Flex className="justify-between">
            <Text className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
              {item.label}
            </Text>
            <Text className="text-xs font-medium text-gray-900 dark:text-gray-50 tabular-nums">
              {item.value}
            </Text>
          </Flex>
          <ProgressBar 
            value={item.percentage} 
            color={item.color} 
            className="h-2"
          />
        </div>
      ))}
    </div>
  </Card>
); 