/**
 * ChatMessage Component
 * 
 * Renders an individual message in the chat interface with avatar and appropriate
 * rendering based on message type (text, tool invocation, reasoning, etc.)
 */

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { InfoIcon, LinkIcon, FileIcon, ImageIcon, CopyIcon, CheckIcon } from 'lucide-react';
import MemoizedMarkdown from './MemoizedMarkdown';
import { ToolInvocationPart } from './ToolInvocations/ToolInvocationPart';
import type { MessagePart } from './types';
import { Message } from 'ai';
import { UseChatHelpers, useChat } from 'ai/react';
import remarkGfm from 'remark-gfm';
// import remarkMath from 'remark-math';

interface ChatMessageProps {
  message: Message;
  userInitials: string;
  agentFirstName: string;
  agentLastName: string;
  append: UseChatHelpers['append'];
  addToolResult: ReturnType<typeof useChat>['addToolResult'];
  messages: Message[];
}

export const ChatMessage = ({ message, userInitials, agentFirstName, agentLastName, append, addToolResult, messages }: ChatMessageProps) => {
  // Track expanded tool calls by their index
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set());
  
  // Toggle a tool's expanded state
  const toggleToolExpansion = (index: number) => {
    setExpandedTools(prev => {
      const newState = new Set(prev);
      if (newState.has(index)) {
        newState.delete(index);
      } else {
        newState.add(index);
      }
      return newState;
    });
  };
  
  return (
    <div 
      className={`flex items-start gap-3 px-2 py-3 rounded-lg ${message.role === 'user' ? "bg-gray-800/50" : "bg-gray-850/30"}`}
    >
      {/* Avatar Re-added and placed inline */}
      
      <div className="flex-1 overflow-hidden">
        {/* Flex container for Avatar and Sender Name */}
        <div className="flex items-center gap-2 mb-1">
            {/* Small Avatar */}
            <Avatar className={`h-4 w-4 text-xs ${message.role === 'user' ? "border border-blue-600" : "bg-gradient-to-br from-indigo-600 to-purple-600"}`}>
                {message.role === 'user' ? (
                <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
                ) : (
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-600 to-purple-600 text-white">AI</AvatarFallback>
                )}
            </Avatar>
            {/* Sender Name */}
            <div className="text-xs font-medium text-gray-300">
              {message.role === 'user' ? 'You' : `${agentFirstName} ${agentLastName}`}
            </div>
        </div>
        
        {message.role === 'assistant' && message.parts ? (
          // Render message parts if available
          <div className="space-y-2">
            {message.parts.map((part, index) => {
              // Handle text parts - now using MemoizedMarkdown
              if (part.type === 'text') {
                return (
                  <div key={`text-${index}`} className="text-xs text-gray-200">
                    <MemoizedMarkdown content={part.text || ''} id={`${message.id}-part-${index}`} />
                  </div>
                );
              } 
              
              // Handle tool invocations
              else if (part.type === 'tool-invocation') {
                return <ToolInvocationPart 
                  key={`${message.id}-tool-${index}`} 
                  part={part} 
                  index={index} 
                  isExpanded={expandedTools.has(index)}
                  onToggle={() => toggleToolExpansion(index)}
                  addToolResult={addToolResult}
                />;
              }
              
              // Handle reasoning parts
              else if (part.type === 'reasoning') {
                return (
                  <div key={`reasoning-${index}`} className="mt-2 p-2 bg-gray-800/50 rounded-md border border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <InfoIcon size={12} className="text-blue-400" />
                      <div className="text-xs text-blue-400 font-medium">AI Reasoning</div>
                    </div>
                    <div className="text-xs text-gray-300 bg-gray-850 p-2 rounded font-mono whitespace-pre-wrap">
                      {typeof part.reasoning === 'string' ? part.reasoning : 'No reasoning text available.'}
                    </div>
                  </div>
                );
              }
              
              // Handle source parts (for sources from Perplexity, etc.)
              else if (part.type === 'source') {
                return (
                  <div key={`source-${index}`} className="mt-1 flex items-center gap-2">
                    <LinkIcon size={10} className="text-gray-400" />
                    <a 
                      href={part.source?.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      {part.source?.title || (part.source?.url ? new URL(part.source.url).hostname : 'Source')}
                    </a>
                  </div>
                );
              }
              
              // Handle file parts (particularly for images)
              else if (part.type === 'file') {
                if (part.mimeType?.startsWith('image/')) {
                  return (
                    <div key={`file-${index}`} className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <ImageIcon size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">Image</span>
                      </div>
                      <img 
                        src={`data:${part.mimeType};base64,${part.data}`} 
                        alt="Generated image"
                        className="max-w-full rounded-md border border-gray-700" 
                      />
                    </div>
                  );
                } else {
                  return (
                    <div key={`file-${index}`} className="mt-2 flex items-center gap-2 p-2 bg-gray-800/50 rounded-md border border-gray-700">
                      <FileIcon size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-300">File</span>
                      <span className="text-xs text-gray-500">({part.mimeType})</span>
                    </div>
                  );
                }
              }
              
              return null;
            })}
            
            {/* Sources section - group all sources at the bottom */}
            {message.parts.some(part => part.type === 'source') && (
              <div className="mt-3 pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-400 mb-1">Sources:</div>
                <div className="flex flex-wrap gap-2">
                  {message.parts
                    .filter(part => part.type === 'source')
                    .map((part, idx) => (
                      <a
                        key={`${message.id}-source-badge-${idx}`}
                        href={part.source?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full hover:bg-gray-700"
                      >
                        <LinkIcon size={10} />
                        {part.source?.title 
                          ? part.source.title.length > 30 
                            ? `${part.source.title.substring(0, 30)}...` 
                            : part.source.title
                          : part.source?.url ? new URL(part.source.url).hostname : 'Source'}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Fallback for messages without parts - now using MemoizedMarkdown
          <div className="text-xs text-gray-200">
            <MemoizedMarkdown content={message.content} id={message.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 