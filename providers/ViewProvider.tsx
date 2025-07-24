'use client';

import { createContext, useState, ReactNode, useContext, useMemo } from 'react';

interface ViewContextType {
  isRightPanelOpen: boolean;
  setIsRightPanelOpen: (isOpen: boolean) => void;
  isCreatingAgent: boolean;
  setIsCreatingAgent: (isCreating: boolean) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  const handleSetIsRightPanelOpen = (isOpen: boolean) => {
    setIsRightPanelOpen(isOpen);
    if (!isOpen) {
      // When the panel is closed, we should exit any special modes.
      setIsCreatingAgent(false);
    }
  };

  const contextValue = useMemo(
    () => ({
      isRightPanelOpen,
      setIsRightPanelOpen: handleSetIsRightPanelOpen,
      isCreatingAgent,
      setIsCreatingAgent,
    }),
    [isRightPanelOpen, isCreatingAgent]
  );

  return (
    <ViewContext.Provider value={contextValue}>{children}</ViewContext.Provider>
  );
}

export function useViewContext() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useViewContext must be used within a ViewProvider');
  }
  return context;
} 