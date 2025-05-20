import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth, useClerk } from '@clerk/nextjs';

// Define the specific storage key needed for this component
const LANDING_PAGE_MESSAGE_KEY = 'landing_page_message';

/**
 * EnhancedChatInterface component
 * Provides an interactive chat input with animated gradient border
 */
function ChatLandingInterface() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { isLoaded, userId } = useAuth();
  const { openSignIn } = useClerk();
  
  /**
   * Handles form submission and redirects to home/chat
   * Only redirects if message contains at least 1 character
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length >= 1 && isLoaded) {
      setIsLoading(true);
      localStorage.setItem(LANDING_PAGE_MESSAGE_KEY, message);
      
      if (userId) { 
        router.push('/dashboard');
      } else { 
        openSignIn();
        setIsLoading(false);
      }
    }
  };

  /**
   * Explicitly handle button click
   * Provides an additional way to submit the form
   */
  const handleButtonClick = () => {
    console.log("Button clicked!");
    if (message.trim().length >= 1 && isLoaded) {
      setIsLoading(true);
      localStorage.setItem(LANDING_PAGE_MESSAGE_KEY, message);

      if (userId) { 
        router.push('/dashboard');
      } else { 
        openSignIn();
        setIsLoading(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Glow container with gradient */}
      <div className="relative p-[2px] rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500">
        <div className="relative rounded-lg overflow-hidden bg-black/50 backdrop-blur-md transition-all">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What business do you automate today?"
            className="w-full h-40 sm:h-48 md:h-56 lg:h-64 py-8 px-6 sm:px-8 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:shadow-none focus:ring-0 border-none relative z-10 resize-none"
            autoFocus
          />
          <div className="absolute right-5 bottom-5 z-20 pointer-events-auto">
            <Button 
              type="button" 
              size="icon" 
              disabled={message.trim().length < 1 || isLoading}
              className="rounded-full h-11 w-11 bg-gradient-to-r from-blue-500 to-emerald-500 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
              onClick={handleButtonClick}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-4 w-4" suppressHydrationWarning={true} />
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

/**
 * ChatSection component
 * Contains the main chat interface for the landing page
 */
export function ChatLanding() {
  return (
    <div className="w-full max-w-3xl mx-auto relative">
      <ChatLandingInterface />
    </div>
  );
} 