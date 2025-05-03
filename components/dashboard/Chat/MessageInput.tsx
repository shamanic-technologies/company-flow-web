/**
 * MessageInput Component
 * 
 * Provides the input form for sending messages in the chat interface
 * with send button and stop generation functionality
 */

import { FormEvent, forwardRef, useRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { SendIcon, Square } from 'lucide-react';

interface MessageInputProps {
  input: string;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  stop: () => void;
}

export interface MessageInputRef {
  focus: () => void;
}

export const MessageInput = forwardRef<MessageInputRef, MessageInputProps>(({ 
  input, 
  isLoading, 
  handleInputChange, 
  handleSubmit, 
  stop 
}, ref) => {
  // Create a ref for the input element
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Expose the focus method to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));
  
  return (
    <div className="p-3 border-t border-gray-800 h-[70px] flex items-center">
      <form 
        onSubmit={handleSubmit}
        className="flex items-center gap-2 w-full"
      >
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Send a message..."
            className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 text-gray-200 text-sm"
            disabled={isLoading}
          />
        </div>
        
        {isLoading ? (
          <Button 
            type="button" 
            variant="destructive"
            size="icon"
            onClick={stop}
          >
            <Square size={18} />
          </Button>
        ) : (
          <Button 
            type="submit" 
            disabled={input.trim().length === 0 || isLoading}
          >
            <SendIcon size={18} className="mr-1" />
            Send
          </Button>
        )}
      </form>
    </div>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput; 