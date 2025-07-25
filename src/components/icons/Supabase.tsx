import React from 'react';

/**
 * Supabase Icon Component
 * Renders the official Supabase logo
 */
interface SupabaseIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const SupabaseIcon: React.FC<SupabaseIconProps> = ({ 
  className = '',
  width = 90,
  height = 90
}) => {
  // Calculate the viewBox scale to maintain aspect ratio
  const aspectRatio = 96.4602 / 100;
  const scaledWidth = width * aspectRatio;

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 97 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_supabase)">
        <path d="M56.3796 97.5965C53.8491 100.783 48.7182 99.0372 48.6572 94.9682L47.7656 35.4537H87.7831C95.0313 35.4537 99.0738 43.8255 94.5667 49.5021L56.3796 97.5965Z" fill="url(#paint0_linear_supabase)"/>
        <path d="M56.3796 97.5965C53.8491 100.783 48.7182 99.0372 48.6572 94.9682L47.7656 35.4537H87.7831C95.0313 35.4537 99.0738 43.8255 94.5667 49.5021L56.3796 97.5965Z" fill="url(#paint1_linear_supabase)" fillOpacity="0.2"/>
        <path d="M40.1052 1.83277C42.6357 -1.35431 47.7667 0.391984 47.8276 4.46107L48.2183 63.9754H8.70173C1.45328 63.9754 -2.58931 55.6036 1.91799 49.927L40.1052 1.83277Z" fill="#3ECF8E"/>
      </g>
      <defs>
        <linearGradient id="paint0_linear_supabase" x1="47.7656" y1="48.6496" x2="83.3317" y2="63.5659" gradientUnits="userSpaceOnUse">
          <stop stopColor="#249361"/>
          <stop offset="1" stopColor="#3ECF8E"/>
        </linearGradient>
        <linearGradient id="paint1_linear_supabase" x1="31.9975" y1="27.0602" x2="48.2175" y2="57.5935" gradientUnits="userSpaceOnUse">
          <stop/>
          <stop offset="1" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="clip0_supabase">
          <rect width="96.4602" height="100" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  );
};

export default SupabaseIcon; 