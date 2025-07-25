/*
import React from 'react';
import { AlertCircle, XCircle } from 'lucide-react';

interface ChatErrorDisplayProps {
  chatError: string | null;
  errorInfo: { code: string; details?: string } | null;
  rawError: any;
  showErrorDetails: boolean;
  onRetry: () => void;
  onShowDetails: () => void;
  onDismiss: () => void;
}
*/
/**
 * Component to display chat-related errors with options to retry, show details, or dismiss.
 */
/*
export const ChatErrorDisplay: React.FC<ChatErrorDisplayProps> = ({
  chatError,
  errorInfo,
  rawError,
  showErrorDetails,
  onRetry,
  onShowDetails,
  onDismiss,
}) => {
  if (!chatError) return null;

  return (
    <div className="mx-4 mt-3 mb-1 flex flex-col bg-red-500/10 border border-red-500/30 p-3 rounded-md">
      <div className="flex items-start gap-2">
        <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-xs text-red-300">{chatError}</p>
          {errorInfo?.details && (
            <p className="text-xs text-red-400/70 mt-1">{errorInfo.details}</p>
          )}
          <div className="flex gap-2 mt-2">
            <button 
              className="text-xs bg-red-500/20 hover:bg-red-500/30 px-2 py-1 rounded transition-colors"
              onClick={onRetry}
            >
              Retry
            </button>
            <button 
              className="text-xs bg-gray-700/50 hover:bg-gray-700/70 px-2 py-1 rounded transition-colors"
              onClick={onShowDetails}
            >
              {showErrorDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button 
              className="text-xs bg-gray-700/50 hover:bg-gray-700/70 px-2 py-1 rounded transition-colors"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          </div>
        </div>
        <button 
          className="text-red-400 hover:text-red-300"
          onClick={onDismiss} // Dismiss can also be triggered by X icon
        >
          <XCircle size={14} />
        </button>
      </div>
      
      {showErrorDetails && rawError && (
        <div className="mt-3 pt-2 border-t border-red-500/30">
          <p className="text-xs text-red-300 mb-1">Technical Details:</p>
          <pre className="text-xs bg-gray-900/80 p-2 rounded overflow-auto max-h-40 text-red-200 font-mono whitespace-pre-wrap">
            {JSON.stringify(rawError, null, 2) || 'No additional details available'}
          </pre>
          <p className="text-xs text-red-300 mt-2">Error Code: {errorInfo?.code || 'unknown'}</p>
          {rawError.stack && (
            <>
              <p className="text-xs text-red-300 mt-2">Stack Trace:</p>
              <pre className="text-xs bg-gray-900/80 p-2 rounded overflow-auto max-h-40 text-red-200 font-mono whitespace-pre-wrap">
                {rawError.stack}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};
*/ 