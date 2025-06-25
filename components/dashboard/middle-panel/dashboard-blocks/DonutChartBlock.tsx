import React from 'react';
import { Card, Title, DonutChart, Text, Legend } from '@tremor/react';

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

export const DonutChartBlock: React.FC<DonutChartBlockProps> = ({ title, data, props }) => {
  // Ensure the category value is a number for the chart to render correctly.
  const numericData = (data || []).map(item => ({
    ...item,
    [props.category]: typeof item[props.category] === 'string' 
      ? parseFloat(item[props.category]) 
      : item[props.category]
  }));

  // Sort data to ensure consistent color mapping between chart and legend
  const formattedData = [...numericData].sort((a, b) => 
    String(a[props.index]).localeCompare(String(b[props.index]))
  );

  const hasData = formattedData && formattedData.length > 0;
  const categories = formattedData.map(item => item[props.index]);

  return (
    <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
      <Title className="text-sm font-semibold text-gray-900 dark:text-gray-50">
        {title}
      </Title>
      {hasData ? (
        <div className="flex items-center justify-center space-x-6 h-48">
          <DonutChart 
            data={formattedData} 
            index={props.index}
            category={props.category}
            colors={props.colors || tremrorColors}
            variant="donut"
            className="w-40 h-40"
            showLabel={false}
            showAnimation={true}
          />
          <Legend 
            categories={categories} 
            colors={props.colors || tremrorColors}
            className="max-w-[12rem] text-xs"
          />
        </div>
      ) : (
        <div className="flex justify-center items-center h-48">
          <Text className="text-xs text-gray-500">No data available</Text>
        </div>
      )}
    </Card>
  );
}; 