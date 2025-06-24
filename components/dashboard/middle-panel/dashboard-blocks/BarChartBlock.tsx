import React from 'react';
import { Card, Title, BarChart } from '@tremor/react';

// Tremor default color palette (exact colors from official dashboard)
const tremrorColors = [
  'blue', 'emerald', 'violet', 'amber', 'gray', 'cyan', 
  'pink', 'lime', 'fuchsia', 'indigo', 'rose', 'yellow'
];

interface BarChartBlockProps {
  title: string;
  data: any[];
  props: {
    index: string;
    categories: string[];
    colors?: string[];
  }
}

export const BarChartBlock: React.FC<BarChartBlockProps> = ({ title, data, props }) => (
  <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
    <Title className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4">
      {title}
    </Title>
    <BarChart 
      data={data || []} 
      index={props.index} 
      categories={props.categories} 
      colors={props.colors || tremrorColors}
      className="h-80 text-xs"
      showLegend={true}
      showXAxis={true}
      showYAxis={true}
      showGridLines={true}
      layout="vertical"
      valueFormatter={(value: number) => 
        new Intl.NumberFormat('en-US', {
          notation: 'compact',
          maximumFractionDigits: 1
        }).format(value)
      }
      yAxisWidth={48}
    />
  </Card>
); 