'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Zap,
  Link2
} from 'lucide-react';
import { NavigationBar } from '@/components/landing/NavigationBar';
import { Footer } from '@/components/landing/Footer';

/**
 * Webhook Tools Page Component
 * Presents an interface for users to express interest in creating custom webhook integrations.
 * All interaction buttons now trigger the contact dialog.
 */
export default function WebhookStorePage() {
  // State only for the search input field
  const [searchTerm, setSearchTerm] = useState('');
  // Removed isLoading and dynamicTool state
  // const [isLoading, setIsLoading] = useState(false);
  // const [dynamicTool, setDynamicTool] = useState<any>(null);

  // Open contact dialog with specific button ID for tracking
  const openContactDialog = (buttonId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openSignInDialog', {
        detail: { buttonId }
      }));
    }
  };

  // Removed handleSearchAndCreate function
  // const handleSearchAndCreate = async () => { ... };

  // Function to handle "Create Webhook" button click
  const handleCreateWebhookClick = () => {
    console.log(`Create webhook clicked (Page). Search term: '${searchTerm}'`);
    openContactDialog('webhook_store_page_create_webhook');
  };

  // Function to handle suggestion button clicks
  const handleWebhookSuggestionClick = (term: string) => {
    setSearchTerm(term);
    console.log(`Webhook suggestion clicked (Page): '${term}'`);
    openContactDialog(`webhook_store_page_suggestion_${term.toLowerCase().replace(/\s+/g, '_')}`);
  };

  // Static list of example webhook suggestions
  const exampleWebhooks = [
    'Stripe Events',
    'GitHub Webhooks',
    'Slack Notifications',
    'Shopify Events',
    'Zendesk Tickets'
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-300">
      <NavigationBar />

      {/* Hero Section */}
      <section className="h-screen flex items-start justify-center bg-gradient-to-br from-purple-950/50 via-gray-950 to-violet-950/50 relative overflow-hidden pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-purple-950 text-purple-300 border border-purple-800 mb-4">
            <Link2 className="h-4 w-4 mr-2 text-purple-400"/> Real-time Event Connections
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-100 mb-6">
            Dynamic <span className="bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">Webhook Tools</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Describe any external service, and our AI will instantly create a custom webhook for your agent.
            No coding required. Click below to tell us what you need!
          </p>
          
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-2 p-1.5 bg-gray-900 border border-gray-700 rounded-lg">
              <Input
                type="text"
                placeholder="e.g., 'Stripe events', 'GitHub webhooks', 'Slack notifications'..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-gray-500 text-gray-200"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateWebhookClick()}
              />
              <Button
                onClick={handleCreateWebhookClick}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold"
              >
                <Zap className="h-5 w-5 mr-2" />
                Create Webhook
              </Button>
            </div>
          </div>

          {/* Example webhook suggestions */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {exampleWebhooks.map(term => (
              <Button 
                key={term}
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800" 
                size="sm"
                onClick={() => handleWebhookSuggestionClick(term)}
              >
                {term}
              </Button>
            ))}
          </div>
          
          {/* Removed Tool Result Section */}
          {/* {dynamicTool && ( ... )} */}
        </div>
      </section>

      <Footer />
    </div>
  );
} 