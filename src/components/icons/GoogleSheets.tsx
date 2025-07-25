import React from 'react';

interface GoogleSheetsIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const GoogleSheetsIcon: React.FC<GoogleSheetsIconProps> = ({ 
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
      <path d="M77.8571 23.5714L59.4286 5.14285H20.5714C17.6286 5.14285 15.2143 7.55714 15.2143 10.5V79.5C15.2143 82.4428 17.6286 84.8571 20.5714 84.8571H69.4286C72.3714 84.8571 74.7857 82.4428 74.7857 79.5V23.5714H77.8571Z" fill="#0F9D58"/>
      <path d="M77.8571 23.5714H59.4286V5.14285L77.8571 23.5714Z" fill="#087C45"/>
      <rect x="26.25" y="32.25" width="37.5" height="25.5" rx="1.5" fill="white"/>
      <path d="M26.25 41.25H63.75M26.25 50.25H63.75M35.25 32.25V57.75M44.25 32.25V57.75M53.25 32.25V57.75" stroke="#0F9D58" strokeWidth="1.5"/>
    </svg>
  );
};

export default GoogleSheetsIcon; 