import React from 'react';

interface MessengerIconProps {
  className?: string;
  width?: number;
  height?: number;
}

export const MessengerIcon: React.FC<MessengerIconProps> = ({ 
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
      <g transform="scale(1.125)">
        <path d="M39.9984 6.66797C21.6317 6.66797 6.66504 20.5913 6.66504 38.0013C6.66504 47.4646 11.2717 55.9279 18.665 61.3279C19.2984 61.7946 19.715 62.5146 19.7317 63.2879L19.8984 70.5413C19.9317 72.2746 21.7817 73.3846 23.3484 72.5579L31.515 68.3946C32.1484 68.0613 32.8817 68.0279 33.5317 68.2613C35.615 68.9613 37.7817 69.3346 39.9984 69.3346C58.365 69.3346 73.3317 55.4113 73.3317 38.0013C73.3317 20.5913 58.365 6.66797 39.9984 6.66797Z" fill="url(#paint0_radial_1327_3941)"/>
        <path d="M17.3496 48.5003L29.3329 29.167C30.4996 27.3003 33.0829 26.8503 34.8496 28.1337L44.0996 34.9503C44.8829 35.517 45.9329 35.517 46.7162 34.9503L59.2662 25.6503C61.0163 24.3837 63.2163 26.6337 61.7663 28.3837L49.7829 47.7337C48.6163 49.6003 46.0329 50.0503 44.2663 48.767L35.0163 41.9337C34.2329 41.367 33.1829 41.367 32.3996 41.9337L19.8496 51.2337C18.0996 52.5003 15.8996 50.2503 17.3496 48.5003Z" fill="white"/>
        <defs>
          <radialGradient id="paint0_radial_1327_3941" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(21.598 73.0893) rotate(-55.5048) scale(77.9545 51.395)">
            <stop stopColor="#0099FF"/>
            <stop offset="0.609754" stopColor="#A033FF"/>
            <stop offset="0.934823" stopColor="#FF5280"/>
            <stop offset="1" stopColor="#FF7061"/>
          </radialGradient>
        </defs>
      </g>
    </svg>
  );
};

export default MessengerIcon; 