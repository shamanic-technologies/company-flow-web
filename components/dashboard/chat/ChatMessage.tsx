/**
 * ChatMessage Component - Simplified version with collapse and tool calls
 */

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, ChevronRight, ChevronDown } from 'lucide-react';
import MemoizedMarkdown from './MemoizedMarkdown';
import { ToolInvocationPart } from './ToolInvocations/ToolInvocationPart';
import { Message } from 'ai';
import { UseChatHelpers, useChat } from 'ai/react';
import { ShimmeringIndicator } from './utils/ShimmeringIndicator';

interface ChatMessageProps {
  message: Message;
  userInitials: string;
  agentFirstName: string;
  agentLastName: string;
  append: UseChatHelpers['append'];
  addToolResult: ReturnType<typeof useChat>['addToolResult'];
  messages: Message[];
  isStreaming: boolean;
}

export const ChatMessage = ({ message, userInitials, agentFirstName, agentLastName, append, addToolResult, messages, isStreaming }: ChatMessageProps) => {
  
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set());
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [thinkingDuration, setThinkingDuration] = useState<string | null>(null);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const [isHoveringReasoning, setIsHoveringReasoning] = useState(false);

  const reasoningPart = message.parts?.find(p => p.type === 'reasoning');
  const contentParts = message.parts?.filter(
    p => p.type === 'text' || p.type === 'tool-invocation'
  );
  const textParts = contentParts?.filter(p => p.type === 'text');
  const hasStartedAnswer = textParts && textParts.length > 0;

  // Timer logic
  useEffect(() => {
    // Start timer when reasoning first appears and message is streaming
    if (isStreaming && reasoningPart && thinkingStartTime === null) {
      setThinkingStartTime(Date.now());
    }

    // Stop timer when answer starts appearing
    if (hasStartedAnswer && thinkingStartTime !== null && thinkingDuration === null) {
      const endTime = Date.now();
      const durationInSeconds = Math.ceil((endTime - thinkingStartTime) / 1000);
      setThinkingDuration(String(durationInSeconds));
    }
  }, [isStreaming, reasoningPart, hasStartedAnswer, thinkingStartTime, thinkingDuration]);
  
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

  const isCurrentlyThinking = reasoningPart && !hasStartedAnswer && isStreaming;
  const isDoneThinking = reasoningPart && (hasStartedAnswer || !isStreaming);
  
  return (
    <div className={`flex items-start gap-3 px-2 py-3 rounded-lg ${message.role === 'user' ? "bg-gray-800/50" : "bg-gray-850/30"}`}>
      <div className="flex-1 overflow-hidden min-w-0">
        {/* Avatar and Name */}
        <div className="flex items-center gap-2 mb-1">
            <Avatar className={`h-4 w-4 text-xs ${message.role === 'user' ? "border border-blue-600" : "bg-gradient-to-br from-indigo-600 to-purple-600"}`}>
                {message.role === 'user' ? (
                <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
                ) : (
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-600 to-purple-600 text-white">AI</AvatarFallback>
                )}
            </Avatar>
            <div className="text-xs font-medium text-gray-300">
              {message.role === 'user' ? 'You' : `${agentFirstName} ${agentLastName}`}
            </div>
        </div>
        
        {/* Reasoning Block */}
        {reasoningPart && (
          <div 
            className={`mt-2 text-gray-400 ${isDoneThinking ? 'cursor-pointer' : ''}`} 
            style={{ fontSize: '11px' }}
            onClick={() => isDoneThinking && setIsReasoningExpanded(prev => !prev)}
            onMouseEnter={() => setIsHoveringReasoning(true)}
            onMouseLeave={() => setIsHoveringReasoning(false)}
          >
            {isCurrentlyThinking ? (
              <>
                <ShimmeringIndicator text="Planning next moves" />
                <div className="whitespace-pre-wrap pl-5 text-gray-500">
                  {reasoningPart.reasoning}
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isHoveringReasoning ? (
                    isReasoningExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                  ) : (
                    <Brain size={12} className="text-gray-400" />
                  )}
                  <span>
                    {thinkingDuration !== null
                      ? `Thought for ${thinkingDuration} seconds`
                      : `Thought for few seconds`
                    }
                  </span>
                </div>
                {isReasoningExpanded && (
                  <div className="whitespace-pre-wrap pl-5 text-gray-500 pt-1">
                    {reasoningPart.reasoning}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Render content parts in order */}
        <div className="space-y-2 mt-2">
          {contentParts?.map((part, index) => {
            if (part.type === 'tool-invocation') {
              return (
                <ToolInvocationPart 
                  key={part.toolInvocation.toolCallId || `tool-${index}`} 
                  part={part} 
                  index={index} 
                  isExpanded={expandedTools.has(index)}
                  onToggle={() => toggleToolExpansion(index)}
                  addToolResult={addToolResult}
                  append={append}
                />
              );
            } else if (part.type === 'text') {
              return (
                <div key={`text-${index}`} className="text-xs text-gray-200">
                  <MemoizedMarkdown content={part.text || ''} id={`${message.id}-part-${index}`} />
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Fallback for user messages or messages without text parts */}
        {message.role === 'user' && (!textParts || textParts.length === 0) && (
          <div className="text-xs text-gray-200">
            <MemoizedMarkdown content={message.content} id={message.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage; 