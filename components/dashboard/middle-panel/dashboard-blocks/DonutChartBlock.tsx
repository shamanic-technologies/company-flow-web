import React from 'react';
import { Card, Title, DonutChart } from '@tremor/react';

// Tremor default color palette (exact colors from official dashboard)
const tremrorColors = [
  'blue', 'emerald', 'violet', 'amber', 'gray', 'cyan', 
  'pink', 'lime', 'fuchsia', 'indigo', 'rose', 'yellow'
];

interface DonutChartBlockProps {
  title: string;
  data: any[];
  props: {
    index: string;
    category: string;
    colors?: string[];
  }
}

export const DonutChartBlock: React.FC<DonutChartBlockProps> = ({ title, data, props }) => (
  <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
    <Title className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4">
      {title}
    </Title>
    <div className="flex justify-center">
      <DonutChart 
        data={data || []} 
        index={props.category}
        category={props.index}
        colors={props.colors || tremrorColors}
        variant="donut"
        className="w-40 h-40"
        showLabel={true}
        showTooltip={true}
        valueFormatter={(value: number) => 
          new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(value)
        }
      />
    </div>
  </Card>
); 