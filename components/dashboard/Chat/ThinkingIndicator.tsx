/**
 * ThinkingIndicator Component
 * 
 * Displays an animated "Thinking" indicator when the AI is processing a response
 */

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const ThinkingIndicator = () => {
  return (
    <div className="flex items-start gap-3 px-2 py-3 rounded-lg bg-gray-850/30">
      <Avatar className="bg-gradient-to-br from-indigo-600 to-purple-600">
        <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">AI</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 overflow-hidden">
        <div className="text-sm font-medium mb-1 text-gray-300">
          Assistant
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-400">Thinking</div>
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThinkingIndicator; 