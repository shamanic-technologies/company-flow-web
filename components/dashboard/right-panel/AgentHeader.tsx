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
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      {agent ? (
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 border-2 border-border">
            <AvatarImage 
              src={agent.profilePicture?.startsWith('http') ? agent.profilePicture : undefined} 
              alt={`${agent.firstName} ${agent.lastName}`} 
            />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {agent.firstName?.charAt(0) || ''}{agent.lastName?.charAt(0) || ''}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{`${agent.firstName} ${agent.lastName}`}</h2>
            <p className="text-sm text-muted-foreground">{agent.jobTitle}</p>
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground">Select an agent to start chatting</div>
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