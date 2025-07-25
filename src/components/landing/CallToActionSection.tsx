'use client';

import { Button } from '../ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

/**
 * Call to Action Section component for the landing page.
 * Drives user conversion with compelling value proposition and clear actions.
 */
export const CallToActionSection = () => {
  // Handle the same dialog events as the rest of the site
  const handleStartBuildingClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openSignInDialog', {
        detail: { buttonId: 'cta_start_building' }
      }));
    }
  };

  const handleScheduleDemoClick = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openSignInDialog', {
        detail: { buttonId: 'cta_schedule_demo' }
      }));
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-gray-950 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative element */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 opacity-10 rounded-full blur-3xl"></div>
        
        <div className="bg-gray-900/50 border border-blue-800/20 rounded-2xl p-8 md:p-12 shadow-xl shadow-blue-900/5 backdrop-blur-sm relative">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-blue-950 text-blue-300 border border-blue-800 mb-4">
              <Sparkles className="h-4 w-4 mr-2"/> Developer-First Platform
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Unlock the full potential of your AI agents
            </h2>
            
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto opacity-90">
              Access all business tools without any setup.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-medium flex items-center"
                onClick={handleStartBuildingClick}
              >
                Start building for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800 px-8 py-6 text-base font-medium"
                onClick={handleScheduleDemoClick}
              >
                Request a demo
              </Button>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-400 text-sm flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required to begin
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 