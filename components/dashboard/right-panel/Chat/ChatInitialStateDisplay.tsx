import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ChatInitialStateDisplayProps {
  isLoading: boolean;
  error: string | null;
  loadingText?: string;
  errorTitle?: string;
}

/**
 * Component to display loading or error states before the main chat interface is ready.
 */
export const ChatInitialStateDisplay: React.FC<ChatInitialStateDisplayProps> = ({
  isLoading,
  error,
  loadingText = "Loading messages...",
  errorTitle = "Error loading conversation",
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-400 p-4">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> {loadingText}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center text-red-400 p-4 text-center">
        <AlertTriangle className="h-10 w-10 mb-3 text-red-500" />
        <p className="font-medium">{errorTitle}</p>
        <p className="text-xs text-red-300/80 mt-1 max-w-xs">{error}</p>
      </div>
    );
  }

  return null; // If neither loading nor error, render nothing (or children if adapted)
}; 