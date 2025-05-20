import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Define the specific storage key needed for this component
const LANDING_PAGE_MESSAGE_KEY = 'landing_page_message';

/**
 * EnhancedChatInterface component
 * Provides an interactive chat input with animated gradient border
 */
function ChatLandingInterface() {
  const [message, setMessage] = useState("");
  const router = useRouter();
  
  /**
   * Handles form submission and redirects to home/chat
   * Only redirects if message contains at least 1 character
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if message has at least 1 character (excluding whitespace)
    if (message.trim().length >= 1) {
      // Store the message in localStorage before redirecting
      localStorage.setItem(LANDING_PAGE_MESSAGE_KEY, message);
      
      // Redirect to dashboard (assuming /dashboard is the target)
      router.push('/dashboard');
    }
  };

  /**
   * Explicitly handle button click
   * Provides an additional way to submit the form
   */
  const handleButtonClick = () => {
    console.log("Button clicked!");
    if (message.trim().length >= 1) {
      // Store the message in localStorage before redirecting
      localStorage.setItem(LANDING_PAGE_MESSAGE_KEY, message);
      
      // Redirect to dashboard (assuming /dashboard is the target)
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Glow container with gradient */}
      <div className="relative p-[2px] rounded-lg overflow-hidden bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
        <div className="relative rounded-lg border border-white/10 overflow-hidden bg-black/50 backdrop-blur-md transition-all">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5"></div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What business do you automate today?"
            className="w-full h-40 sm:h-48 md:h-56 lg:h-64 py-8 px-6 sm:px-8 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none relative z-10 resize-none"
            autoFocus
          />
          <div className="absolute right-5 bottom-5 z-20 pointer-events-auto">
            <Button 
              type="button" 
              size="icon" 
              disabled={message.trim().length < 1}
              className="rounded-full h-11 w-11 bg-gradient-to-r from-blue-500 to-emerald-500 hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
              onClick={handleButtonClick}
            >
              <Send className="h-4 w-4" suppressHydrationWarning={true} />
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