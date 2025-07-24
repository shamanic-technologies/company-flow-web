'use client';

import { createContext, useState, ReactNode, useContext } from 'react';

interface ViewContextType {
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (isOpen: boolean) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  const value = {
    isRightPanelOpen,
    setIsRightPanelOpen,
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useViewContext() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
} 