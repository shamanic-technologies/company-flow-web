'use client';

import { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * CopyCommand Component
 * Displays a command string within a styled preformatted block and provides a button to copy the command to the clipboard.
 * @param command - The command string to display and copy.
 * @param className - Optional additional CSS classes for the container div.
 */
export function CopyCommand({ command, className = '' }: { command: string, className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [command]);

  return (
    <div className={`${className} relative`}>
      <div className="bg-gray-950 p-4 rounded-md overflow-x-auto flex items-center justify-between border border-gray-800">
        <pre className="text-sm text-gray-300 font-mono">
          <code>{command}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="ml-2 p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-800 flex-shrink-0"
          aria-label={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      {copied && (
        <div className="absolute -top-8 right-0 bg-green-900/80 text-green-200 text-xs px-2 py-1 rounded animate-fade-in-out">
          Copied!
        </div>
      )}
    </div>
  );
}

// Add this animation to your global CSS or tailwind.config.js if needed:
/*
@keyframes fade-in-out {
  0%, 100% { opacity: 0; transform: translateY(5px); }
  10%, 90% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-out {
  animation: fade-in-out 2s ease-in-out forwards;
}
*/ 