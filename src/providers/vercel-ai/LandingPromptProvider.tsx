/*
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLandingPrompt } from '@/hooks/useLandingPrompt';

interface LandingPromptContextType {
  isProcessing: boolean;
}

export const LandingPromptContext = createContext<LandingPromptContextType>({
  isProcessing: false,
});

export function LandingPromptProvider({ children }: { children: ReactNode }) {
  const { isProcessing } = useLandingPrompt();

  return (
    <LandingPromptContext.Provider value={{ isProcessing }}>
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
*/ 