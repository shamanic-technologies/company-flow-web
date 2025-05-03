import React from 'react';

/**
 * Gmail Icon Component
 * Renders the official Gmail logo as an SVG
 */
interface GmailIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const GmailIcon: React.FC<GmailIconProps> = ({
  className = '',
  width = 90,
  height = 90
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 90 90" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M10.4545 75.0152H23.1817V44.1062L5 30.4698V69.5607C5 72.5788 7.44544 75.0152 10.4545 75.0152Z" fill="#4285F4"/>
    <path d="M66.8183 75.0152H79.5455C82.5637 75.0152 85 72.5697 85 69.5607V30.4698L66.8183 44.1062" fill="#34A853"/>
    <path d="M66.8183 20.47V44.1062L85 30.4698V23.1973C85 16.4518 77.3 12.6064 71.9092 16.6518" fill="#FBBC05"/>
    <path d="M23.1817 44.1062L23.1813 20.4698L44.9994 36.8334L66.8183 20.47V44.1062L44.9994 60.4698" fill="#EA4335"/>
    <path d="M5 23.1973V30.4698L23.1817 44.1062L23.1813 20.4698L18.0908 16.6518C12.6909 12.6064 5 16.4518 5 23.1973Z" fill="#C5221F"/>
  </svg>
);

export default GmailIcon; 