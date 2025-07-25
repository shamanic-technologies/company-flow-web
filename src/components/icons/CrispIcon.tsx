import React from 'react';

// Define the props accepted by the icon component
interface CrispIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  // No specific props needed, relies on standard img attributes like className, width, height, alt
}

// URL from Brandfetch
const crispLogoUrl = 'https://cdn.brandfetch.io/idCzlMzIQx/w/512/h/512/theme/dark/logo.png?c=1dxbfHSJFAPEGdCLU4o5B';

/**
 * Crisp Icon Component
 * 
 * Renders the Crisp logo using an img tag.
 * Accepts standard img attributes for customization.
 */
export const CrispIcon: React.FC<CrispIconProps> = ({ className, width = 24, height = 24, alt = 'Crisp Logo', ...props }) => {
  return (
    <img 
      src={crispLogoUrl}
      alt={alt}
      width={width}
      height={height}
      className={className} // Allow passing custom classes
      {...props} // Pass any other standard img attributes
    />
  );
}; 