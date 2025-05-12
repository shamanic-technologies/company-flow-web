import React, { useState, useEffect } from 'react';
import { SearchWebhookResultItem, WebhookEvent } from '@agent-base/types'; // Import WebhookEvent
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Use shadcn Card
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

interface WebhookDetailPanelProps {
  webhook: SearchWebhookResultItem;
}

/**
 * WebhookDetailPanel Component
 * 
 * Displays the details of a selected webhook and fetches/displays its associated events.
 */
const WebhookDetailPanel: React.FC<WebhookDetailPanelProps> = ({ webhook }) => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!webhook?.id) return; // Don't fetch if no webhook is selected

    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);
      setEvents([]); // Clear previous events
      try {
        const response = await fetch(`/api/webhooks/get-events?webhookId=${webhook.id}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error?.details || 'Failed to fetch webhook events');
        }

        // Assuming the backend now correctly returns eventId
        setEvents(result.data || []); 
      } catch (err: any) {
        console.error("Error fetching webhook events:", err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [webhook?.id]); // Re-run effect if webhook ID changes

  return (
    <div className="p-4 h-full overflow-auto text-sm text-gray-200 bg-gray-900 space-y-4">
      {/* --- Webhook Details Card --- */}
      <Card className="bg-gray-800 border-gray-700 text-gray-300">
        <CardHeader>
          <CardTitle className="text-lg text-white">Webhook Details: {webhook.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <p><span className="font-semibold">ID:</span> {webhook.id}</p>
          <p><span className="font-semibold">Provider:</span> {webhook.webhookProviderId}</p>
          <p><span className="font-semibold">Event:</span> {webhook.subscribedEventId}</p>
          <p><span className="font-semibold">Description:</span> {webhook.description}</p>
          <p>
            <span className="font-semibold">User Link Status:</span> 
            {webhook.isLinkedToCurrentUser 
              ? <span className="text-green-400"> Linked ({webhook.currentUserWebhookStatus || 'N/A'})</span> 
              : <span className="text-yellow-400"> Not Linked</span>}
          </p>
          <p>
            <span className="font-semibold">Agent Link Status:</span> 
            {webhook.isLinkedToAgent 
              ? <span className="text-green-400"> Linked (Agent ID: {webhook.linkedAgentId || 'N/A'})</span> 
              : <span className="text-yellow-400"> Not Linked to Agent</span>}
          </p>
        </CardContent>
      </Card>

      {/* --- Webhook Events Section --- */}
      <h3 className="text-md font-medium text-gray-300">Received Events</h3>
      
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full bg-gray-700" />
          <Skeleton className="h-16 w-full bg-gray-700" />
          <Skeleton className="h-16 w-full bg-gray-700" />
        </div>
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
        <div className="space-y-2">
          {events.map((event) => (
            <Card key={event.eventId} className="bg-gray-800 border-gray-700 text-gray-400">
              <CardContent className="text-xs p-3 space-y-1">
                <p><span className="font-semibold text-gray-300">Event ID:</span> {event.eventId}</p>
                <p><span className="font-semibold text-gray-300">Created:</span> {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'N/A'}</p>
                <p><span className="font-semibold text-gray-300">Provider/Event:</span> {event.providerId} / {event.subscribedEventId}</p>
                <p><span className="font-semibold text-gray-300">Conversation ID:</span> {event.conversationId || 'N/A'}</p>
                <p><span className="font-semibold text-gray-300">Agent ID:</span> {event.agentId || 'N/A'}</p>
                {/* Optionally display payload keys or a summary */} 
                {/* <p><span className="font-semibold text-gray-300">Payload Keys:</span> {Object.keys(event.payload || {}).join(', ')}</p> */} 
              </CardContent>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
};

export default WebhookDetailPanel; 