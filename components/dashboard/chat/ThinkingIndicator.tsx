/**
 * ThinkingIndicator Component
 * 
 * Displays an animated "Thinking" indicator when the AI is processing a response
 */

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Brain } from 'lucide-react';

const ThinkingIndicator = () => {
  return (
    <div className="flex items-start gap-3 px-2 py-3 rounded-lg bg-gray-850/30">
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Avatar className="h-4 w-4 text-xs bg-gradient-to-br from-indigo-600 to-purple-600">
            <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-600 to-purple-600 text-white">AI</AvatarFallback>
      </Avatar>
          <div className="text-xs font-medium text-gray-300">
          Assistant
          </div>
        </div>
        
        <div className="mt-2 text-gray-400" style={{ fontSize: '11px' }}>
          <div className="flex items-center gap-2 mb-1">
            <Brain size={12} className="animate-pulse" />
            <span className="inline-block bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 bg-[length:200%_100%] animate-[shimmer_3s_linear_infinite] bg-clip-text text-transparent will-change-[background-position]">
              Generating...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator; 