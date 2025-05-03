'use client';

import React from 'react';

interface CodeBlockProps {
  value: string;
  language?: string; // Optional language prop for potential future syntax highlighting
  className?: string;
}

/**
 * Simple Code Block Component
 * Displays preformatted code with basic styling.
 */
export const CodeBlock: React.FC<CodeBlockProps> = ({ 
  value, 
  language, 
  className = '' 
}) => {
  return (
    <pre 
      className={`bg-gray-800 border border-gray-700 rounded-md p-4 overflow-x-auto text-sm text-gray-200 ${className}`}
    >
      <code className={language ? `language-${language}` : ''}>
        {value}
      </code>
    </pre>
  );
}; 