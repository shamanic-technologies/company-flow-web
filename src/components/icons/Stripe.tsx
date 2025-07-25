import React from 'react';

/**
 * Stripe Icon Component
 * Renders the official Stripe logo
 */
interface StripeIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const StripeIcon: React.FC<StripeIconProps> = ({ 
  className = '',
  width = 90,
  height = 90
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 90 90" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M77 5H13C8.58172 5 5 8.58172 5 13V77C5 81.4183 8.58172 85 13 85H77C81.4183 85 85 81.4183 85 77V13C85 8.58172 81.4183 5 77 5Z" fill="#635BFF"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M42.3512 36.2295C42.3512 34.3256 43.9134 33.5934 46.5008 33.5934C50.211 33.5934 54.8976 34.7162 58.6079 36.7177V25.2456C54.5559 23.6346 50.5528 23 46.5008 23C36.5906 23 30 28.1746 30 36.8153C30 50.2889 48.5512 48.1409 48.5512 53.9502C48.5512 56.1958 46.5984 56.928 43.8646 56.928C39.8126 56.928 34.6378 55.2683 30.537 53.0227V64.6412C35.0772 66.5939 39.6661 67.4238 43.8646 67.4238C54.0189 67.4238 61 62.3956 61 53.6573C60.9512 39.1097 42.3512 41.697 42.3512 36.2295Z" fill="white"/>
    </svg>
  );
};

export default StripeIcon; 