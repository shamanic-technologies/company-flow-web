'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { PlusSquare, Loader2, PlusCircle } from 'lucide-react';

// Import shared type and helper
import { Agent } from '@agent-base/types';

// Define props for the component
interface AgentHeaderProps {
  agent: Agent;
  onNewChat: () => void;
}

/**
 * AgentHeader Component
 * Displays information about the currently selected agent and a button to start a new chat.
 */
export default function AgentHeader({ agent, onNewChat }: AgentHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
      {agent ? (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-gray-600">
            <AvatarImage 
              src={agent.profilePicture?.startsWith('http') ? agent.profilePicture : undefined} 
              alt={`${agent.firstName} ${agent.lastName}`} 
            />
            <AvatarFallback className="bg-gray-600 text-gray-300">
              {agent.firstName?.charAt(0) || ''}{agent.lastName?.charAt(0) || ''}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-gray-100">{`${agent.firstName} ${agent.lastName}`}</h2>
            <p className="text-sm text-gray-400">{agent.jobTitle}</p>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Select an agent to start chatting</div>
      )}
      
      {/* --- New Chat Button --- */}
      <div className="flex items-center">
        <div className="flex-grow" />
        <Button 
            variant="outline" 
            size="sm"
            onClick={onNewChat}
        >
            <PlusCircle className="mr-2 h-4 w-4" />
            New Chat
        </Button>
      </div>
      {/* --- End New Chat Button --- */}
    </div>
  );
} 