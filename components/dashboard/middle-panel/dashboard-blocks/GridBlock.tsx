import React from 'react';
import { Grid } from '@tremor/react';

interface GridBlockProps {
  children: React.ReactNode;
  props?: {
    columns?: number;
    className?: string;
  }; 
}

export const GridBlock: React.FC<GridBlockProps> = ({ children, props }) => (
  <Grid 
    numItems={1}
    numItemsSm={props?.columns ? Math.min(props.columns, 2) : 1}
    numItemsMd={props?.columns ? Math.min(props.columns, 3) : 1}
    numItemsLg={props?.columns}
    className={`gap-4 ${props?.className || ''}`}
  >
    {children}
  </Grid>
); 