import React from 'react';
import { Grid } from '@tremor/react';

interface GridBlockProps {
  children: React.ReactNode;
  props?: {
    numItems?: number;
    numItemsSm?: number;
    numItemsMd?: number;
    numItemsLg?: number;
    className?: string;
  }; 
}

export const GridBlock: React.FC<GridBlockProps> = ({ children, props }) => (
  <Grid 
    numItems={props?.numItems || 1}
    numItemsSm={props?.numItemsSm}
    numItemsMd={props?.numItemsMd}
    numItemsLg={props?.numItemsLg}
    className={`gap-4 ${props?.className || ''}`}
  >
    {children}
  </Grid>
); 