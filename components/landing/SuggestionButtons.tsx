import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FileCheck, Mail, CalendarClock, LineChart, Utensils } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useClerk } from '@clerk/nextjs'; // Import Clerk hooks

// Define the specific storage key needed for this component
const LANDING_PAGE_MESSAGE_KEY = 'landing_page_message';

/**
 * SuggestionButtons component
 * Displays quick action buttons for common business use cases
 */
export function SuggestionButtons() {
  const router = useRouter();
  const { isSignedIn } = useAuth(); // Get authentication status
  const { openSignIn } = useClerk(); // Get function to open sign-in modal
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper function to handle the logic for a suggestion button click
  const handleSuggestion = (text: string) => {
    localStorage.setItem(LANDING_PAGE_MESSAGE_KEY, text);
    if (isSignedIn) {
      router.push("/dashboard");
    } else {
      openSignIn(); // Open sign-in modal if not signed in
    }
  };

  if (!isMounted) {
    // Render Skeletons on the server and initial client render to avoid hydration mismatch
    return (
      <>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <Skeleton className="h-9 w-72 rounded-full" /> {/* Placeholder for "Start an online therapists platform" */}
          <Skeleton className="h-9 w-48 rounded-full" /> {/* Placeholder for "Manage my guest house" */}
          <Skeleton className="h-9 w-80 rounded-full" /> {/* Placeholder for "Launch a healthy restaurant in Koh Phangan" */}
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          <Skeleton className="h-9 w-60 rounded-full" /> {/* Placeholder for "Develop my therapy activity" */}
          <Skeleton className="h-9 w-64 rounded-full" /> {/* Placeholder for "Develop my coaching business" */}
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        <Button 
          variant="outline" 
          className="rounded-full bg-blue-500/10 backdrop-blur-sm border-blue-500/20 text-sm hover:bg-blue-500/15 hover:border-blue-500/30 transition-all"
          onClick={() => handleSuggestion("Start an online therapists platform")}
        >
          <FileCheck className="h-4 w-4 mr-2 text-blue-400" /> Start an online therapists platform
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full bg-emerald-500/10 backdrop-blur-sm border-emerald-500/20 text-sm hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all"
          onClick={() => handleSuggestion("Manage my guest house")}
        >
          <Mail className="h-4 w-4 mr-2 text-emerald-400" /> Manage my guest house
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full bg-amber-500/10 backdrop-blur-sm border-amber-500/20 text-sm hover:bg-amber-500/15 hover:border-amber-500/30 transition-all"
          onClick={() => handleSuggestion("Launch a healthy restaurant in Koh Phangan")}
        >
          <Utensils className="h-4 w-4 mr-2 text-amber-400" /> Launch a healthy restaurant in Koh Phangan
        </Button>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        <Button 
          variant="outline" 
          className="rounded-full bg-indigo-500/10 backdrop-blur-sm border-indigo-500/20 text-sm hover:bg-indigo-500/15 hover:border-indigo-500/30 transition-all"
          onClick={() => handleSuggestion("Develop my therapy activity")}
        >
          <CalendarClock className="h-4 w-4 mr-2 text-indigo-400" /> Develop my therapy activity
        </Button>
        <Button 
          variant="outline" 
          className="rounded-full bg-purple-500/10 backdrop-blur-sm border-purple-500/20 text-sm hover:bg-purple-500/15 hover:border-purple-500/30 transition-all"
          onClick={() => handleSuggestion("Develop my coaching business")}
        >
          <LineChart className="h-4 w-4 mr-2 text-purple-400" /> Develop my coaching business
        </Button>
      </div>
    </>
  );
} 