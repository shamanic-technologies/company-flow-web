'use client';

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Agent } from '@agent-base/types';

interface MemoryPanelProps {
  selectedAgent: Agent | null | undefined;
}

const MemoryPanel: React.FC<MemoryPanelProps> = ({ selectedAgent }) => {
  return (
    <ScrollArea className="h-full">
      {selectedAgent?.memory ? (
        <pre className="text-xs bg-gray-900/50 p-3 rounded overflow-auto h-full text-gray-300 font-mono whitespace-pre-wrap">
          {(() => {
            try {
              const memoryObject = typeof selectedAgent.memory === 'string' 
                ? JSON.parse(selectedAgent.memory)
                : selectedAgent.memory;
              return JSON.stringify(memoryObject, null, 2); 
            } catch (e) {
              console.warn("Agent memory is not valid JSON, displaying as raw string.");
              return selectedAgent.memory;
            }
          })()}
        </pre>
      ) : (
        <div className="text-center text-gray-500 py-4">No memory data available for this agent.</div>
      )}
    </ScrollArea>
  );
};

export default MemoryPanel; 