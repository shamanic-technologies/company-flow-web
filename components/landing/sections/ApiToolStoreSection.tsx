'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, ArrowRight, Sparkles, Code, Zap } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * ApiToolStoreSection Component
 * Displays the API Tools section of the landing page,
 * including the "Try It Out" functionality for dynamic tool creation.
 * All buttons in this section now open the contact dialog.
 */
export function ApiToolStoreSection() {
  // State for dynamic tool creation (now just for input field)
  const [apiSearchTerm, setApiSearchTerm] = useState('');
  const [isApiLoading, setIsApiLoading] = useState(false); // Keep for potential future loading state, though button is not disabled by it
  // const [apiTool, setApiTool] = useState<any>(null); // Removed as tool creation simulation is removed

  // Open contact dialog with specific button ID for tracking
  const openContactDialog = (buttonId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openSignInDialog', {
        detail: { buttonId }
      }));
    }
  };

  // Function to handle "Create Tool" button click
  const handleCreateToolClick = () => {
    // Log the search term if present, then open dialog
    console.log(`Create tool clicked. Search term: '${apiSearchTerm}'`);
    openContactDialog('api_tools_create_tool');
  };

  // Function to handle suggestion button clicks
  const handleSuggestionClick = (term: string) => {
    // Set the search term in the input field and open dialog
    setApiSearchTerm(term);
    console.log(`Suggestion clicked: '${term}'`);
    openContactDialog(`api_tools_suggestion_${term.toLowerCase().replace(/\s+/g, '_')}`);
  };

  return (
    <section id="api-tools" className="py-20 bg-gradient-to-b from-gray-950 to-gray-900 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-sky-950 text-sky-300 border border-sky-800 mb-4">
              <Wand2 className="h-4 w-4 mr-2"/> AI-Powered Tool Creation
            </span>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">API Tools</h2>
            <p className="text-gray-400 mb-6">
              Create tools from any API with a simple description. Our AI reads documentation and builds tools automatically, with no coding required.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-gray-300">AI reads docs and builds tools automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-sky-400 shrink-0 mt-0.5" />
                <span className="text-gray-300">No coding required</span>
              </li>
            </ul>
            <Link href="/api-tool-store" passHref>
              <Button
                className="bg-gray-800 hover:bg-gray-700 text-gray-200"
                asChild
              >
                <span>
                  Explore API Tools <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </Link>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-sky-800/30">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Try It Out</h3>
            <div className="flex items-center gap-2 p-1.5 bg-gray-900 border border-gray-700 rounded-lg mb-4">
              <Input
                type="text"
                placeholder="e.g., 'Weather API', 'Translate text'..."
                value={apiSearchTerm}
                onChange={(e) => setApiSearchTerm(e.target.value)}
                className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-gray-500 text-gray-200"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateToolClick()} // Open dialog on Enter key
              />
              <Button
                onClick={handleCreateToolClick} // Always trigger contact dialog
                size="sm"
                className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold flex-shrink-0"
              >
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Create Tool
                </>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {['Weather API', 'Currency Converter', 'Stock Data'].map(term => (
                <Button
                  key={term}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800" size="sm"
                  onClick={() => handleSuggestionClick(term)} // Trigger contact dialog with suggestion term
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 