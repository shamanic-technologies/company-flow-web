'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout, DashboardBlockConfig } from '@agent-base/types';
import { Card, Title, Text, Metric, Grid, BarChart, DonutChart, Callout, LineChart } from '@tremor/react';
import { useAuth } from '@clerk/nextjs';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const defaultColors = ['blue', 'green', 'yellow', 'red', 'purple', 'indigo'];

// --- Block Component Mapper ---
const BlockComponentMapper: { [key: string]: React.FC<any> } = {
  MetricCard: ({ title, source, change, changeType }) => (
    <Card>
      <Title>{title}</Title>
      <Metric>{source?.value || 'N/A'}</Metric>
      {change && <Text className={`mt-2 ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>{change}</Text>}
    </Card>
  ),
  LineChart: ({ title, data, props }) => (
    <Card>
      <Title>{title}</Title>
      <LineChart data={data || []} index={props.index} categories={props.categories} colors={props.colors || defaultColors} />
    </Card>
  ),
  BarChart: ({ title, data, props }) => (
    <Card>
      <Title>{title}</Title>
      <BarChart data={data || []} index={props.index} categories={props.categories} colors={props.colors || defaultColors} />
    </Card>
  ),
  DonutChart: ({ title, data, props }) => (
    <Card>
      <Title>{title}</Title>
      <DonutChart data={data || []} index={props.index} category={props.category} colors={props.colors || defaultColors} />
    </Card>
  ),
  Table: ({ title, data }) => (
    <Card>
      <Title>{title}</Title>
      <pre className="text-xs mt-4 p-2 bg-gray-100 rounded">{JSON.stringify(data, null, 2)}</pre>
    </Card>
  ),
  Text: ({ content, props }) => <p className={props?.className}>{content}</p>,
  Callout: ({ title, content, props }) => (
    <Callout
      className="mt-4"
      title={title}
      icon={props?.icon === 'Info' ? CheckCircleIcon : ExclamationTriangleIcon}
      color={props?.color || 'blue'}
    >
      {content}
    </Callout>
  ),
  Grid: ({ children, props }) => (
    <Grid {...props}>{children}</Grid>
  ),
};

// --- Single Block Renderer ---
const Block = ({ config }: { config: DashboardBlockConfig }) => {
  const [data, setData] = useState<any[] | null>(() => {
    if ('source' in config && config.source && 'data' in config.source && config.source.data) {
        return config.source.data;
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    if ('source' in config && config.source?.query) {
      setLoading(true);
      const fetchData = async () => {
        try {
          const token = await getToken();
          const response = await fetch(`/api/dashboard/query`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ query: config.source.query })
          });
          const result = await response.json();
          if (result.success) {
            setData(result.data);
          } else {
            console.error("Query failed:", result.error);
            setData([]);
          }
        } catch (err) {
          console.error("Error fetching block data:", err);
          setData([]);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [config, getToken]);

  const Component = BlockComponentMapper[config.type];
  if (!Component) return <div>Unknown block type: {config.type}</div>;
  if (loading) return <Card><Title>{'title' in config ? config.title : 'Loading...'}</Title><Text>Loading data...</Text></Card>;

  const children = 'children' in config && config.children?.map((childConfig: DashboardBlockConfig, index: number) => <Block key={index} config={childConfig} />);

  return <Component {...config} data={data}>{children}</Component>;
};


// --- Main Dashboard Renderer ---
interface DashboardRendererProps {
  layout: DashboardLayout;
}

export function DashboardRenderer({ layout }: DashboardRendererProps) {
  if (!layout || !layout.children) return <div>Invalid dashboard layout.</div>;
  
  return <Block config={layout} />;
} 