import React from 'react';
import { Card } from '@tremor/react';

interface TextBlockProps {
  content: string;
  props?: {
    className?: string;
    variant?: 'default' | 'title' | 'subtitle' | 'body' | 'caption';
  }
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, props }) => {
  const variant = props?.variant || 'body';
  
  const variantClasses = {
    title: 'text-xl font-semibold text-gray-900 dark:text-gray-50',
    subtitle: 'text-sm font-semibold text-gray-700 dark:text-gray-300',
    body: 'text-xs text-gray-700 dark:text-gray-300 leading-relaxed',
    caption: 'text-xs text-gray-500 dark:text-gray-500',
    default: 'text-xs text-gray-700 dark:text-gray-300',
  };

  return (
    <Card className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-sm">
      <p className={`${variantClasses[variant]} ${props?.className || ''}`}>
        {content}
      </p>
    </Card>
  );
}; 