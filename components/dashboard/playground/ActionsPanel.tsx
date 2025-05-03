'use client';

import React, { useState, useEffect } from 'react';
import { GmailIcon, StripeIcon, CrispIcon } from '@/components/icons';
import { formatDistanceToNowStrict } from 'date-fns';
import { Message as VercelMessage } from 'ai/react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

// --- Type Definitions for Processed Data ---
interface MonthlyCount {
  [month: string]: { // e.g., "2023-10"
    gmail: number;
    stripe: number;
    crisp: number;
  }
}

interface ProcessedAction {
  id: string;
  type: 'gmail' | 'stripe' | 'crisp';
  title: string;
  detail: string;
  timestamp: Date;
}

// --- Helper Components ---
interface BarGraphProps {
  title: React.ReactNode;
  data: { month: string; value: number }[];
  colorClass: string;
}

const SimpleBarGraph: React.FC<BarGraphProps> = ({ title, data, colorClass }) => {
  // Get the maximum value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  // The max height in pixels for the tallest bar
  const MAX_BAR_HEIGHT = 100; // pixels
  
  return (
    <div className="flex-1 bg-gray-800 p-3 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
          {title}
        </h4>
        
        {/* Show max value to provide scale context */}
        <span className="text-xs text-gray-500">{maxValue > 0 ? `Max: ${maxValue}` : ''}</span>
      </div>
      
      <div className="h-32 flex items-end justify-between space-x-1 mt-5 pt-2 relative">
        {/* Tooltip container - absolute positioned above bars */}
        <div className="absolute -top-6 left-0 right-0 h-6">
          {data.map((item, i) => (
            <div key={`tooltip-${i}`} className="absolute opacity-0 group-hover:opacity-100 text-xs font-medium text-white bg-gray-700/90 px-2 py-1 rounded pointer-events-none transition-opacity duration-200"
                 style={{ 
                   left: `${(i * (100 / data.length)) + (50 / data.length) - 10}%`,
                   transform: 'translateX(-50%)',
                   display: 'none' // Will be shown by JS on hover
                 }}>
              {item.value}
            </div>
          ))}
        </div>
        
        {data.map((item, i) => {
          // Calculate height as a percentage of max value
          const percentage = maxValue > 0 ? (item.value / maxValue) : 0;
          // Calculate actual height in pixels (with a minimum for visibility)
          const heightPx = item.value > 0 
            ? Math.max(4, percentage * MAX_BAR_HEIGHT) 
            : 0;
          
          return (
            <div key={i} className="flex flex-col items-center flex-1 group relative">
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-medium text-white bg-gray-800 px-2 py-1 rounded pointer-events-none z-10">
                {item.value}
              </div>
              {/* The bar itself */}
              <div 
                className={`w-full rounded-t ${item.value > 0 ? colorClass : 'bg-gray-800'} transition-colors duration-200`} 
                style={{ 
                  height: `${heightPx}px`,
                  minHeight: item.value > 0 ? '4px' : '0'
                }}
              />
              {/* Month label */}
              <div className="text-xs text-gray-500 mt-1">{item.month}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const actionIcons: { [key: string]: React.ElementType } = {
  gmail: GmailIcon,
  stripe: StripeIcon,
  crisp: CrispIcon,
};

// --- Main Actions Panel Component ---
interface ActionsPanelProps {
  onSelectConversation?: (conversationId: string, tabName: string) => void;
  authToken: string;
  agentId: string;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({ onSelectConversation, authToken, agentId }) => {
  const [monthlyCounts, setMonthlyCounts] = useState<MonthlyCount>({});
  const [recentProcessedActions, setRecentProcessedActions] = useState<ProcessedAction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filteredActions, setFilteredActions] = useState<ProcessedAction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!agentId) {
        setError("No agent selected");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        console.log(`Calling /api/messages/list-by-agent for agent ${agentId}`);
        const response = await fetch(`/api/messages/list-by-agent?agent_id=${agentId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data)) {
          throw new Error('Invalid data format received from API');
        }

        // Treat fetched data loosely, acknowledging type mismatch for content
        const messages: any[] = result.data.map((msg: any) => ({ 
          ...msg,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(), 
        }));

        // --- Process Messages --- 
        const counts: MonthlyCount = {};
        const processedActions: ProcessedAction[] = [];
        const relevantUtilityIds = ['gmail_send', 'stripe_refund', 'crisp_chat'];

        messages.forEach(msg => {
          // Check for assistant messages with parts array
          if (msg.role === 'assistant' && Array.isArray(msg.parts)) {
            // Iterate through parts looking for tool-invocation
            msg.parts.forEach((part: any) => {
              // Check for tool-invocation type with toolInvocation property
              if (part?.type === 'tool-invocation' && part.toolInvocation) {
                const toolInvocation = part.toolInvocation;
                const args = toolInvocation.args; // Get args from toolInvocation
                
                if (!args || !args.utility_id) return;
                
                const utilityId: string = args.utility_id;
                
                if (relevantUtilityIds.includes(utilityId)) {
                  const timestamp = msg.createdAt;
                  const monthYear = timestamp.toISOString().slice(0, 7);

                  if (!counts[monthYear]) {
                    counts[monthYear] = { gmail: 0, stripe: 0, crisp: 0 };
                  }

                  let actionType: 'gmail' | 'stripe' | 'crisp' | null = null;
                  let actionTitle = '';
                  let actionDetail = '';

                  if (utilityId === 'gmail_send') {
                    counts[monthYear].gmail++;
                    actionType = 'gmail';
                    actionTitle = 'Sent email';
                    actionDetail = `To: ${args.to || 'N/A'} - Subject: ${args.subject || 'N/A'}`;
                  } else if (utilityId === 'stripe_refund') {
                    counts[monthYear].stripe++;
                    actionType = 'stripe';
                    actionTitle = 'Processed Refund';
                    actionDetail = `Charge: ${args.charge_id || 'N/A'} - Amount: $${((args.amount || 0) / 100).toFixed(2)}`;
                  } else if (utilityId === 'crisp_chat') {
                    counts[monthYear].crisp++;
                    actionType = 'crisp';
                    actionTitle = 'Sent chat';
                    actionDetail = `ID: ${args.conversation_id || 'N/A'}`;
                  }

                  if (actionType) {
                    processedActions.push({
                      id: msg.id,
                      type: actionType,
                      title: actionTitle,
                      detail: actionDetail,
                      timestamp: timestamp,
                    });
                  }
                }
              }
            });
          }
        });
        
        processedActions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setMonthlyCounts(counts);
        setRecentProcessedActions(processedActions);

      } catch (err: any) {
        console.error('Error fetching or processing messages:', err);
        setError(err.message || 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [agentId, authToken]);

  // Apply filters whenever filter conditions or actions change
  useEffect(() => {
    let filtered = [...recentProcessedActions];
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter(action => action.type === filterType);
    }
    
    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        action => 
          action.title.toLowerCase().includes(query) || 
          action.detail.toLowerCase().includes(query)
      );
    }
    
    setFilteredActions(filtered);
  }, [recentProcessedActions, filterType, searchQuery]);

  // --- Prepare data for graphs --- 
  const graphMonths = Object.keys(monthlyCounts).sort().slice(-3); // Get last 3 months
  const monthLabels = graphMonths.map(m => { // Format YYYY-MM to Mon
      const date = new Date(m + '-01T12:00:00Z'); // Use day 1, noon UTC
      return date.toLocaleString('default', { month: 'short' });
  });

  const gmailGraphData = graphMonths.map((m, index) => ({
      month: monthLabels[index],
      value: monthlyCounts[m]?.gmail || 0
  }));
  const stripeGraphData = graphMonths.map((m, index) => ({
      month: monthLabels[index],
      value: monthlyCounts[m]?.stripe || 0
  }));
  const crispGraphData = graphMonths.map((m, index) => ({
      month: monthLabels[index],
      value: monthlyCounts[m]?.crisp || 0
  }));

  // Function to handle row click
  const handleActionClick = (action: ProcessedAction) => {
    if (!onSelectConversation) return;
    
    // Extract conversation ID from action
    let conversationId = '';
    
    if (action.type === 'crisp') {
      // Format: "ID: conv_apr1"
      const match = action.detail.match(/ID: (conv_[a-z0-9_]+)/i);
      conversationId = match ? match[1] : '';
    } else if (action.type === 'gmail' || action.type === 'stripe') {
      // For email/refund actions, we can use the timestamp to find the relevant conversation
      // This is a simplified approach - in a real app you'd have proper conversation IDs
      // Use the action ID which should be associated with the message
      conversationId = action.id;
    }
    
    if (conversationId) {
      // Navigate to the chat tab with this conversation
      onSelectConversation(conversationId, 'chat');
    }
  };

  // --- Render Component --- 
  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading actions data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Error loading data: {error}</div>;
  }

  // If no actions found at all (not just filtered)
  if (recentProcessedActions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-gray-800/30 rounded-lg">
        <div className="w-16 h-16 mb-6 rounded-full bg-gray-800 flex items-center justify-center">
          <Filter className="w-8 h-8 text-gray-500" />
        </div>
        <h3 className="text-gray-300 text-lg font-medium mb-2">No Actions Found</h3>
        <p className="text-gray-500 max-w-md mb-4">
          When your agent performs actions like sending emails, processing payments, or starting conversations, 
          they will appear here.
        </p>
        <p className="text-gray-600 text-sm">
          Try asking your agent to perform an action in the chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Graphs Section */}
      <div className="mb-6 flex-shrink-0">
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Monthly Action Summary</h3>
        <div className="flex space-x-4">
          <SimpleBarGraph 
            title={<><GmailIcon className="h-4 w-4" /><span>Sent emails</span></>}
            data={gmailGraphData}
            colorClass="bg-red-500" 
          />
          <SimpleBarGraph 
            title={<><StripeIcon className="h-4 w-4" /><span>Refunds</span></>}
            data={stripeGraphData}
            colorClass="bg-indigo-500"
          />
          <SimpleBarGraph 
            title={<><CrispIcon className="h-4 w-4" /><span>Sent chats</span></>}
            data={crispGraphData}
            colorClass="bg-blue-500"
          />
        </div>
      </div>

      {/* Actions Table Section with Filters */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-200 flex-shrink-0">Actions</h3>
          <div className="flex gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search actions..."
                className="pl-8 h-9 w-64 bg-gray-800 border-gray-700 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="h-9 w-40 bg-gray-800 border-gray-700 text-sm">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter type" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="gmail">Emails</SelectItem>
                <SelectItem value="stripe">Refunds</SelectItem>
                <SelectItem value="crisp">Conversations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Actions Table */}
        {filteredActions.length === 0 ? (
          <div className="text-sm text-gray-500 p-4 text-center bg-gray-800/60 rounded-md">
            {searchQuery || filterType !== "all" 
              ? "No actions match your filters" 
              : "No actions found"}
          </div>
        ) : (
          <div className="rounded-md border border-gray-700 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow className="hover:bg-gray-700/50 border-b border-gray-700">
                  <TableHead className="text-gray-400 font-medium">Time</TableHead>
                  <TableHead className="text-gray-400 font-medium">Type</TableHead>
                  <TableHead className="text-gray-400 font-medium">Action</TableHead>
                  <TableHead className="text-gray-400 font-medium">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.map((action) => {
                  const IconComponent = actionIcons[action.type] || null;
                  const formattedDate = formatDistanceToNowStrict(action.timestamp, { addSuffix: true });
                  
                  return (
                    <TableRow 
                      key={action.id} 
                      className="hover:bg-gray-700/40 border-b border-gray-800 cursor-pointer transition-all duration-200 group relative"
                      onClick={() => handleActionClick(action)}
                    >
                      <TableCell className="text-xs text-gray-500 group-hover:text-gray-300 transition-colors pl-4 relative">
                        {/* Left highlight bar as pseudo-element inside TableCell */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-3" />
                        {formattedDate}
                      </TableCell>
                      <TableCell className="group-hover:scale-110 transition-transform duration-200">
                        {IconComponent && <IconComponent className="h-5 w-5 text-gray-400 group-hover:text-gray-200" />}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                        {action.title}
                      </TableCell>
                      <TableCell className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                        {action.detail}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionsPanel; 