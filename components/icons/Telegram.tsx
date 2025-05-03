import React from 'react';

interface TelegramIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const TelegramIcon: React.FC<TelegramIconProps> = ({ 
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
      <path d="M45 85C67.0914 85 85 67.0914 85 45C85 22.9086 67.0914 5 45 5C22.9086 5 5 22.9086 5 45C5 67.0914 22.9086 85 45 85Z" fill="url(#paint0_linear_799_5842)"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23.1074 44.5778C34.7682 39.4974 42.5439 36.1481 46.4345 34.5299C57.5429 29.9095 59.8511 29.1069 61.3556 29.0804C61.6865 29.0745 62.4264 29.1565 62.9056 29.5454C63.3103 29.8738 63.4216 30.3173 63.4749 30.6287C63.5282 30.94 63.5945 31.6492 63.5418 32.2033C62.9398 38.5283 60.3351 53.8773 59.01 60.9613C58.4493 63.9588 57.3452 64.9639 56.2763 65.0622C53.9535 65.276 52.1896 63.5271 49.9398 62.0523C46.4192 59.7446 44.4304 58.308 41.0131 56.0561C37.0639 53.4536 39.624 52.0232 41.8747 49.6856C42.4637 49.0738 52.6983 39.7646 52.8964 38.9201C52.9212 38.8145 52.9442 38.4208 52.7103 38.2129C52.4764 38.005 52.1312 38.0761 51.8821 38.1327C51.529 38.2128 45.9049 41.9301 35.0099 49.2846C33.4135 50.3808 31.9675 50.9149 30.672 50.8869C29.2438 50.856 26.4965 50.0793 24.4542 49.4155C21.9492 48.6012 19.9583 48.1707 20.1316 46.7878C20.2219 46.0675 21.2138 45.3308 23.1074 44.5778Z" fill="white"/>
      <defs>
        <linearGradient id="paint0_linear_799_5842" x1="4005" y1="5" x2="4005" y2="7945.67" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2AABEE"/>
          <stop offset="1" stopColor="#229ED9"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

export default TelegramIcon; 