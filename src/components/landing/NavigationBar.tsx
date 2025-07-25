'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Wand2, Link2, Bot } from 'lucide-react';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';

/**
 * Navigation Bar component for the landing page.
 * Displays the site logo and navigation links.
 */
export const NavigationBar = () => {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleOpenContactDialog = () => {
    if (typeof window !== 'undefined') {
      // Dispatch the same event used by ContactDialog/SignIn button
      const event = new CustomEvent('openSignInDialog');
      window.dispatchEvent(event);
    }
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-lg sticky top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {/* Diamond Logo */}
              <svg 
                width="32" 
                height="32" 
                viewBox="0 0 100 100" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                {/* Diamond */}
                <path d="M50 10L90 50L50 90L10 50L50 10Z" fill="#2563EB" />
                
                {/* Inner Diamond */}
                <path d="M50 25L75 50L50 75L25 50L50 25Z" fill="#1E40AF" />
                
                {/* Center Circle */}
                <circle cx="50" cy="50" r="12" fill="#60A5FA" />
              </svg>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Company Flow</span>
            </Link>
          </div>
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-4 p-2 rounded-lg border border-gray-700 bg-gray-800/50">
              <Link href="/#api-tools" className="flex items-center text-gray-300 hover:text-sky-400 text-sm font-medium transition-colors">
                <Wand2 className="h-4 w-4 mr-1.5 text-sky-500" /> API Tools
              </Link>
              <Link href="/#webhook-tools" className="flex items-center text-gray-300 hover:text-purple-400 text-sm font-medium transition-colors">
                <Link2 className="h-4 w-4 mr-1.5 text-purple-500" /> Webhook Tools
              </Link>
              <Link href="/#agent-tools" className="flex items-center text-gray-300 hover:text-green-400 text-sm font-medium transition-colors">
                <Bot className="h-4 w-4 mr-1.5 text-green-500" /> Agent Tools
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={handleOpenContactDialog}
              className="text-gray-300 hover:text-blue-400 text-sm font-medium transition-colors"
            >
              API Reference
            </button>
            <Link href="/dashboard/settings/billing" className="text-gray-300 hover:text-blue-400 text-sm font-medium transition-colors">Pricing</Link>
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <SignInButton mode="modal">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  size="sm"
                >
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
          <div className="md:hidden">
            <button className="text-gray-400 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}; 