'use client';

import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { 
  PostgresIcon, 
  GitHubIcon, 
  GmailIcon,
  WhatsAppIcon,
  GoogleDriveIcon,
  GoogleCalendarIcon
} from '../icons';
import { GitHubIconWhite } from '../icons';
import { Star } from 'lucide-react';

/**
 * Hero Section component for the landing page.
 * Displays the main headline, description, and call-to-action buttons.
 */
export const HeroSection = () => {
  const router = useRouter();

  // Trigger contact dialog with specific button ID for tracking
  const handleStartBuilding = () => {
    // Dispatch custom event to open contact dialog
    window.dispatchEvent(new CustomEvent('openSignInDialog', {
      detail: { buttonId: 'hero_start_building' }
    }));
  };

  const handleViewDemo = () => {
    // Dispatch custom event to open contact dialog
    window.dispatchEvent(new CustomEvent('openSignInDialog', {
      detail: { buttonId: 'hero_view_demo' }
    }));
  };

  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-gray-950 to-indigo-950/50 z-0"></div>
      
      {/* GitHub Organization Button */}
      <a 
        href="https://github.com/agent-base-ai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="absolute top-20 right-4 md:top-24 md:right-8 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 text-white text-sm border border-gray-700 transition-all hover:scale-105"
      >
        <GitHubIconWhite className="h-4 w-4" />
        <span>Follow on GitHub</span>
      </a>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <div className="space-y-6">
          <div className="flex gap-3 justify-center flex-wrap">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-green-950 text-green-300 border border-green-800">
              <span className="flex h-2 w-2 rounded-full bg-green-400 mr-2"></span>
              Open Source
            </div>
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-blue-950 text-blue-300 border border-blue-800">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
              API First
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-100 leading-tight">
             <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Instant</span> tools for your <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Agent SaaS</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-xl mx-auto">
            All online tools instantly available without any pre-setup.
          </p>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="text-gray-400">Popular tools:</span>
            <GitHubIconWhite width={32} height={32} />
            <PostgresIcon width={32} height={32} />
            <GmailIcon width={32} height={32} />
            <WhatsAppIcon width={32} height={32} />
            <GoogleDriveIcon width={32} height={32} />
            <GoogleCalendarIcon width={32} height={32} />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleStartBuilding}> 
              Start building for free
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800" onClick={handleViewDemo}> 
              Request a demo
            </Button>
          </div>
          <div className="pt-6">
            <p className="text-gray-400 text-sm flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% free to get started – no credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}; 