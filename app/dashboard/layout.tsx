'use client';

import { ReactNode, useContext, useState, useEffect, useCallback } from 'react';
import { DashboardContext, DashboardProvider } from '@/components/dashboard/context/DashboardContext';
// import Sidebar from '@/components/dashboard/Sidebar'; // Comment out alias import
import Sidebar from '../../components/dashboard/Sidebar'; // Use relative path import
import ChatInterface from '@/components/dashboard/Chat/ChatInterface';
// Import Conversation type (adjust path if necessary)
import { Conversation } from '@agent-base/types'; 
// Import the new middle panel component (assuming move is done)
import MainDashboardPanel from '@/components/dashboard/MainDashboardPanel'; 
// Import types
import { Agent, CreateConversationInput } from '@agent-base/types'; 
import { Message as VercelMessage } from 'ai/react'; // Import Vercel message type

/**
 * Main Dashboard Layout and Logic Container
 * Renders the 3-column layout (Sidebar, Main Panel, Static Chat)
 * Manages overall dashboard state like selected agent, active view,
 * fetches data for both middle and right panels.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  // This layout now contains the primary logic, so we don't need children
  // It directly renders the full dashboard structure.

  // Inner component to access context and manage state
  const LayoutContent = () => {
    const { 
      authToken, 
      user, 
      agents, 
      isLoadingAgents, 
      agentError: contextAgentError, // Rename to avoid clash
      selectedAgentId: contextSelectedAgentId, // Use initial value from context
      setSelectedAgentId, // Get setter from context
      activeAgentView, // Use active view from context
      setActiveAgentView, // Use setter from context
      getUserInitials
    } = useContext(DashboardContext);

    // --- State previously in PlaygroundPage --- 
    const [historyMessages, setHistoryMessages] = useState<VercelMessage[]>([]); 
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [conversationList, setConversationList] = useState<Conversation[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(false);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false); 
    const [fetchError, setFetchError] = useState<string | null>(null); // Combined error state

    // --- State for the static chat panel (Right Column) ---
    const [staticAgentId, setStaticAgentId] = useState<string | null>(null);
    const [staticConversationId, setStaticConversationId] = useState<string | null>(null);
    const [isLoadingStaticData, setIsLoadingStaticData] = useState<boolean>(false); 

    // --- Effects --- 

    // Effect 1: Initialize selected agent and load static chat data for the first agent
    useEffect(() => {
      if (!isLoadingAgents && agents && agents.length > 0) {
        const firstAgent = agents[0];
        // Initialize selected agent to the first one if none is selected yet
        if (!contextSelectedAgentId && setSelectedAgentId) {
            console.log("Layout: Initializing selected agent to:", firstAgent.id);
            setSelectedAgentId(firstAgent.id);
        }

        // Fetch static data for the first agent
        if (firstAgent.id !== staticAgentId) { // Avoid refetch if already set
            const fetchStaticConversation = async () => {
              console.log(`Layout: Fetching static conversation data (Agent: ${firstAgent.id})`);
              setIsLoadingStaticData(true);
              setStaticAgentId(firstAgent.id); 
              setStaticConversationId(null); 
              setFetchError(null);

              if (!authToken) {
                  console.error("Static Chat: Auth token missing.");
                  setFetchError("Authentication token missing.");
                  setIsLoadingStaticData(false);
                  return;
              }

              try {
                const convListResponse = await fetch(`/api/conversations/list-or-create?agent_id=${firstAgent.id}`, { 
                  headers: { 'Authorization': `Bearer ${authToken}` } 
                });
                if (!convListResponse.ok) throw new Error(`Static Chat: Failed to list/create conversations (${convListResponse.status})`);
                
                const convListData = await convListResponse.json();
                if (!convListData.success || !convListData.data) throw new Error(`Static Chat: API error: ${convListData.error || 'Invalid data'}`);
                
                const fetchedConversations: Conversation[] = convListData.data || [];
                if (fetchedConversations.length > 0) {
                  setStaticConversationId(fetchedConversations[0].conversationId);
                  console.log(`Layout: Set static conversation ID: ${fetchedConversations[0].conversationId}`);
                } else {
                  console.error("Static Chat: No conversations found after list-or-create.");
                }
              } catch (error: any) {
                console.error("Static Chat: Error fetching conversation:", error);
                setFetchError(`Static Chat Error: ${error.message}`);
                setStaticConversationId(null);
              } finally {
                setIsLoadingStaticData(false);
              }
            };
            fetchStaticConversation();
        }
      } else if (!isLoadingAgents && (!agents || agents.length === 0)) {
         // Handle case where there are no agents
         console.log("Layout: No agents found.");
         setStaticAgentId(null);
         setStaticConversationId(null);
         if (contextSelectedAgentId && setSelectedAgentId) {
            setSelectedAgentId(null);
         }
      }
    // Dependencies: Run when agents load or auth token changes
    }, [agents, isLoadingAgents, authToken, contextSelectedAgentId, setSelectedAgentId, staticAgentId]);

    // Effect 2: Load data for the *selected* agent (Middle Panel)
    useEffect(() => {
      if (!contextSelectedAgentId || !authToken) {
        // Clear middle panel state if no agent selected or no token
        setHistoryMessages([]);
        setCurrentConversationId(null);
        setConversationList([]);
        setIsLoadingHistory(false);
        setIsLoadingConversations(false);
        setFetchError(null);
        return;
      }

      const loadDataForSelectedAgent = async () => {
        console.log(`Layout: Loading middle panel data for agent ${contextSelectedAgentId}...`);
        setIsLoadingHistory(true); 
        setIsLoadingConversations(true);
        setHistoryMessages([]);
        setCurrentConversationId(null);
        setConversationList([]); 
        setFetchError(null);

        try {
          // Step 1: Fetch conversations or create
          const convListResponse = await fetch(`/api/conversations/list-or-create?agent_id=${contextSelectedAgentId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
          if (!convListResponse.ok) throw new Error(`Middle Panel: Failed to list/create conversations (${convListResponse.status})`);
          const convListData = await convListResponse.json();
          if (!convListData.success || !convListData.data) throw new Error(`Middle Panel: API error: ${convListData.error || 'Invalid data'}`);

          const fetchedConversations: Conversation[] = convListData.data || [];
          setConversationList(fetchedConversations);
          setIsLoadingConversations(false);
          console.log(`Layout: Middle panel fetched ${fetchedConversations.length} conversations.`);

          // Step 2: Select latest conversation and fetch its messages
          if (fetchedConversations.length > 0) {
            const latestConversationId = fetchedConversations[0].conversationId;
            setCurrentConversationId(latestConversationId);
            console.log(`Layout: Middle panel selected conversation: ${latestConversationId}`);

            const messagesResponse = await fetch(`/api/messages/list?conversation_id=${latestConversationId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!messagesResponse.ok) throw new Error(`Middle Panel: Failed to list messages (${messagesResponse.status})`);
            const messagesData = await messagesResponse.json();
            if (!messagesData.success || !messagesData.data) throw new Error(`Middle Panel: API error listing messages: ${messagesData.error || 'Invalid data'}`);
            
            setHistoryMessages(messagesData.data); 
            console.log(`Layout: Middle panel loaded ${messagesData.data.length} messages.`);
          } else {
             console.error("Middle Panel: No conversations returned from list-or-create.");
             // Leave historyMessages empty
          }

        } catch (error: any) { 
          console.error(`Layout: Error loading middle panel data for agent ${contextSelectedAgentId}:`, error);
          setFetchError(`Middle Panel Error: ${error.message}`);
          // Clear state on error
          setHistoryMessages([]);
          setCurrentConversationId(null);
          setConversationList([]);
        } finally {
          setIsLoadingHistory(false);
          // Ensure conversations loading is also false if an error occurred before it was set
          if (isLoadingConversations) setIsLoadingConversations(false); 
        }
      };

      loadDataForSelectedAgent();
    // Dependencies: Run when selected agent or auth token changes
    }, [contextSelectedAgentId, authToken]);

    // --- Handlers --- 

    // Function to handle creating a new chat/conversation (previously in PlaygroundPage)
    const handleCreateNewChat = useCallback(async () => {
      if (!contextSelectedAgentId || !authToken || !user) {
        console.error("Cannot create new chat: Missing selected agent ID, auth token, or user info.");
        setFetchError("Cannot create new chat: Missing required info.");
        return;
      }
      if (!setActiveAgentView) {
          console.error("setActiveAgentView is not available from context");
          return;
      }

      console.log(`Layout: Starting new chat for agent ${contextSelectedAgentId}...`);
      setIsCreatingConversation(true);
      setFetchError(null);

      try {
        const newConversationId = crypto.randomUUID();
        const channelId = 'web'; // Default channel for dashboard

        const requestBody: CreateConversationInput = {
            agentId: contextSelectedAgentId,
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
            throw new Error(responseData?.error || `Failed to create conversation (HTTP ${response.status})`);
        }
        
        console.log("Layout: New conversation created:", responseData);
        const newConversation: Conversation = responseData.data; 

        // Update state: Add to list, set as current, clear messages
        setConversationList(prevList => [newConversation, ...prevList]); 
        setCurrentConversationId(newConversationId); 
        setHistoryMessages([]); 
        
        // Switch middle panel view to chat
        setActiveAgentView('chat'); 

      } catch (error: any) {
        console.error("Layout: Error creating new chat:", error);
        setFetchError(`Error creating chat: ${error.message}`);
      } finally {
        setIsCreatingConversation(false); 
      }
    }, [contextSelectedAgentId, authToken, user, setActiveAgentView]); // Added setActiveAgentView dependency

    // Function to load messages for a specific conversation (previously in PlaygroundPage)
    const handleConversationSelect = useCallback(async (conversationId: string) => {
        if (!authToken || !conversationId || !contextSelectedAgentId) {
          setFetchError("Cannot select conversation: Missing required info.");
          return;
        }
        if (!setActiveAgentView) {
          console.error("setActiveAgentView is not available from context");
          return;
        }

        console.log(`Layout: Selecting conversation ${conversationId} for agent ${contextSelectedAgentId}`);
        setIsLoadingHistory(true);
        setCurrentConversationId(conversationId);
        setHistoryMessages([]); 
        setFetchError(null);

        try {
            const messagesResponse = await fetch(`/api/messages/list?conversation_id=${conversationId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!messagesResponse.ok) throw new Error(`Failed to list messages (${messagesResponse.status})`);
            const messagesData = await messagesResponse.json();
            if (!messagesData.success || !messagesData.data) throw new Error(messagesData.error || 'Invalid message data');
            setHistoryMessages(messagesData.data);
            console.log(`Layout: Loaded ${messagesData.data.length} messages for ${conversationId}.`);
        } catch (error: any) {
            console.error(`Layout: Error loading messages for ${conversationId}:`, error);
            setFetchError(`Error loading messages: ${error.message}`);
            setHistoryMessages([]); // Clear messages on error
        } finally {
            setIsLoadingHistory(false);
        }
        
        // Switch middle panel view to chat
        setActiveAgentView('chat'); 
    }, [authToken, contextSelectedAgentId, setActiveAgentView]); // Added setActiveAgentView dependency

    // --- Data for Rendering --- 
    const selectedAgent = agents?.find(agent => agent.id === contextSelectedAgentId);
    const userInitials = getUserInitials ? getUserInitials() : 'U';

    // --- Render Logic --- 
    return (
      <div className="flex h-screen overflow-hidden bg-gray-950">
        {/* Sidebar - Pass setters for agent/view selection */}
        <Sidebar /> 

        {/* Main Content Area (Middle Column) - Render MainDashboardPanel */}
        <div className="flex flex-col flex-grow flex-shrink flex-basis-0 overflow-hidden min-w-0">
          {/* Handle loading/error states for the main panel */}
          {isLoadingAgents ? (
            <div className="flex items-center justify-center h-full text-gray-400">Loading agents...</div>
          ) : contextAgentError ? (
            <div className="flex items-center justify-center h-full text-red-400">Error loading agents: {contextAgentError}</div>
          ) : !selectedAgent ? (
            <div className="flex items-center justify-center h-full text-gray-400">
                {agents && agents.length > 0 ? "Select an agent from the list." : "No agents available."}
            </div>
          ) : fetchError && activeAgentView !== 'actions' ? ( // Show fetch error unless in actions panel
             <div className="p-4 text-red-400">Error: {fetchError}</div>
          ) : (
            <MainDashboardPanel 
                selectedAgent={selectedAgent}
                activeAgentView={activeAgentView || 'chat'} // Default to chat if undefined
                currentConversationId={currentConversationId}
                historyMessages={historyMessages}
                isLoadingHistory={isLoadingHistory}
                conversationList={conversationList}
                isLoadingConversations={isLoadingConversations}
                agentError={fetchError} // Pass combined fetch error
                authToken={authToken}
                userInitials={userInitials}
                isCreatingConversation={isCreatingConversation}
                handleConversationSelect={handleConversationSelect}
                handleCreateNewChat={handleCreateNewChat}
            />
          )}
        </div>

        {/* Static Chat Column (Right) */}
        <div className="w-96 flex flex-col h-screen overflow-hidden border-l border-gray-700 bg-gray-900">
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            {/* Render static ChatInterface */}
            {authToken && staticAgentId && staticConversationId && !isLoadingStaticData ? (
              <ChatInterface
                key={`static-${staticAgentId}-${staticConversationId}`}
                authToken={authToken} 
                userInitials={userInitials} 
                agentId={staticAgentId} 
                conversationId={staticConversationId}
                // Assuming ChatInterface fetches its own initial messages
              />
            ) : (
              <div className="text-gray-400 text-center mt-4">
                {isLoadingAgents || isLoadingStaticData ? 'Loading static chat...' : 'Static chat unavailable.'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render the Provider and the inner component that uses the context
  return (
    <DashboardProvider>
      <LayoutContent />
    </DashboardProvider>
  );
} 