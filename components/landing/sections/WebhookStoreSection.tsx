'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ArrowRight, Sparkles, Zap } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * WebhookStoreSection Component
 * Displays the Webhook Tools section of the landing page.
 * All interaction buttons now open the contact dialog.
 */
export function WebhookStoreSection() {
  // State only for the search input field
  const [webhookSearchTerm, setWebhookSearchTerm] = useState('');

  // Open contact dialog with specific button ID for tracking
  const openContactDialog = (buttonId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openSignInDialog', {
        detail: { buttonId }
      }));
    }
  };

  // Function to handle "Create Webhook" button click
  const handleCreateWebhookClick = () => {
    console.log(`Create webhook clicked. Search term: '${webhookSearchTerm}'`);
    openContactDialog('webhook_tools_create_webhook');
  };

  // Function to handle suggestion button clicks
  const handleWebhookSuggestionClick = (term: string) => {
    setWebhookSearchTerm(term);
    console.log(`Webhook suggestion clicked: '${term}'`);
    openContactDialog(`webhook_tools_suggestion_${term.toLowerCase().replace(/\s+/g, '_')}`);
  };

  // Static list of example webhook suggestions
  const webhookSuggestions = ['Stripe Events', 'GitHub Webhooks', 'Slack Notifications'];

  return (
    <section id="webhook-tools" className="py-20 bg-gradient-to-b from-gray-900 to-gray-900/90 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-gray-900/50 p-6 rounded-lg border border-purple-800/30">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Try It Out</h3>
            <div className="flex items-center gap-2 p-1.5 bg-gray-900 border border-gray-700 rounded-lg mb-4">
              <Input
                type="text"
                placeholder="e.g., 'Stripe events', 'GitHub webhooks'..."
                value={webhookSearchTerm}
                onChange={(e) => setWebhookSearchTerm(e.target.value)}
                className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-gray-500 text-gray-200"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateWebhookClick()}
              />
              <Button
                onClick={handleCreateWebhookClick}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold flex-shrink-0"
              >
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Create Webhook
                </>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {webhookSuggestions.map(term => (
                <Button
                  key={term}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800" size="sm"
                  onClick={() => handleWebhookSuggestionClick(term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>

          <div className="order-1 md:order-2">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-purple-950 text-purple-300 border border-purple-800 mb-4">
              <Link2 className="h-4 w-4 mr-2"/> Real-time Event Connections
            </span>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Webhook Tools</h2>
            <p className="text-gray-400 mb-6">
              Connect agents to real-time events from external platforms. Our centralized webhook management system makes integration easy and secure.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-gray-300">Centralized webhook management</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
                <span className="text-gray-300">Secure credential storage</span>
              </li>
            </ul>
            <Link href="/webhook-store" passHref>
              <Button
                className="bg-gray-800 hover:bg-gray-700 text-gray-200"
                asChild
              >
                <span>
                  Explore Webhooks <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 