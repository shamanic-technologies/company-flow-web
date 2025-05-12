import React from 'react';
import { SearchWebhookResultItem } from '@agent-base/types'; // Import the correct type

interface WebhookDetailPanelProps {
  webhook: SearchWebhookResultItem; // Use the correct type for the prop
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
      
      <div className="mb-4 p-3 bg-gray-800 rounded-md text-xs space-y-1">
        <p><span className="font-semibold text-gray-300">ID:</span> {webhook.id}</p>
        <p><span className="font-semibold text-gray-300">Provider:</span> {webhook.webhookProviderId}</p>
        <p><span className="font-semibold text-gray-300">Event:</span> {webhook.subscribedEventId}</p>
        <p><span className="font-semibold text-gray-300">Description:</span> {webhook.description}</p>
        <p>
          <span className="font-semibold text-gray-300">User Link Status:</span> 
          {webhook.isLinkedToCurrentUser 
            ? <span className="text-green-400"> Linked ({webhook.currentUserWebhookStatus || 'N/A'})</span> 
            : <span className="text-yellow-400"> Not Linked</span>}
        </p>
        <p>
          <span className="font-semibold text-gray-300">Agent Link Status:</span> 
          {webhook.isLinkedToAgent 
            ? <span className="text-green-400"> Linked (Agent ID: {webhook.linkedAgentId || 'N/A'})</span> 
            : <span className="text-yellow-400"> Not Linked to Agent</span>}
        </p>
      </div>

      {/* Removed sections for eventPayloadSchema, requiredSecrets, clientUserIdentificationMapping as they are no longer part of the core webhook definition/search result */}

      {/* Display conversationIdIdentificationMapping if present */}
      {/* Note: conversationIdIdentificationMapping is also not on SearchWebhookResultItem */}
      {/* If needed, it must be fetched separately or added back to the search result */}
      {/* Removing this section for now as the data isn't available on the current prop type */}
      {/*
      {webhook.conversationIdIdentificationMapping && (
         <div className="mt-4">
          <h3 className="text-md font-medium mb-1 text-gray-300">Conversation ID Identification Mapping:</h3>
          <p className="bg-gray-800 p-3 rounded-md text-xs">{webhook.conversationIdIdentificationMapping}</p>
        </div>
      )}
      */}

    </div>
  );
};

export default WebhookDetailPanel; 