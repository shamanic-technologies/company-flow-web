'use client';

import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CrispIcon } from '@/components/icons'; // Assuming CrispIcon is exported directly
import { Globe } from "lucide-react";

// Import shared type
import { Conversation } from '@agent-base/types';

interface ConversationListPanelProps {
  conversationList: Conversation[];
  isLoadingConversations: boolean;
  historyError: string | null;
  currentConversationIdMiddlePanel: string | null;
  onConversationSelect: (conversationId: string) => void;
}

const ConversationListPanel: React.FC<ConversationListPanelProps> = ({ 
  conversationList, 
  isLoadingConversations, 
  historyError, 
  currentConversationIdMiddlePanel, 
  onConversationSelect 
}) => {
  return (
    <ScrollArea className="flex-1 px-4 py-2 h-full"> 
      {isLoadingConversations ? (
        <div className="text-center text-gray-400 py-4">Loading conversations...</div>
      ) : historyError ? ( 
        <div className="text-center text-red-400 py-4">Error loading conversations: {historyError}</div>
      ) : conversationList.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No conversation history found for this agent.</div>
      ) : (
        <ul className="space-y-2 py-2">
          {[...conversationList]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .map((convo) => (
            <li 
              key={convo.conversationId}
              className={`text-gray-300 hover:bg-gray-700 p-3 rounded cursor-pointer transition-colors duration-150 text-sm ${currentConversationIdMiddlePanel === convo.conversationId ? 'bg-blue-900/50 outline outline-2 outline-blue-500 outline-offset-[-2px]' : 'bg-gray-700/40'}`}
              onClick={() => onConversationSelect(convo.conversationId)}
            >
              <p className="font-medium truncate">ID: {convo.conversationId}</p>
              <div className="flex items-center space-x-1.5 mt-1.5">
                {convo.channelId === 'crisp' ? <CrispIcon className="h-4 w-4 text-blue-400 shrink-0" /> : <Globe className="h-4 w-4 text-gray-400 shrink-0" />}
                <span className="text-xs text-gray-400 capitalize">{convo.channelId || 'Unknown'}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Updated: {new Date(convo.updatedAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </ScrollArea>
  );
};

export default ConversationListPanel; 