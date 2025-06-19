/**
 * ToolInvocationPart Component
 * 
 * Renders a tool invocation part in the chat interface.
 * Handles different tool invocation states and displays appropriate UI,
 * using useSetupSteps hook and SetupStepRenderer for sequential setup.
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, WrenchIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MessagePart } from '../types';
import { hasToolError } from './utils';
import { useSetupSteps } from '@/hooks/useSetupSteps'; // Import the custom hook
import { SetupStepRenderer } from './SetupStepRenderer'; // Import the renderer
import { ShimmeringIndicator } from '../utils/ShimmeringIndicator';

interface ToolInvocationPartProps {
  part: MessagePart;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  addToolResult: (args: { toolCallId: string; result: any }) => void;
  append: (message: any, options?: any) => Promise<string | null | undefined>;
}

export const ToolInvocationPart: React.FC<ToolInvocationPartProps> = ({ 
  part, 
  index, 
  isExpanded, 
  onToggle, 
  addToolResult,
  append,
}) => {
  const { toolInvocation } = part;
  const { toast } = useToast(); // Keep toast if needed for other errors
  const [isHovering, setIsHovering] = useState(false);

  // Use the custom hook to manage setup steps
  const { 
    currentStep, 
    isLoading: isSubmitting, // Rename to avoid clash if needed
    error: submissionError, 
    handleStepSubmit, 
    isHandlingSetup 
  } = useSetupSteps({ 
    toolInvocation, 
    addToolResult,
    append,
  });
  // --- Render Logic --- 

  if (!toolInvocation) return null;

  // 1. Render Setup Step Card if the hook is handling it
  if (isHandlingSetup && currentStep) {
    // Potentially add loading/error display around the renderer
    if (submissionError) {
      // Optionally display the step error prominently
       return <div className="text-red-500 text-xs p-2">Error during setup: {submissionError}</div>;
    }
     return (
       <SetupStepRenderer 
         key={`${toolInvocation.toolCallId}-${currentStep.type}-${('secretType' in currentStep) ? currentStep.secretType : ('actionType' in currentStep) ? currentStep.actionType : ''}`}
         step={currentStep} 
         onSubmit={handleStepSubmit} // Pass the submit handler from the hook
         toolCallId={toolInvocation.toolCallId || `step-${index}`} // Pass toolCallId
       />
     );
    // We might want a loading indicator here as well based on isSubmitting
  }

  // 2. Render Standard Tool Invocation States (if not handling setup)
  switch (toolInvocation.state) {
    case 'partial-call':
    case 'call':
      return (
        <div className="mt-2 text-gray-400" style={{ fontSize: '11px' }}>
          <ShimmeringIndicator text={`Calling tool: ${toolInvocation.toolName}`} />
        </div>
      );
    case 'result':
      const hasError = hasToolError(toolInvocation);
      
      return (
        <div 
          className="mt-2 text-gray-400 cursor-pointer"
          style={{ fontSize: '11px' }}
          onClick={onToggle}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-center gap-2 mb-1">
            {isHovering ? (
              isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            ) : (
              hasError ? (
                <XCircle size={12} className="text-red-400" />
              ) : (
                <WrenchIcon size={12} className="text-gray-400" />
              )
            )}
            <span className={hasError ? 'text-red-400' : ''}>
              {hasError ? `Error using ${toolInvocation.toolName}` : `Used ${toolInvocation.toolName}`}
            </span>
          </div>
          
          {isExpanded && (
            <div className="whitespace-pre-wrap pl-5 text-gray-500 pt-1">
              {toolInvocation.result !== undefined && toolInvocation.result !== null ? (
                JSON.stringify(toolInvocation.result, null, 2)
              ) : (
                <span className="italic">No result data</span>
              )}
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
};

export default ToolInvocationPart; 