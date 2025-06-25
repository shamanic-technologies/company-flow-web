import React from 'react';
import { Card, Title, BarChart, Text } from '@tremor/react';

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

export const BarChartBlock: React.FC<BarChartBlockProps> = ({ title, data, props }) => {
  // Ensure all category values are numbers for the chart to render correctly.
  const formattedData = (data || []).map(item => {
    const newItem = { ...item };
    props.categories.forEach(cat => {
      if (typeof newItem[cat] === 'string') {
        newItem[cat] = parseFloat(newItem[cat]);
      }
    });
    return newItem;
  });

  const hasData = formattedData && formattedData.length > 0;

  return (
    <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
      <Title className="text-sm font-semibold text-gray-900 dark:text-gray-50 mb-4">
        {title}
      </Title>
      <div className="h-80">
        {hasData ? (
          <BarChart 
            data={formattedData} 
            index={props.index} 
            categories={props.categories} 
            colors={props.colors || tremrorColors}
            className="text-xs [&_.tremor-Legend-text]:text-gray-500 [&_.tremor-Legend-text]:dark:text-gray-400"
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
        ) : (
          <div className="flex justify-center items-center h-full">
            <Text className="text-xs text-gray-500">No data available</Text>
          </div>
        )}
      </div>
    </Card>
  );
}; 