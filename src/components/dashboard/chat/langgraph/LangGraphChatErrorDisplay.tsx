import React, { useState } from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

interface LangGraphChatErrorDisplayProps {
  error: Error | null;
}

/**
 * Component to display chat-related errors from LangGraph with options to show details or dismiss.
 */
export const LangGraphChatErrorDisplay: React.FC<LangGraphChatErrorDisplayProps> = ({
  error,
}) => {
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!error || !isVisible) return null;

  return (
    <div className="mx-4 mt-3 mb-1 flex flex-col bg-red-500/10 border border-red-500/30 p-3 rounded-md">
      <div className="flex items-start gap-2">
        <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-red-300">{error.message}</p>
          <div className="flex gap-2 mt-2">
            <button 
              className="text-xs bg-gray-700/50 hover:bg-gray-700/70 px-2 py-1 rounded transition-colors"
              onClick={() => setShowErrorDetails(!showErrorDetails)}
            >
              {showErrorDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button 
              className="text-xs bg-gray-700/50 hover:bg-gray-700/70 px-2 py-1 rounded transition-colors"
              onClick={() => setIsVisible(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
        <button 
          className="text-red-400 hover:text-red-300"
          onClick={() => setIsVisible(false)}
        >
          <XCircle size={14} />
        </button>
      </div>
      
      {showErrorDetails && (
        <div className="mt-3 pt-2 border-t border-red-500/30">
          <p className="text-xs text-red-300 mb-1">Technical Details:</p>
          <pre className="text-xs bg-gray-900/80 p-2 rounded overflow-auto max-h-40 text-red-200 font-mono whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
          {error.stack && (
            <>
              <p className="text-xs text-red-300 mt-2">Stack Trace:</p>
              <pre className="text-xs bg-gray-900/80 p-2 rounded overflow-auto max-h-40 text-red-200 font-mono whitespace-pre-wrap">
                {error.stack}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 