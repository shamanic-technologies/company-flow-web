/**
 * Google Sign-In Button Component
 * Provides a styled button for authenticating with Google via auth-service
 */
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { GoogleIcon } from '../icons/GoogleIcon';

/**
 * Sign in with Google using auth-service via the web gateway
 * @param onSuccess Optional callback when sign-in is successful
 */
export function GoogleSignInButton({ 
  onSuccess 
}: { 
  onSuccess?: () => void 
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Use the server-side API route for secure Google auth initiation
      // Make sure the origin is our app's URL, not Google's
      window.location.href = '/api/auth/google-auth';
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      alert('Sign-in error. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      className="w-full bg-white text-black hover:bg-gray-100 hover:text-black border border-gray-300 flex items-center justify-center gap-2"
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {/* Use the GoogleIcon component */}
      <GoogleIcon width={24} height={24} />
      
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
} 