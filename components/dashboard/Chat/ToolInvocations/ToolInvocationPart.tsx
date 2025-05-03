/**
 * ToolInvocationPart Component
 * 
 * Renders a tool invocation part in the chat interface.
 * Handles different tool invocation states and displays appropriate UI,
 * using useSetupSteps hook and SetupStepRenderer for sequential setup.
 */
import React from 'react'; // Use React directly
import { CheckCircle, XCircle, WrenchIcon, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { MessagePart } from '@/components/dashboard/Chat/types';
import { hasToolError } from './utils';
import { useSetupSteps } from '@/hooks/useSetupSteps'; // Import the custom hook
import { SetupStepRenderer } from './SetupStepRenderer'; // Import the renderer

interface ToolInvocationPartProps {
  part: MessagePart;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  // Correct the type for addToolResult - it's a function
  addToolResult: (args: { toolCallId: string; result: any }) => void; 
}

export const ToolInvocationPart: React.FC<ToolInvocationPartProps> = ({ 
  part, 
  index, 
  isExpanded, 
  onToggle, 
  addToolResult,
}) => {
  const toolInvocation = part.toolInvocation;
  const { toast } = useToast(); // Keep toast if needed for other errors

  // Use the custom hook to manage setup steps
  const { 
    currentStep, 
    isLoading: isStepLoading, // Rename to avoid clash if needed
    error: stepError, 
    handleStepSubmit, 
    isHandlingSetup 
  } = useSetupSteps({ 
    toolInvocation, 
    addToolResult 
  });
  console.log('🟢[ToolInvocation]:', toolInvocation);
  // --- Render Logic --- 

  if (!toolInvocation) return null;

  // 1. Render Setup Step Card if the hook is handling it
  if (isHandlingSetup && currentStep) {
    // Potentially add loading/error display around the renderer
    if (stepError) {
      // Optionally display the step error prominently
       return <div className="text-red-500 text-xs p-2">Error during setup: {stepError}</div>;
    }
     return (
       <SetupStepRenderer 
         key={`${toolInvocation.toolCallId}-${currentStep.type}-${('secretType' in currentStep) ? currentStep.secretType : ('actionType' in currentStep) ? currentStep.actionType : ''}`}
         step={currentStep} 
         onSubmit={handleStepSubmit} // Pass the submit handler from the hook
         toolCallId={toolInvocation.toolCallId || `step-${index}`} // Pass toolCallId
       />
     );
    // We might want a loading indicator here as well based on isStepLoading
  }

  // 2. Render Standard Tool Invocation States (if not handling setup)
  switch (toolInvocation.state) {
    case 'partial-call':
    case 'call':
      return (
        <div className="flex items-center gap-2 mt-2 p-2 bg-gray-800 rounded-md">
          <WrenchIcon size={14} className="text-yellow-400" />
          <div className="text-xs text-yellow-400">
            Calling tool: {toolInvocation.toolName}
          </div>
          <div className="flex space-x-1 ml-2">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      );
    case 'result':
      // If we got here, it means it wasn't SetupNeeded or setup is complete/not active
      const hasError = hasToolError(toolInvocation);
      
      return (
        <div className="mt-2">
          <div 
            className="flex items-center gap-2 p-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-750"
            onClick={onToggle} // Keep toggle for expanding generic results
          >
            {hasError ? (
              <XCircle size={14} className="text-red-400" />
            ) : (
              <CheckCircle size={14} className="text-green-400" />
            )}
            <div className="text-xs text-gray-300">
              {toolInvocation.toolName}
              {/* @ts-ignore */}
              {toolInvocation.args?.utility_id && 
                /* @ts-ignore */
                <span className="text-gray-500 ml-1">({toolInvocation.args.utility_id})</span>
              }
            </div>
            {isExpanded ? (
              <ChevronDown size={14} className="ml-auto text-gray-400" />
            ) : (
              <ChevronRight size={14} className="ml-auto text-gray-400" />
            )}
          </div>
          
          {isExpanded && (
            <div className="mt-2 p-2 bg-gray-850 rounded-md border border-gray-700">
              <div className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-all overflow-hidden w-full">
                {/* @ts-ignore - Stringify the result, assuming it's not SetupNeeded */}
                {toolInvocation.result !== undefined && toolInvocation.result !== null ? (
                  JSON.stringify(toolInvocation.result, null, 2)
                ) : (
                  <span className="text-gray-500 italic">No result data</span>
                )}
              </div>
            </div>
          )}
        </div>
      );
    default:
      return null;
  }
};

export default ToolInvocationPart; 