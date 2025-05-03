import React from 'react';
import { Button } from '@/components/ui/button';
import { FileCheck, Mail, CalendarClock, LineChart, Utensils } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Define the specific storage key needed for this component
const LANDING_PAGE_MESSAGE_KEY = 'landing_page_message';

/**
 * Handles clicking on a suggestion button
 * Stores the suggestion text in localStorage and redirects to dashboard
 * @param text The suggestion text to store
 * @param router Next.js router object
 */
const handleSuggestionClick = (text: string, router: any) => {
  // Store the message in localStorage
  localStorage.setItem(LANDING_PAGE_MESSAGE_KEY, text);

  // Redirect to dashboard (assuming /dashboard is the target)
  router.push("/dashboard");
};

/**
 * SuggestionButtons component
 * Displays quick action buttons for common business use cases
 */
export function SuggestionButtons() {
  const router = useRouter();
  
  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        <Button 
          variant="outline" 
          className="rounded-full bg-blue-500/10 backdrop-blur-sm border-blue-500/20 text-sm hover:bg-blue-500/15 hover:border-blue-500/30 transition-all"
          onClick={() => handleSuggestionClick("Start an online therapists platform", router)}
        >
          <FileCheck className="h-4 w-4 mr-2 text-blue-400" /> Start an online therapists platform
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full bg-emerald-500/10 backdrop-blur-sm border-emerald-500/20 text-sm hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all"
          onClick={() => handleSuggestionClick("Manage my guest house", router)}
        >
          <Mail className="h-4 w-4 mr-2 text-emerald-400" /> Manage my guest house
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full bg-amber-500/10 backdrop-blur-sm border-amber-500/20 text-sm hover:bg-amber-500/15 hover:border-amber-500/30 transition-all"
          onClick={() => handleSuggestionClick("Launch a healthy restaurant in Koh Phangan", router)}
        >
          <Utensils className="h-4 w-4 mr-2 text-amber-400" /> Launch a healthy restaurant in Koh Phangan
        </Button>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        <Button 
          variant="outline" 
          className="rounded-full bg-indigo-500/10 backdrop-blur-sm border-indigo-500/20 text-sm hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all"
          onClick={() => handleSuggestionClick("Develop my therapy activity", router)}
        >
          <CalendarClock className="h-4 w-4 mr-2 text-indigo-400" /> Develop my therapy activity
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full bg-purple-500/10 backdrop-blur-sm border-purple-500/20 text-sm hover:bg-purple-500/15 hover:border-purple-500/30 transition-all"
          onClick={() => handleSuggestionClick("Develop my coaching business", router)}
        >
          <LineChart className="h-4 w-4 mr-2 text-purple-400" /> Develop my coaching business
        </Button>
      </div>
    </>
  );
} 