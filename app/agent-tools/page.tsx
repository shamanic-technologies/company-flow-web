'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Brain,
  Zap,
  Bot,
  MessageSquare,
  History,
  Database,
  Wrench
} from 'lucide-react';
import { NavigationBar } from '@/components/landing/NavigationBar';
import { Footer } from '@/components/landing/Footer';

/**
 * Agent Tools Page Component
 * Presents an interface for users to express interest in agent management features.
 * All interaction buttons now trigger the contact dialog.
 */
export default function AgentToolsPage() {
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

  // Function to handle "Add Tool to Agent" button click
  const handleAddAgentToolClick = () => {
    console.log(`Add agent tool clicked (Page). Search term: '${searchTerm}'`);
    openContactDialog('agent_tools_page_add_tool');
  };

  // Function to handle suggestion button clicks
  const handleAgentSuggestionClick = (term: string) => {
    setSearchTerm(term); // Optional: update input if desired
    console.log(`Agent suggestion clicked (Page): '${term}'`);
    openContactDialog(`agent_tools_page_suggestion_${term.toLowerCase().replace(/\s+/g, '_')}`);
  };

  // Static list of example agent tool suggestions
  const agentToolSuggestions = [
    { label: 'Create Agent', icon: Bot },
    { label: 'Update Memory', icon: Brain },
    { label: 'Tool History', icon: History },
    { label: 'Manage Conversations', icon: MessageSquare },
    { label: 'Agent Memory', icon: Database },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-300">
      <NavigationBar />

      {/* Hero Section */}
      <section className="min-h-screen flex items-start justify-center bg-gradient-to-br from-green-950/50 via-gray-950 to-teal-950/50 relative overflow-hidden pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-16">
          <span className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-green-950 text-green-300 border border-green-800 mb-4">
            <Bot className="h-4 w-4 mr-2"/> Agent Management Platform
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-100 mb-6">
            Powerful <span className="bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">Agent Tools</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Create, manage, and enhance your agents with powerful tools. Update memory, track conversations, 
            and add new capabilities on the fly. Click below to tell us what you need!
          </p>
          
          <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-2 p-1.5 bg-gray-900 border border-gray-700 rounded-lg">
              <Input
                type="text"
                placeholder="Describe a new tool for your agent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder-gray-500 text-gray-200"
                onKeyPress={(e) => e.key === 'Enter' && handleAddAgentToolClick()} // Open dialog on Enter
              />
              <Button
                onClick={handleAddAgentToolClick} // Trigger contact dialog
                // disabled={isLoading || !searchTerm} // Removed disabled logic
                size="sm"
                className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold"
              >
                {/* Simplified button content */}
                <Zap className="h-5 w-5 mr-2" />
                Add Tool to Agent
              </Button>
            </div>
          </div>

          {/* Example agent tool suggestions */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {agentToolSuggestions.map(({ label, icon: Icon }) => (
              <Button 
                key={label}
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800" 
                size="sm"
                onClick={() => handleAgentSuggestionClick(label)} // Trigger contact dialog
              >
                <Icon className="h-4 w-4 mr-2" /> {label}
              </Button>
            ))}
          </div>
          
          {/* Feature cards (Kept for informational purposes) */}
          <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
            <div className="bg-gray-800/70 p-6 rounded-lg border border-green-700/40 shadow-lg">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 rounded-full bg-green-900/50 border border-green-700/50">
                  <Bot className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-200">Agent Management</h3>
              </div>
              <p className="text-gray-300">Create, read, and update agents. Configure their capabilities and settings for optimal performance.</p>
            </div>
            
            <div className="bg-gray-800/70 p-6 rounded-lg border border-green-700/40 shadow-lg">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 rounded-full bg-green-900/50 border border-green-700/50">
                  <Brain className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-200">Memory Control</h3>
              </div>
              <p className="text-gray-300">View and update agent memory. Add key information or clear outdated context for better results.</p>
            </div>
            
            <div className="bg-gray-800/70 p-6 rounded-lg border border-green-700/40 shadow-lg">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 rounded-full bg-green-900/50 border border-green-700/50">
                  <MessageSquare className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-green-200">Conversation Tools</h3>
              </div>
              <p className="text-gray-300">Create and manage conversations. Send messages and track interactions with your agents.</p>
            </div>
          </div>
          
          {/* Removed Tool Result Section */}
          {/* {dynamicTool && ( ... )} */}
        </div>
      </section>

      <Footer />
    </div>
  );
} 