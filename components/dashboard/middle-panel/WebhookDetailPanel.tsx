import React from 'react';
import { Webhook } from '@agent-base/types'; // Import Webhook type

interface WebhookDetailPanelProps {
  webhook: Webhook; // The webhook object to display
}

/**
 * WebhookDetailPanel Component
 * 
 * Displays the details of a selected webhook, focusing on its configuration or code.
 */
const WebhookDetailPanel: React.FC<WebhookDetailPanelProps> = ({ webhook }) => {
  return (
    <div className="p-4 h-full overflow-auto text-sm text-gray-200 bg-gray-900">
      <h2 className="text-lg font-semibold mb-3 text-white">Webhook Details: {webhook.name}</h2>
      
      {/* Displaying the event payload schema as pre-formatted JSON */}
      <h3 className="text-md font-medium mb-1 text-gray-300">Event Payload Schema:</h3>
      <pre className="bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
        {JSON.stringify(webhook.eventPayloadSchema || {}, null, 2)} {/* Display eventPayloadSchema */}
      </pre>

      {/* Add more fields as needed */}
      <div className="mt-4 space-y-1 text-xs text-gray-400">
        <p><span className="font-semibold">ID:</span> {webhook.id}</p>
        <p><span className="font-semibold">Provider ID:</span> {webhook.webhookProviderId}</p>
        <p><span className="font-semibold">Subscribed Event ID:</span> {webhook.subscribedEventId}</p>
        <p><span className="font-semibold">Description:</span> {webhook.description}</p>
        {/* Add more details like requiredSecrets, mappings if useful */}
      </div>
    </div>
  );
};

export default WebhookDetailPanel; 