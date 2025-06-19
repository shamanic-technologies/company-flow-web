/**
 * ChatMessage Component - Version simplifiée avec collapse et tool calls
 */

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain, ChevronRight, ChevronDown } from 'lucide-react';
import MemoizedMarkdown from './MemoizedMarkdown';
import { ToolInvocationPart } from './ToolInvocations/ToolInvocationPart';
import { Message } from 'ai';
import { UseChatHelpers, useChat } from 'ai/react';

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
  const textParts = message.parts?.filter(p => p.type === 'text');
  const toolParts = message.parts?.filter(p => p.type === 'tool-invocation');
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
                <div className="flex items-center gap-2 mb-1">
                  <Brain size={12} className="animate-pulse" />
                  <span className="inline-block bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 bg-[length:200%_100%] animate-[shimmer_2s_infinite] bg-clip-text text-transparent will-change-[background-position]">
                    Planning next moves
                  </span>
                </div>
                <div className="font-mono whitespace-pre-wrap pl-5 text-gray-500">
                  {reasoningPart.reasoning}
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {isHoveringReasoning ? (
                    isReasoningExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
                  ) : (
                    <Brain size={12} />
                  )}
                  <span>
                    {thinkingDuration !== null
                      ? `Thought for ${thinkingDuration} seconds`
                      : `Thought for few seconds`
                    }
                  </span>
                </div>
                {isReasoningExpanded && (
                  <div className="font-mono whitespace-pre-wrap pl-5 text-gray-500 pt-1">
                    {reasoningPart.reasoning}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Tool calls */}
        {toolParts && toolParts.length > 0 && (
          <div className="space-y-2 mt-2">
            {toolParts.map((part, index) => (
              <ToolInvocationPart 
                key={`${message.id}-tool-${index}`} 
                part={part} 
                index={index} 
                isExpanded={expandedTools.has(index)}
                onToggle={() => toggleToolExpansion(index)}
                addToolResult={addToolResult}
                append={append}
              />
            ))}
          </div>
        )}

        {/* Text parts */}
        {textParts && textParts.length > 0 && (
          <div className="space-y-2 mt-2">
            {textParts.map((part, index) => (
              <div key={`text-${index}`} className="text-xs text-gray-200">
                <MemoizedMarkdown content={part.text || ''} id={`${message.id}-part-${index}`} />
              </div>
            ))}
          </div>
        )}

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