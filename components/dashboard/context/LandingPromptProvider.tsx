'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLandingPrompt } from '@/hooks/useLandingPrompt';

interface LandingPromptContextType {
  isLandingPromptProcessing: boolean;
}

export const LandingPromptContext = createContext<LandingPromptContextType>({
  isLandingPromptProcessing: false,
});

export function LandingPromptProvider({ children }: { children: ReactNode }) {
  const { isLandingPromptProcessing } = useLandingPrompt();

  return (
    <LandingPromptContext.Provider value={{ isLandingPromptProcessing }}>
      {children}
    </LandingPromptContext.Provider>
  );
}

export function useLandingPromptContext() {
  const context = useContext(LandingPromptContext);
  if (context === undefined) {
    throw new Error('useLandingPromptContext must be used within a LandingPromptProvider');
  }
  return context;
} 