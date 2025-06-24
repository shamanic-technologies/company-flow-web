'use client';

import React from 'react';
import { DashboardLayout, DashboardBlockConfig } from '@agent-base/types';
import { Card, Text, Title } from '@tremor/react';

import { useDashboardBlockQuery } from '@/hooks/useDashboardBlockQuery';
import { MetricCard } from './dashboard-blocks/MetricCard';
import { UsageCard } from './dashboard-blocks/UsageCard';
import { DetailsCard } from './dashboard-blocks/DetailsCard';
import { LineChartBlock } from './dashboard-blocks/LineChartBlock';
import { BarChartBlock } from './dashboard-blocks/BarChartBlock';
import { DonutChartBlock } from './dashboard-blocks/DonutChartBlock';
import { TableBlock } from './dashboard-blocks/TableBlock';
import { CalloutBlock } from './dashboard-blocks/CalloutBlock';
import { TextBlock } from './dashboard-blocks/TextBlock';
import { GridBlock } from './dashboard-blocks/GridBlock';
import { DashboardBlockQueryProvider } from '../context/DashboardBlockQueryProvider';

// --- Block Component Mapper ---
const BlockComponentMapper: { [key: string]: React.FC<any> } = {
  MetricCard,
  UsageCard,
  DetailsCard,
  LineChart: LineChartBlock,
  BarChart: BarChartBlock,
  DonutChart: DonutChartBlock,
  Table: TableBlock,
  Text: TextBlock,
  Callout: CalloutBlock,
  Grid: GridBlock,
};

// --- Single Block Renderer ---
const Block = ({ config }: { config: DashboardBlockConfig }) => {
  const { data, loading, error } = useDashboardBlockQuery(config);

  const Component = BlockComponentMapper[config.type];

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-950 border border-red-200 dark:border-red-800 shadow-sm">
        <Title className="text-sm font-medium text-red-700 dark:text-red-300">
          Error loading block
        </Title>
        <Text className="text-xs text-red-600 dark:text-red-400 mt-1">
          {error}
        </Text>
      </Card>
    );
  }

  if (!Component) {
    return (
      <Card className="bg-white dark:bg-gray-950 border border-red-200 dark:border-red-800 shadow-sm">
        <Title className="text-sm font-medium text-red-700 dark:text-red-300">
          Unknown block type: {config.type}
        </Title>
        <Text className="text-xs text-red-600 dark:text-red-400 mt-1">
          This block type is not supported.
        </Text>
      </Card>
    );
  }
  
  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm animate-pulse">
        <Title className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
          {'title' in config ? config.title : 'Loading...'}
        </Title>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded"></div>
        </div>
      </Card>
    );
  }

  const children = 'children' in config && config.children?.map((childConfig: DashboardBlockConfig, index: number) => 
    <Block key={index} config={childConfig} />
  );

  return <Component {...config} data={data}>{children}</Component>;
};

// --- Main Dashboard Renderer ---
interface DashboardRendererProps {
  layout: DashboardLayout;
}

export function DashboardRenderer({ layout }: DashboardRendererProps) {
  if (!layout || !layout.children) {
    return (
      <Card className="bg-white dark:bg-gray-950 border border-yellow-200 dark:border-yellow-800 shadow-sm">
        <Title className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
          Invalid Dashboard Layout
        </Title>
        <Text className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
          The dashboard configuration is missing or invalid.
        </Text>
      </Card>
    );
  }
  
  return (
    <DashboardBlockQueryProvider>
      <Block config={layout} />
    </DashboardBlockQueryProvider>
  );
} 