'use client';

import { ReactNode, useEffect } from 'react';

/**
 * Theme Provider component
 * 
 * Forces dark mode across the application
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Add dark class to html element
    document.documentElement.classList.add('dark');
    
    // Remove the class when component unmounts (though this is unlikely to happen)
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);
  
  return <>{children}</>;
} 