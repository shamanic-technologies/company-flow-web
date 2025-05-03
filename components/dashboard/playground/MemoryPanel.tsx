'use client';

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; 
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';

// Import shared type
import { Agent } from '@agent-base/types';

// Remove local Agent definition
/*
interface Agent {
  agent_memory: string; 
}
*/

interface MemoryPanelProps {
  selectedAgent: Agent | null | undefined; // Uses imported type
}

const MemoryPanel: React.FC<MemoryPanelProps> = ({ selectedAgent }) => {
  // Calculate agent age from created_at
  const getAgentAge = (createdAt?: string) => {
    if (!createdAt) return 'Unknown';
    
    try {
      const creationDate = new Date(createdAt);
      return formatDistanceToNow(creationDate, { addSuffix: false });
    } catch (e) {
      console.error("Error calculating agent age:", e);
      return 'Unknown';
    }
  };

  return (
    <>
      {/* Title Area within Memory Tab */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-200">Agent Memory</h2>
      </div>

      {/* Agent Information Card */}
      {selectedAgent && (
        <div className="px-4 pt-4 pb-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                {/* Agent Avatar */}
                <Avatar className="h-16 w-16 border-2 border-blue-600">
                  {selectedAgent.profilePicture.includes('://') ? (
                    <AvatarImage src={selectedAgent.profilePicture} alt={`${selectedAgent.firstName} ${selectedAgent.lastName}`} />
                  ) : (
                    <AvatarFallback className="text-lg bg-blue-900 text-blue-200">
                      {selectedAgent.profilePicture || selectedAgent.firstName.charAt(0) + selectedAgent.lastName.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Agent Details */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-100">
                    {selectedAgent.firstName} {selectedAgent.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">{selectedAgent.jobTitle}</p>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <div>
                      <span className="block text-gray-500">Age</span>
                      <span>{getAgentAge(selectedAgent.createdAt.toString())}</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">Gender</span>
                      <span className="capitalize">{selectedAgent.gender}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Scrollable Memory Content */}
      <ScrollArea className="flex-1 px-4 py-2 h-full">
        {selectedAgent?.memory ? (
          <pre className="text-xs bg-gray-900/50 p-3 rounded overflow-auto max-h-[calc(100vh-300px)] text-gray-300 font-mono whitespace-pre-wrap">
            {(() => {
              try {
                // Assuming memory is stored as a JSON string
                const memoryObject = typeof selectedAgent.memory === 'string' 
                  ? JSON.parse(selectedAgent.memory)
                  : selectedAgent.memory;
                return JSON.stringify(memoryObject, null, 2); 
              } catch (e) {
                // If parsing fails, display the raw string
                console.warn("Agent memory is not valid JSON, displaying as raw string.");
                return selectedAgent.memory;
              }
            })()}
          </pre>
        ) : (
          <div className="text-center text-gray-500 py-4">No memory data available for this agent.</div>
        )}
      </ScrollArea>
    </>
  );
};

export default MemoryPanel; 