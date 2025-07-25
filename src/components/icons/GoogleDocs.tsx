import React from 'react';

interface GoogleDocsIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const GoogleDocsIcon: React.FC<GoogleDocsIconProps> = ({ 
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
      <path d="M77.8571 23.5714L59.4286 5.14285H20.5714C17.6286 5.14285 15.2143 7.55714 15.2143 10.5V79.5C15.2143 82.4428 17.6286 84.8571 20.5714 84.8571H69.4286C72.3714 84.8571 74.7857 82.4428 74.7857 79.5V23.5714H77.8571Z" fill="#4285F4"/>
      <path d="M77.8571 23.5714H59.4286V5.14285L77.8571 23.5714Z" fill="#1565C0"/>
      <path d="M34.6428 59.1429H55.2857M34.6428 48.4286H55.2857M34.6428 37.7143H55.2857" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
};

export default GoogleDocsIcon; 