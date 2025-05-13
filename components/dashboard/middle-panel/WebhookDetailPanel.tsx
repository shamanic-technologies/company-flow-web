import React, { useState, useEffect } from 'react';
import { SearchWebhookResultItem, WebhookEvent, UtilityProvider } from '@agent-base/types'; // Import WebhookEvent
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Use shadcn Card
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"; // Import Badge
import { formatDistanceToNow } from 'date-fns'; // Import date-fns function
// Import shadcn Table components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Terminal, Webhook } from "lucide-react"
import { CrispIcon, StripeIcon } from '@/components/icons';
import { DashboardContext, useDashboard } from '../context/DashboardContext';

interface WebhookDetailPanelProps {
  webhook: SearchWebhookResultItem;
}

// --- Helper Function to get Provider Icon (copied from WebhookSubfolder) ---
const getProviderIcon = (providerId?: UtilityProvider) => {
  switch (providerId) {
    case UtilityProvider.CRISP:
      return CrispIcon;
    case UtilityProvider.STRIPE:
      return StripeIcon;
    // Add other cases as needed (e.g., SLACK)
    case UtilityProvider.AGENT_BASE:
    default:
      return Webhook; // Default icon
  }
};

/**
 * WebhookDetailPanel Component
 * 
 * Displays the details of a selected webhook and fetches/displays its associated events.
 */
const WebhookDetailPanel: React.FC<WebhookDetailPanelProps> = ({ webhook }) => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Use selectConversationAndSetView from context
  const { selectConversationAndSetView } = useDashboard();

  useEffect(() => {
    if (!webhook?.id) {
      setEvents([]); // Clear events if no webhook is selected
      return; // Exit early
    }

    let isMounted = true; // Track mount status for async operations
    const fetchEvents = async () => {
      // Don't set loading true on interval refresh to avoid flashing
      // setIsLoading(true); 
      // setError(null); // Keep existing error until successful fetch
      try {
        const response = await fetch(`/api/webhooks/get-events?webhookId=${webhook.id}`);
        const result = await response.json();

        if (!isMounted) return; // Don't update state if component unmounted

        if (!response.ok || !result.success) {
          throw new Error(result.error?.details || 'Failed to fetch webhook events');
        }
        
        setError(null); // Clear error on successful fetch
        setEvents(result.data || []); 
      } catch (err: any) {
        if (!isMounted) return; // Don't update state if component unmounted
        console.error("Error fetching webhook events:", err);
        // Only set error if it hasn't been set already or is different
        // This prevents the error message from constantly reappearing on failed refreshes
        setError(prevError => prevError === (err.message || 'An unexpected error occurred') ? prevError : (err.message || 'An unexpected error occurred'));
      } finally {
        // Only set loading false on initial load, not interval
        // setIsLoading(false); 
      }
    };

    // Initial fetch
    setIsLoading(true); // Set loading true only for the initial fetch
    fetchEvents().finally(() => { 
      if (isMounted) setIsLoading(false); // Set loading false after initial fetch completes
    });

    // Set up interval for refreshing every 5 seconds
    const intervalId = setInterval(fetchEvents, 5000);

    // Cleanup function
    return () => {
      isMounted = false; // Set mount status to false
      clearInterval(intervalId); // Clear the interval
    };
  }, [webhook?.id]); // Re-run effect if webhook ID changes

  return (
    <div className="p-2 h-full overflow-auto text-sm text-gray-200 space-y-2">
      {/* --- Webhook Details Card --- */}
      <Card className="border-gray-700 text-gray-300">
        <CardHeader className="p-3">
          <CardTitle className="text-base text-white">Webhook: {webhook.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs p-3">
          <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 items-center">
            <span className="font-semibold text-gray-400">ID:</span> 
            <span className="font-mono break-all">{webhook.id}</span>

            <span className="font-semibold text-gray-400">Provider:</span> 
            <span>{webhook.webhookProviderId}</span>

            <span className="font-semibold text-gray-400">Event:</span> 
            <span>{webhook.subscribedEventId}</span>

            <span className="font-semibold text-gray-400">Description:</span> 
            <span className="whitespace-pre-wrap">{webhook.description || '-'}</span>

            <span className="font-semibold text-gray-400">User Status:</span>
            <div>
              {webhook.isLinkedToCurrentUser 
                ? <Badge className="border-green-600 bg-green-700/80 text-green-100 hover:bg-green-700/90 text-xs h-5 px-1.5">Linked ({webhook.currentUserWebhookStatus || 'N/A'})</Badge> 
                : <Badge className="border-yellow-600 bg-yellow-700/80 text-yellow-100 hover:bg-yellow-700/90 text-xs h-5 px-1.5">Not Linked</Badge>}
            </div>

            <span className="font-semibold text-gray-400">Agent Status:</span>
            <div>
              {webhook.isLinkedToAgent 
                ? <Badge className="border-green-600 bg-green-700/80 text-green-100 hover:bg-green-700/90 text-xs h-5 px-1.5">Linked (Agent: {webhook.linkedAgentId || 'N/A'})</Badge> 
                : <Badge className="border-yellow-600 bg-yellow-700/80 text-yellow-100 hover:bg-yellow-700/90 text-xs h-5 px-1.5">Not Linked</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>

      <h3 className="text-base font-medium text-gray-300 pt-2">Received Events</h3>
      
      {isLoading && (
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="text-gray-400 border-gray-700 h-8 px-2">Date</TableHead>
              <TableHead className="text-gray-400 border-gray-700 h-8 px-2">Source</TableHead>
              <TableHead className="text-gray-400 border-gray-700 h-8 px-2">Channel</TableHead>
              <TableHead className="text-gray-400 border-gray-700 h-8 px-2">Agent</TableHead>
              <TableHead className="text-gray-400 border-gray-700 h-8 px-2">Conversation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i} className="border-gray-700">
                <TableCell className="py-1 px-2"><Skeleton className="h-4 w-full bg-gray-700" /></TableCell>
                <TableCell className="py-1 px-2"><Skeleton className="h-4 w-20 bg-gray-700" /></TableCell>
                <TableCell className="py-1 px-2"><Skeleton className="h-4 w-full bg-gray-700" /></TableCell>
                <TableCell className="py-1 px-2"><Skeleton className="h-4 w-full bg-gray-700" /></TableCell>
                <TableCell className="py-1 px-2"><Skeleton className="h-4 w-full bg-gray-700" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {error && (
         <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error Fetching Events</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && events.length === 0 && (
        <p className="text-gray-500 italic">No events received for this webhook yet.</p>
      )}

      {!isLoading && !error && events.length > 0 && (
        <Table className="text-xs text-gray-400">
          <TableHeader>
            <TableRow className="hover:bg-gray-800/50">
              <TableHead className="text-gray-300 border-gray-700 h-8 px-2">Date</TableHead>
              <TableHead className="text-gray-300 border-gray-700 h-8 px-2">Source</TableHead>
              <TableHead className="text-gray-300 border-gray-700 h-8 px-2">Channel</TableHead>
              <TableHead className="text-gray-300 border-gray-700 h-8 px-2">Agent</TableHead>
              <TableHead className="text-gray-300 border-gray-700 h-8 px-2">Conversation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              // Get icon for the provider
              const IconComponent = getProviderIcon(event.providerId);
              return (
                <TableRow 
                  key={event.eventId} 
                  className="border-gray-700 hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => {
                    if (event.conversationId) {
                      selectConversationAndSetView(event.conversationId);
                    } else {
                      console.warn("No conversation ID associated with this event:", event.eventId);
                      selectConversationAndSetView(null);
                    }
                  }}
                >
                  <TableCell className="py-1 px-2">
                    {event.createdAt 
                      ? formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }) 
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <div className="flex items-center gap-1.5">
                      <IconComponent className="h-3.5 w-3.5 shrink-0" />
                      <span>{event.providerId}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-2">{event.subscribedEventId}</TableCell>
                  <TableCell className="py-1 px-2 font-mono">{event.agentId || 'N/A'}</TableCell>
                  <TableCell className="py-1 px-2 font-mono">{event.conversationId || 'N/A'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

    </div>
  );
};

export default WebhookDetailPanel; 