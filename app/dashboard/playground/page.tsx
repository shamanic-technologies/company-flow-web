'use client';

/**
 * Standard Playground Page - Vercel AI SDK Implementation
 * 
 * This playground uses Vercel AI SDK for real-time streaming chat.
 * It features a two-column layout:
 * - Left: List of available AI Agents
 * - Right: Chat interface
 * 
 * Features:
 * - Agent list fetching
 * - Real-time message streaming
 * - Clean, modern UI 
 * - Stop generation capability
 * - Automatic scrolling
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChatInterface } from '@/components/dashboard';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as VercelMessage } from 'ai/react'; // Vercel AI SDK Message type
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, MemoryStick, ToyBrick, ArrowLeft, List, PlusSquare, Loader2 } from "lucide-react";

// Import the new components
import AgentList from '@/components/dashboard/playground/AgentList';
import AgentHeader from '@/components/dashboard/playground/AgentHeader';
import ConversationListPanel from '@/components/dashboard/playground/ConversationListPanel';
import MemoryPanel from '@/components/dashboard/playground/MemoryPanel';
import ActionsPanel from '@/components/dashboard/playground/ActionsPanel';

// Import shared types (Use monorepo package)
import { Agent, Conversation, CreateConversationInput } from '@agent-base/types';


// Interface for individual messages (adjust if needed based on actual structure)
interface ChatMessage {
  id?: string; // Optional ID
  role: 'user' | 'assistant'; // Use Vercel SDK roles
  content: string;
}

// Mock message store
const mockMessages: { [key: string]: ChatMessage[] } = {
  'mock-crisp-1': [
    { role: 'user', content: 'Hi, I have a question about my recent Crisp order.' },
    { role: 'assistant', content: 'Hello! I can help with that. What is your order number?' },
  ],
  'mock-crisp-2': [
    { role: 'user', content: 'Can you help me integrate Crisp with Slack?' },
    { role: 'assistant', content: 'Certainly. You can find the integration settings under...' },
    { role: 'user', content: 'Got it, thanks!' },
  ],
  // Add entries for web mocks if needed, using their generated IDs is tricky, let's use placeholders
  'mock-web-chat-1': [
    { role: 'user', content: 'This is the first web chat message.' },
    { role: 'assistant', content: 'And this is the agent reply for web chat 1.' },
  ],
  'mock-web-chat-2': [
    { role: 'user', content: 'Starting another web conversation.' },
    { role: 'assistant', content: 'Okay, web chat 2 assistant here.' },
  ],
};

/**
 * Playground Page
 * Interactive chat environment using Vercel AI SDK with streaming responses
 * Fetches and displays a list of agents on the left, chat on the right.
 * Uses the dashboard context for user data
 */
export default function PlaygroundPage() {
  const { 
    user, 
    agents, // Get agents from context
    isLoadingAgents, // Get loading state from context
    agentError, // Get agent error from context
    selectedAgentId, // Get selected agent ID from context
    authToken, // Get auth token from context
    activeAgentView, // Get the active view from context
    getUserInitials // ADDED getUserInitials back from context
  } = useDashboard();
  
  // State for the current conversation's messages
  const [historyMessages, setHistoryMessages] = useState<VercelMessage[]>([]); 
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false); // New state for loading

  // State for chat history
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // State for the list of conversations for the selected agent
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);

  // State for displaying historical/selected messages
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);

  // State to control active tab
  const [activeTab, setActiveTab] = useState('chat'); // Default to chat

  // Effect to fetch data when selectedAgentId changes
  useEffect(() => {
    if (!selectedAgentId || !authToken) {
      setHistoryMessages([]);
      setIsLoadingHistory(false);
      setCurrentConversationId(null);
      setConversationList([]); // Reset conversation list
      setIsLoadingConversations(false);
      return;
    }

    const loadDataForAgent = async () => {
      // Combined loading state for now
      setIsLoadingHistory(true); 
      setIsLoadingConversations(true);
      setHistoryMessages([]);
      setCurrentConversationId(null);
      setConversationList([]); // Clear previous list
      console.log(`Loading data for agent ${selectedAgentId}...`);

      try {
        // STEP 1: Fetch conversation list or create new one if none exist
        console.log(`Calling /api/conversations/list-or-create for agent ${selectedAgentId}`);
        const convListResponse = await fetch(`/api/conversations/list-or-create?agent_id=${selectedAgentId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!convListResponse.ok) {
             const errData = await convListResponse.json().catch(() => ({})); 
             throw new Error(`Failed to list or create conversations: ${errData.error || convListResponse.statusText}`);
        }
        const convListData = await convListResponse.json();
        if (!convListData.success || !convListData.data) {
             throw new Error(`API error with conversations: ${convListData.error || 'Invalid data'}`);
        }
        
        // Store the fetched conversation list
        const fetchedConversations: Conversation[] = convListData.data || [];
        setConversationList(fetchedConversations);
        console.log(`Fetched ${fetchedConversations.length} conversations.`);
        setIsLoadingConversations(false);

        // STEP 2: Select Conversation - Now we are guaranteed to have at least one
        let conversationIdToUse: string | null = null;
        if (fetchedConversations.length > 0) {
            // Take the most recent one (assuming list is sorted by updated_at DESC)
            conversationIdToUse = fetchedConversations[0].conversationId;
            console.log(`Selected conversation: ${conversationIdToUse}`);
        } else {
             // This should not happen with the list-or-create endpoint
             console.error("Unexpected: No conversations returned from list-or-create endpoint");
             setIsLoadingHistory(false);
             return; 
        }
        setCurrentConversationId(conversationIdToUse);

        // STEP 3: Fetch messages for the selected conversation
        if (conversationIdToUse) {
            console.log(`Calling /messages/list for conversation ${conversationIdToUse}`);
            const messagesResponse = await fetch(`/api/messages/list?conversation_id=${conversationIdToUse}`, { 
                headers: { 'Authorization': `Bearer ${authToken}` } 
            });
             if (!messagesResponse.ok) { 
                 const errData = await messagesResponse.json().catch(() => ({})); 
                 throw new Error(`Failed to list messages: ${errData.error || messagesResponse.statusText}`); 
             }
             const messagesData = await messagesResponse.json();
             if (!messagesData.success || !messagesData.data) {
                 throw new Error(`API error listing messages: ${messagesData.error || 'Invalid data'}`);
             }

             // Use messages directly from the API without transformation
             setHistoryMessages(messagesData.data);
             console.log(`Loaded ${messagesData.data.length} messages for conversation ${conversationIdToUse}.`);
        } else {
             // Should not happen with current logic, but handle defensively
             setHistoryMessages([]); 
        }

      } catch (error: any) { 
        console.error(`Error loading data for agent:`, error);
        setIsLoadingHistory(false);
        setIsLoadingConversations(false);
      }
    };
    loadDataForAgent();
  }, [selectedAgentId, authToken]);

  // Function to handle creating a new chat/conversation
  const handleCreateNewChat = async () => {
    if (!selectedAgentId || !authToken || !user) {
      console.error("Cannot create new chat: Missing agent ID, auth token, or user info.");
      return;
    }

    console.log(`Starting new chat for agent ${selectedAgentId}...`);
    setIsCreatingConversation(true);

    try {
      // --- REAL API CALL --- 
      // Generate a new UUID for the conversation
      const newConversationId = crypto.randomUUID();
      const channelId = 'web'; // Default channel for playground

      const requestBody: CreateConversationInput = {
          agentId: selectedAgentId,
          channelId: channelId,
          conversationId: newConversationId
      };

      const response = await fetch('/api/conversations/create', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
          const errorMsg = responseData?.error || `HTTP error ${response.status}`;
          console.error("API call failed:", errorMsg, responseData);
          throw new Error(errorMsg || 'Failed to create conversation. Please try again.');
      }
      
      console.log("API success. New conversation created:", responseData);

      // --- Update State ---
      // Create a minimal conversation object for the list (consistent with previous mock)
      const newConversationForList: Conversation = {
          conversationId: newConversationId,
          agentId: selectedAgentId,
          channelId: channelId,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };

      // Add to the beginning of the list for immediate UI update
      setConversationList(prevList => [newConversationForList, ...prevList]); 
      // Set as current conversation
      setCurrentConversationId(newConversationId); 
      // Clear messages for the new chat
      setHistoryMessages([]); 
      // Switch to the chat tab
      setActiveTab('chat'); 

    } catch (error: any) {
      console.error("Error creating new chat:", error);
    } finally {
      setIsCreatingConversation(false); // Stop loading indicator
    }
  };

  // Function to load messages for a specific conversation (called from ConversationListPanel)
  const handleConversationSelect = async (conversationId: string) => {
      if (!authToken || !conversationId) return;
      console.log(`Playground: Selecting conversation ${conversationId}`);
      setIsLoadingHistory(true);
      setCurrentConversationId(conversationId);
      setHistoryMessages([]); // Clear previous messages
      try {
          const messagesResponse = await fetch(`/api/messages/list?conversation_id=${conversationId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
          if (!messagesResponse.ok) throw new Error(`Failed to list messages (${messagesResponse.status})`);
          const messagesData = await messagesResponse.json();
          if (!messagesData.success || !messagesData.data) throw new Error(messagesData.error || 'Invalid message data');
          setHistoryMessages(messagesData.data);
          console.log(`Playground: Loaded ${messagesData.data.length} messages for ${conversationId}.`);
      } catch (error) {
          console.error(`Playground: Error loading messages for ${conversationId}:`, error);
          setHistoryMessages([]); // Clear messages on error
          // TODO: Show error
      } finally {
          setIsLoadingHistory(false);
      }
  };

  // Find the selected agent details for display
  const selectedAgent = agents.find(agent => agent.id === selectedAgentId);

  // Function to find mock messages by ID (handling potentially dynamic web IDs)
  const getMockMessages = (id: string): ChatMessage[] => {
      if (mockMessages[id]) {
          return mockMessages[id];
      }
      // Basic fallback for dynamic web IDs
      if (id.startsWith('mock-web-')) {
          // You could alternate or use a hash for variety
          return mockMessages['mock-web-chat-1'] || []; 
      } 
      return []; // Default empty
  };

  // Handler for tab switching from Actions panel
  const handleActionNavigation = useCallback((conversationId: string, tabName: string) => {
    console.log(`Navigating to ${tabName} tab with conversation: ${conversationId}`);
    
    // Set the conversation ID
    setCurrentConversationId(conversationId);
    
    // Switch to the requested tab
    setActiveTab(tabName);
    
    // Load messages for this conversation
    if (conversationId && tabName === 'chat') {
      // You may want to fetch messages for this conversation here
      // For now, we'll use the mock messages
      const messages = getMockMessages(conversationId);
      setDisplayedMessages(messages);
      
      // If needed, trigger a message fetch
      // In a real app, you might fetch real messages for this conversation
    }
  }, []);

  // Helper function to render the main content based on activeAgentView
  const renderMainContent = () => {
    if (!selectedAgentId || !selectedAgent) {
      return <div className="flex items-center justify-center h-full text-gray-500">Please select an agent from the sidebar.</div>;
    }

    switch (activeAgentView) {
      case 'chat':
        if (!currentConversationId) {
            return (
                <div className="flex items-center justify-center h-full text-gray-400">
                    {isLoadingHistory ? 
                        <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading conversation...</> : 
                        "No active conversation. Select one or create a new chat."
                    }
                </div>
            );
        }
        return (
          <ChatInterface 
            key={`${selectedAgentId}-${currentConversationId}`} 
            agentId={selectedAgentId}
            conversationId={currentConversationId}
            initialMessages={historyMessages}
            userInitials={getUserInitials()}
            authToken={authToken} 
          />
        );
      case 'conversations':
        return (
          <ConversationListPanel 
            conversationList={conversationList} 
            isLoadingConversations={isLoadingConversations}
            historyError={agentError} 
            currentConversationId={currentConversationId} 
            onConversationSelect={handleConversationSelect} 
          />
        );
      case 'memory':
        return <MemoryPanel selectedAgent={selectedAgent} />;
      case 'actions':
        if (!currentConversationId) {
            return <div className="p-4">No active conversation selected.</div>;
        }
        return (
           <ActionsPanel 
              agentId={selectedAgentId}
              authToken={authToken} 
            />
        );
      default:
        return <div className="p-4">Select a view from the sidebar.</div>;
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <AgentHeader 
        agent={selectedAgent} 
        onCreateNewChat={handleCreateNewChat} 
        isCreatingChat={isCreatingConversation} 
      />

      <div className="flex-1 flex flex-col min-h-0">
        {isLoadingAgents ? (
           <div className="p-4 space-y-4">
             <Skeleton className="h-10 w-1/3 bg-gray-700" />
             <Skeleton className="h-64 w-full bg-gray-700" />
          </div>
        ) : agentError ? (
          <div className="p-4 text-red-400">Error loading agents: {agentError}</div>
        ) : (
          renderMainContent()
        )}
      </div>
    </div>
  );
} 