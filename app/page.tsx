"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundGradients } from "@/components/landing/BackgroundGradients";
import { Hero } from "@/components/landing/Hero";
import { ChatLanding } from "@/components/landing/ChatLanding";
// import { SuggestionButtons } from "@/components/landing/SuggestionButtons"; // Comment out direct import
import { WordFlowContainer, LeftWordFlowContainer } from "@/components/landing/WordFlow";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import dynamic from 'next/dynamic'; // Import dynamic

// Dynamically import SuggestionButtons with SSR turned off
const SuggestionButtons = dynamic(
  () => import('@/components/landing/SuggestionButtons').then(mod => mod.SuggestionButtons),
  { ssr: false }
);


/**
 * Landing page component
 * Main landing page for Company Flow
 */
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-blue-950/20">
      <BackgroundGradients />
      
      <div className="fixed top-4 right-4 z-50">
        <SignedOut>
          <SignInButton mode="modal">
            <Button 
              variant="ghost" 
              size="sm" 
              className="font-medium relative overflow-hidden group"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                Sign In
              </span>
            </Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
      
      <div className="container px-4 max-w-4xl mx-auto relative z-10 flex flex-col pt-0">
        <Hero />
        
        <div className="w-full max-w-3xl mx-auto relative">
          <ChatLanding />
          
          <SuggestionButtons />
        </div>
      </div>
      
      <WordFlowContainer />
      <LeftWordFlowContainer />
    </main>
  );
} 