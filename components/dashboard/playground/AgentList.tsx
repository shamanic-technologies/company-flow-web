'use client';

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Import shared type and helper
import { Agent } from '@agent-base/types';
import { getInitials } from '@/lib/utils/helpers';

interface AgentListProps {
  agents: Agent[];
  isLoadingAgents: boolean;
  error: string | null;
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string) => void;
}

const AgentList: React.FC<AgentListProps> = ({ 
  agents, 
  isLoadingAgents, 
  error, 
  selectedAgentId, 
  onAgentSelect 
}) => {
  return (
    <div className="w-1/4 flex flex-col bg-gray-800 rounded-lg p-4 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-200 mb-3 flex-shrink-0">AI Agents</h2>
      <ScrollArea className="flex-1 pr-2">
        {isLoadingAgents ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full bg-gray-700" />
            <Skeleton className="h-8 w-full bg-gray-700" />
            <Skeleton className="h-8 w-full bg-gray-700" />
          </div>
        ) : error ? (
          <p className="text-red-400 text-sm">Error: {error}</p>
        ) : agents.length > 0 ? (
          <ul className="space-y-1">
            {agents.map((agent) => (
              <li 
                key={agent.id}
                className={`flex items-center space-x-3 text-gray-300 hover:bg-gray-700 p-2 rounded cursor-pointer transition-colors duration-150 text-sm ${selectedAgentId === agent.id ? 'bg-blue-900/50 outline outline-2 outline-blue-500 outline-offset-[-2px]' : ''}`}
                onClick={() => onAgentSelect(agent.id)}
              >
                <Avatar className="h-8 w-8">
                  {/* Use undefined for src to force fallback if profile_picture isn't a URL */}
                  <AvatarImage src={agent.profilePicture?.startsWith('http') ? agent.profilePicture : undefined} alt={`${agent.firstName} ${agent.lastName}`} />
                  <AvatarFallback className="bg-gray-600 text-gray-200 text-xs font-semibold">
                    {getInitials(agent.firstName, agent.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col leading-tight">
                  <span className="font-medium text-gray-200">
                    {`${agent.firstName} ${agent.lastName}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {agent.jobTitle}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm">No agents available.</p>
        )}
      </ScrollArea>
    </div>
  );
};

export default AgentList; 