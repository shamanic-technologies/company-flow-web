'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Sparkles, Zap, Brain, History, Database, Wrench } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button-link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * AgentToolsSection Component
 * Displays the Agent Tools section of the landing page.
 * All interaction buttons now open the contact dialog.
 */
export function AgentToolsSection() {
  // State only for the search input field
  const [agentSearchTerm, setAgentSearchTerm] = useState('');

  // Open contact dialog with specific button ID for tracking
  const openContactDialog = (buttonId: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('openSignInDialog', {
        detail: { buttonId }
      }));
    }
  };

  // Function to handle "Add Tool" button click
  const handleAddToolClick = () => {
    console.log(`Add agent tool clicked. Search term: '${agentSearchTerm}'`);
    openContactDialog('agent_tools_add_tool');
  };

  // Function to handle suggestion button clicks
  const handleAgentSuggestionClick = (term: string) => {
    setAgentSearchTerm(term); // Optional: update input if desired
    console.log(`Agent suggestion clicked: '${term}'`);
    openContactDialog(`agent_tools_suggestion_${term.toLowerCase().replace(/\s+/g, '_')}`);
  };

  // Static list of example agent tool suggestions
  const agentSuggestions = [
    { label: 'Update Memory', icon: Brain },
    { label: 'Tool History', icon: History },
    { label: 'Agent Memory', icon: Database },
  ];

  return (
    <section id="agent-tools" className="py-20 bg-gradient-to-b from-gray-900/90 to-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-green-950 text-green-300 border border-green-800 mb-4">
              <Bot className="h-4 w-4 mr-2"/> Agent Management
            </span>
            <h2 className="text-3xl font-bold text-gray-100 mb-4">Agent Tools</h2>
            <p className="text-gray-400 mb-6">
              Powerful tools to manage and enhance your agents. Update memory, track conversations, and manage your AI ecosystem with ease.
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <span className="text-gray-300">Update agent memory and context</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                <span className="text-gray-300">Track conversations and tool usage</span>
              </li>
            </ul>
            <Link href="/agent-tools" passHref>
              <Button
                className="bg-gray-800 hover:bg-gray-700 text-gray-200"
                asChild
              >
                <span>
                  Explore Agent Tools <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Button>
            </Link>
          </div>

          <div className="bg-gray-900/50 p-6 rounded-lg border border-green-800/30">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Try It Out</h3>
            <div className="flex items-center gap-2 p-1.5 bg-gray-900 border border-gray-700 rounded-lg mb-4">
              <Input
                type="text"
                placeholder="Describe a new tool for your agent..."
                value={agentSearchTerm}
                onChange={(e) => setAgentSearchTerm(e.target.value)}
                className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-gray-500 text-gray-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddToolClick()}
              />
              <Button
                onClick={handleAddToolClick}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold flex-shrink-0"
              >
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Add Tool
                </>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {agentSuggestions.map(({ label, icon: Icon }) => (
                <Button
                  key={label}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800" size="sm"
                  onClick={() => handleAgentSuggestionClick(label)}
                >
                  <Icon className="h-4 w-4 mr-1" /> {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 