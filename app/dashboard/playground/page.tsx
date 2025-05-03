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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, MemoryStick, ToyBrick, ArrowLeft, List, PlusSquare } from "lucide-react";

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
    setSelectedAgentId, // Get setter from context
    authToken // Get auth token from context
  } = useDashboard();
  
  // --- NEW State for selected agent and messages ---
  const [historyMessages, setHistoryMessages] = useState<VercelMessage[]>([]); 
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false); // New state for loading
  // --- End NEW State ---

  // State for chat history
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // --- NEW STATE for conversation list --- 
  const [conversationList, setConversationList] = useState<Conversation[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
  // --- End NEW STATE ---

  // State for displaying historical/selected messages
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);

  // State to control active tab
  const [activeTab, setActiveTab] = useState('chat'); // Default to chat

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.displayName) return 'U';
    
    const names = user.displayName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

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

  // --- NEW Function to handle creating a new chat ---
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
  // --- End NEW Function ---

  // Handler for selecting an agent
  const handleAgentSelect = (agentId: string) => {
    if (agentId === selectedAgentId) return;
    setSelectedAgentId(agentId);
    setHistoryMessages([]);
    setIsLoadingHistory(true); 
    setIsLoadingConversations(true);
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

  // Handle selecting a conversation from the list
  const handleConversationSelect = useCallback((conversationId: string) => {
    console.log("Selected Conversation:", conversationId);
    setCurrentConversationId(conversationId);
    
    // --- Fetch *real* messages for the selected conversation ---
    const fetchMessagesForConversation = async () => {
        if (!authToken || !conversationId) return;
        
        console.log(`Fetching messages for selected conversation: ${conversationId}`);
        setIsLoadingHistory(true);
        setHistoryMessages([]); // Clear previous messages
        
        try {
            const messagesResponse = await fetch(`/api/messages/list?conversation_id=${conversationId}`, { 
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

            // Use messages directly from the API
            setHistoryMessages(messagesData.data || []); // Ensure it's an array
            console.log(`Loaded ${messagesData.data?.length || 0} messages for conversation ${conversationId}.`);
            
        } catch (error: any) {
            console.error("Error fetching messages for selected conversation:", error);
            setHistoryMessages([]); // Clear messages on error
        } finally {
            setIsLoadingHistory(false);
        }
    };

    fetchMessagesForConversation();
    // --- End message fetching ---

    // Switch view to the Chat tab
    setActiveTab('chat');
  }, [authToken]); // Add authToken dependency

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

  return (
    <div className="flex flex-col h-full">
       
      {/* Main Content Area - Takes full space now */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gray-800 rounded-lg">
          {/* Render Agent Header only if an agent is selected */} 
          {selectedAgent && (
            <AgentHeader 
              agent={selectedAgent} 
              onCreateNewChat={handleCreateNewChat} // Pass the handler
              isCreatingChat={isCreatingConversation} // Pass the loading state
            />
          )}
          
          {/* --- Tabs for Chat / Conversation List / Memory / Actions --- */} 
          {selectedAgentId && ( // Render tabs only if an agent is selected
               <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                  {/* Tabs List (Header for sub-tabs) */} 
                  <TabsList className="flex-shrink-0 grid w-full grid-cols-4 bg-gray-800 rounded-none border-b border-gray-700 p-0 h-10">
                    <TabsTrigger value="chat" className={tabTriggerStyles}><MessageSquare className="h-4 w-4 mr-1.5"/>Chat</TabsTrigger>
                    <TabsTrigger value="conversations" className={tabTriggerStyles}><List className="h-4 w-4 mr-1.5"/>Conversations</TabsTrigger>
                    <TabsTrigger value="memory" className={tabTriggerStyles}><MemoryStick className="h-4 w-4 mr-1.5"/>Memory</TabsTrigger>
                    <TabsTrigger value="actions" className={tabTriggerStyles}><ToyBrick className="h-4 w-4 mr-1.5"/>Actions</TabsTrigger>
                  </TabsList>
                  
                  {/* Chat Tab Content - Apply overflow-y-auto */} 
                  <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col p-0 m-0 data-[state=inactive]:hidden">
                     {/* Loading/Error states for conversation */} 
                     {isLoadingHistory && ( <div className="flex justify-center items-center h-full text-gray-400">Loading messages...</div> )}
                     {/* Display agentError if there was an issue loading conversations/initial data */}
                     {agentError && !isLoadingHistory && !isLoadingConversations && ( <div className="p-4 text-center text-red-400">Error: {agentError}</div> )}
                     
                     {/* Render ChatInterface only when conversation ID is available and not loading/error */} 
                     {!isLoadingHistory && !agentError && currentConversationId ? (
                         <ChatInterface 
                           key={`${selectedAgentId}-${currentConversationId}`} // Key ensures re-render on conversation change
                           authToken={authToken}
                           userInitials={getUserInitials()}
                           initialMessages={historyMessages} 
                           agentId={selectedAgentId} 
                           conversationId={currentConversationId} 
                         />
                       ) : (
                         !isLoadingHistory && !agentError && (
                           <div className="flex justify-center items-center h-full text-gray-500">
                              {/* Show agent error message if relevant, otherwise generic prompt */} 
                              {agentError ? `Error: ${agentError}` : "Select or start a conversation."}
                           </div>
                         )
                       )}
                  </TabsContent>

                  {/* Conversations Tab Content - Apply overflow-y-auto */} 
                  <TabsContent value="conversations" className="flex-1 overflow-y-auto flex flex-col p-0 m-0 data-[state=inactive]:hidden">
                    <ConversationListPanel 
                      conversationList={conversationList} 
                      isLoadingConversations={isLoadingConversations} 
                      historyError={agentError}
                      currentConversationId={currentConversationId} 
                      onConversationSelect={handleConversationSelect} 
                    />
                  </TabsContent>

                  {/* NEW Memory Tab Content - Apply overflow-y-auto */} 
                  <TabsContent value="memory" className="flex-1 overflow-y-auto flex flex-col p-0 m-0 data-[state=inactive]:hidden">
                     <MemoryPanel 
                       selectedAgent={selectedAgent}
                     />
                  </TabsContent>

                  {/* Actions Tab Content - Apply overflow-y-auto */}
                  <TabsContent value="actions" className="flex-1 overflow-y-auto p-4 m-0 data-[state=inactive]:hidden">
                    <ActionsPanel 
                      onSelectConversation={handleActionNavigation}
                      authToken={authToken}
                      agentId={selectedAgentId || ''}
                    />
                  </TabsContent>
               </Tabs>
          )}
          {/* Placeholder if no agent is selected */}
          {!selectedAgentId && !isLoadingAgents && (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select an agent from the sidebar to start.
            </div>
          )}
      </div>
    </div>
  );
}

// Helper for tab trigger styles (this is the correct one)
const tabTriggerStyles = "flex items-center justify-center rounded-none data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100 text-gray-400 h-full text-sm px-4"; 