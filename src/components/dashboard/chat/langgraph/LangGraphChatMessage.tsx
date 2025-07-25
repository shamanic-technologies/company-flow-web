/**
 * LangGraphChatMessage Component - A component to display a single chat message from LangGraph.
 */

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import { Brain, ChevronRight, ChevronDown } from 'lucide-react';
import MemoizedMarkdown from '../MemoizedMarkdown';
import { Message, AIMessage } from '@langchain/langgraph-sdk';
import { ShimmeringIndicator } from '../utils/ShimmeringIndicator';

interface LangGraphChatMessageProps {
  message: Message;
  userInitials: string;
  agentFirstName: string;
  agentLastName: string;
  isStreaming: boolean;
}

export const LangGraphChatMessage = ({ message, userInitials, agentFirstName, agentLastName, isStreaming }: LangGraphChatMessageProps) => {
  const [expandedTools, setExpandedTools] = useState<Set<number>>(new Set());
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [thinkingDuration, setThinkingDuration] = useState<string | null>(null);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);
  const [isHoveringReasoning, setIsHoveringReasoning] = useState(false);

  const role = message.type === 'human' ? 'user' : 'assistant';
  const content = (Array.isArray(message.content) ? message.content.join('\n') : message.content) || '';
  const toolCalls = (message as AIMessage).tool_calls;
  const hasToolCalls = toolCalls && toolCalls.length > 0;
  
  const hasStartedAnswer = hasToolCalls && content;

  useEffect(() => {
    if (isStreaming && hasToolCalls && thinkingStartTime === null) {
      setThinkingStartTime(Date.now());
    }

    if (hasStartedAnswer && thinkingStartTime !== null && thinkingDuration === null) {
      const endTime = Date.now();
      const durationInSeconds = Math.ceil((endTime - thinkingStartTime) / 1000);
      setThinkingDuration(String(durationInSeconds));
    }
  }, [isStreaming, hasToolCalls, hasStartedAnswer, thinkingStartTime, thinkingDuration]);
  
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

  const isCurrentlyThinking = hasToolCalls && isStreaming;
  const isDoneThinking = hasToolCalls && !isStreaming;
  
  return (
    <div className={`flex items-start gap-3 px-2 py-3 rounded-lg ${role === 'user' ? "bg-secondary/50" : "bg-muted/30"}`}>
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex items-center gap-2 mb-1">
            <Avatar className={`h-4 w-4 text-xs ${role === 'user' ? "border border-blue-600" : "bg-gradient-to-br from-indigo-600 to-purple-600"}`}>
                {role === 'user' ? (
                <AvatarFallback className="text-[10px]">{userInitials}</AvatarFallback>
                ) : (
                <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-600 to-purple-600 text-white">AI</AvatarFallback>
                )}
            </Avatar>
            <div className="text-xs font-medium text-foreground">
              {role === 'user' ? 'You' : `${agentFirstName} ${agentLastName}`}
            </div>
        </div>
        
        {hasToolCalls && (
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
                  <MemoizedMarkdown content={content as string} id={`${message.id}-reasoning`} />
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
                    <MemoizedMarkdown content={content as string} id={`${message.id}-reasoning-expanded`} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-2 mt-2">
          {hasToolCalls ? (
            toolCalls.map((toolCall, index) => (
              <div key={index} className="text-xs text-foreground bg-gray-100 p-2 rounded">
                <p className="font-bold">Tool Call: {toolCall.name}</p>
                <pre className="whitespace-pre-wrap">{JSON.stringify(toolCall.args, null, 2)}</pre>
              </div>
            ))
          ) : (
            <div className="text-xs text-foreground">
              <MemoizedMarkdown content={content as string} id={message.id || ''} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LangGraphChatMessage; 