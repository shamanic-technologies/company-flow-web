'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useLangGraphLandingPrompt } from '@/hooks/langgraph/useLangGraphLandingPrompt';

interface LangGraphLandingPromptContextType {
  isProcessing: boolean;
}

export const LangGraphLandingPromptContext = createContext<LangGraphLandingPromptContextType>({
  isProcessing: false,
});

export function LangGraphLandingPromptProvider({ children }: { children: ReactNode }) {
  const { isProcessing } = useLangGraphLandingPrompt();

  return (
    <LangGraphLandingPromptContext.Provider value={{ isProcessing }}>
      {children}
    </LangGraphLandingPromptContext.Provider>
  );
}

export function useLangGraphLandingPromptContext() {
  const context = useContext(LangGraphLandingPromptContext);
  if (context === undefined) {
    throw new Error('useLangGraphLandingPromptContext must be used within a LangGraphLandingPromptProvider');
  }
  return context;
} 