"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BackgroundGradients } from "@/components/landing/BackgroundGradients";
import { Hero } from "@/components/landing/Hero";
import { ChatLanding } from "@/components/landing/ChatLanding";
import { SuggestionButtons } from "@/components/landing/SuggestionButtons"; // Static import
import { WordFlowContainer, LeftWordFlowContainer } from "@/components/landing/WordFlow";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
// import dynamic from 'next/dynamic'; // Remove dynamic import

/**
 * Landing page component
 * Main landing page for Company Flow
 */
export default function LandingPage() {
  const { isLoaded } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-blue-950/20">
      <BackgroundGradients />
      
      <div className="fixed top-4 right-4 z-50 h-10 flex items-center">
        {!isLoaded && (
          <Skeleton className="h-8 w-20 rounded-md" /> 
        )}
        {isLoaded && (
          <>
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
          </>
        )}
      </div>
      
      <div className="container px-4 max-w-4xl mx-auto relative z-10 flex flex-col pt-0">
        <Hero />
        
        <div className="w-full max-w-3xl mx-auto relative">
          <ChatLanding />
          
          {/* Render SuggestionButtons directly, remove wrappers */}
          <SuggestionButtons />
        </div>
      </div>
      
      <WordFlowContainer />
      <LeftWordFlowContainer />
    </main>
  );
} 