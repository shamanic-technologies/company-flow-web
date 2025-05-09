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
         <p><span className="font-semibold text-gray-300">Webhook URL:</span> <code className="text-cyan-400 break-all">{webhook.webhookUrl}</code></p>
      </div>

      <h3 className="text-md font-medium mb-1 text-gray-300">Event Payload Schema:</h3>
      <pre className="bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
        {JSON.stringify(webhook.eventPayloadSchema || {}, null, 2)}
      </pre>

      {/* Display requiredSecrets if present and not empty */}
      {webhook.requiredSecrets && webhook.requiredSecrets.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-1 text-gray-300">Required Secrets:</h3>
          <ul className="list-disc list-inside bg-gray-800 p-3 rounded-md text-xs">
            {webhook.requiredSecrets.map(secret => <li key={secret}>{secret}</li>)}
          </ul>
        </div>
      )}

      {/* Display clientUserIdentificationMapping if present */}
      {webhook.clientUserIdentificationMapping && Object.keys(webhook.clientUserIdentificationMapping).length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-1 text-gray-300">Client User Identification Mapping:</h3>
          <pre className="bg-gray-800 p-3 rounded-md overflow-x-auto text-xs">
            {JSON.stringify(webhook.clientUserIdentificationMapping, null, 2)}
          </pre>
        </div>
      )}

      {/* Display conversationIdIdentificationMapping if present */}
      {webhook.conversationIdIdentificationMapping && (
         <div className="mt-4">
          <h3 className="text-md font-medium mb-1 text-gray-300">Conversation ID Identification Mapping:</h3>
          <p className="bg-gray-800 p-3 rounded-md text-xs">{webhook.conversationIdIdentificationMapping}</p>
        </div>
      )}

    </div>
  );
};

export default WebhookDetailPanel; 