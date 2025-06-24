import React from 'react';
import { Callout } from '@tremor/react';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface CalloutBlockProps {
  title: string;
  content: string;
  props?: {
    icon?: 'Info' | 'Success' | 'Warning' | 'Error';
    color?: 'blue' | 'emerald' | 'yellow' | 'red' | 'gray';
  }
}

const iconMap = {
  Info: InformationCircleIcon,
  Success: CheckCircleIcon,
  Warning: ExclamationTriangleIcon,
  Error: XCircleIcon,
};

const colorMap = {
  Info: 'blue',
  Success: 'emerald',
  Warning: 'yellow',
  Error: 'red',
};

export const CalloutBlock: React.FC<CalloutBlockProps> = ({ title, content, props }) => {
  const iconType = props?.icon || 'Info';
  const IconComponent = iconMap[iconType];
  const color = props?.color || colorMap[iconType];

  return (
    <div className="border border-gray-200 dark:border-gray-800 shadow-sm">
      <Callout
        title={title}
        icon={IconComponent}
        color={color}
        className="text-xs"
      >
        {content}
      </Callout>
    </div>
  );
}; 