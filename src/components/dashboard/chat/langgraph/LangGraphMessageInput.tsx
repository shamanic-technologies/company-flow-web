/**
 * LangGraphMessageInput Component
 * 
 * Provides the input form for sending messages in the LangGraph chat interface.
 */

import { FormEvent, forwardRef, useRef, useImperativeHandle } from 'react';
import { Button } from '../../../ui/button';
import { SendIcon } from 'lucide-react';

interface LangGraphMessageInputProps {
  input: string;
  isLoading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

export interface LangGraphMessageInputRef {
  focus: () => void;
}

export const LangGraphMessageInput = forwardRef<LangGraphMessageInputRef, LangGraphMessageInputProps>(({ 
  input, 
  isLoading, 
  handleInputChange, 
  handleSubmit, 
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    }
  }));
  
  return (
    <div className="p-3 border-t border-border h-[70px] flex items-center">
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
            className="w-full px-4 py-2.5 bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring text-foreground text-sm"
            disabled={isLoading}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={input.trim().length === 0 || isLoading}
        >
          <SendIcon size={18} className="mr-1" />
          Send
        </Button>
      </form>
    </div>
  );
});

LangGraphMessageInput.displayName = 'LangGraphMessageInput';

export default LangGraphMessageInput; 