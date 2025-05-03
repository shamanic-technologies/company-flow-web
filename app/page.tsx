"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundGradients } from "@/components/landing/BackgroundGradients";
import { Hero } from "@/components/landing/Hero";
import { ChatLanding } from "@/components/landing/ChatLanding";
import { SuggestionButtons } from "@/components/landing/SuggestionButtons";
import { WordFlowContainer, LeftWordFlowContainer } from "@/components/landing/WordFlow";
import { getCurrentUser } from "@/lib/auth/auth-service";


/**
 * Landing page component
 * Main landing page for Company Flow
 */
export default function LandingPage() {
  const [signInLoading, setSignInLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // Effect 1: Handle authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email || "");
      } else {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);
  
  // Handle sign in button click
  const handleSignIn = () => {
    setSignInLoading(true);
    window.location.href = "/api/auth/google-auth";
    
    setTimeout(() => {
      setSignInLoading(false);
    }, 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background/95 to-blue-950/20">
      <BackgroundGradients />
      
      <div className="fixed top-4 right-4 z-50">
        {!isAuthenticated ? (
          <Button 
            onClick={handleSignIn} 
            variant="ghost" 
            size="sm" 
            className="font-medium relative overflow-hidden group"
            disabled={signInLoading}
          >
            {signInLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin text-blue-400" /> : null}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
              Sign In
            </span>
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="font-medium relative overflow-hidden group"
            onClick={() => window.location.href = '/dashboard'}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
              Dashboard
            </span>
          </Button>
        )}
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