import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { ApiTool } from '@agent-base/types'; // Import ApiTool

// ToolItem interface removed, using ApiTool from @agent-base/types

interface ToolDetailPanelProps {
  tool: ApiTool; // Changed to ApiTool
}

/**
 * ToolDetailPanel Component
 * 
 * Displays the details of a selected tool.
 */
const ToolDetailPanel: React.FC<ToolDetailPanelProps> = ({ tool }) => {
  if (!tool) {
    return (
      <div className="p-4 h-full flex items-center justify-center text-sm text-gray-500">
        No tool selected or tool data is unavailable.
      </div>
    );
  }

  // Attempt to get a display name. Fallback to ID.
  const displayName = (tool as any).name || tool.id;
  const description = (tool as any).description;
  const status = (tool as any).status;
  const utilityProvider = (tool as any).utilityProvider;
  const securityOption = (tool as any).securityOption;
  const isVerified = (tool as any).isVerified;
  const creatorUserId = (tool as any).creatorUserId;
  const userId = (tool as any).userId; // This might be the same as creatorUserId or different
  const totalExecutions = (tool as any).totalExecutions;
  const succeededExecutions = (tool as any).succeededExecutions;
  const failedExecutions = (tool as any).failedExecutions;
  const createdAt = (tool as any).createdAt;
  const updatedAt = (tool as any).updatedAt;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  };

  return (
    <div className="p-2 h-full overflow-auto text-sm text-gray-200 space-y-2">
      {/* --- Tool Details Card --- */}
      <Card className="border-gray-700 text-gray-300">
        <CardHeader className="p-3 flex flex-row items-center space-x-2">
          <Package className="h-5 w-5 text-gray-400" />
          <CardTitle className="text-base text-white">Tool: {displayName}</CardTitle>
        </CardHeader>
        <CardContent className="text-xs p-3 space-y-1.5">
          <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 items-center">
            <span className="font-semibold text-gray-400">ID:</span>
            <span className="font-mono break-all">{tool.id}</span>

            {(tool as any).name && (
              <>
                <span className="font-semibold text-gray-400">Name:</span>
                <span>{(tool as any).name}</span>
              </>
            )}

            {status && (
              <>
                <span className="font-semibold text-gray-400">Status:</span>
                <span className="capitalize">{String(status)}</span>
              </>
            )}

            {description && (
              <>
                <span className="font-semibold text-gray-400">Description:</span>
                <span className="whitespace-pre-wrap">{String(description)}</span>
              </>
            )}

            {utilityProvider && (
              <>
                <span className="font-semibold text-gray-400">Provider:</span>
                <span>{String(utilityProvider)}</span>
              </>
            )}

            {securityOption && (
              <>
                <span className="font-semibold text-gray-400">Security:</span>
                <span>{String(securityOption)}</span>
              </>
            )}

            {typeof isVerified === 'boolean' && (
              <>
                <span className="font-semibold text-gray-400">Verified:</span>
                <span>{isVerified ? 'Yes' : 'No'}</span>
              </>
            )}
            
            {userId && (
              <>
                <span className="font-semibold text-gray-400">User ID:</span>
                <span className="font-mono break-all">{String(userId)}</span>
              </>
            )}

            {creatorUserId && userId !== creatorUserId && ( // Only show if different from userId
              <>
                <span className="font-semibold text-gray-400">Creator ID:</span>
                <span className="font-mono break-all">{String(creatorUserId)}</span>
              </>
            )}

            {typeof totalExecutions === 'number' && (
              <>
                <span className="font-semibold text-gray-400">Total Runs:</span>
                <span>{totalExecutions}</span>
              </>
            )}

            {typeof succeededExecutions === 'number' && (
              <>
                <span className="font-semibold text-gray-400">Successful:</span>
                <span>{succeededExecutions}</span>
              </>
            )}

            {typeof failedExecutions === 'number' && (
              <>
                <span className="font-semibold text-gray-400">Failed:</span>
                <span>{failedExecutions}</span>
              </>
            )}

            {createdAt && (
              <>
                <span className="font-semibold text-gray-400">Created:</span>
                <span>{formatDate(createdAt)}</span>
              </>
            )}

            {updatedAt && (
              <>
                <span className="font-semibold text-gray-400">Updated:</span>
                <span>{formatDate(updatedAt)}</span>
              </>
            )}
          </div>
          {/* Placeholder for more tool details like OpenAPI Spec if it's a string */}
          {/* {(tool as any).openapiSpecification && typeof (tool as any).openapiSpecification === 'string' && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <h4 className="font-semibold text-gray-400 mb-1">OpenAPI Spec:</h4>
              <pre className="whitespace-pre-wrap bg-gray-800 p-2 rounded text-xs font-mono">
                {String((tool as any).openapiSpecification)}
              </pre>
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* Placeholder for tool-specific actions or configurations */}
      <Card className="border-gray-700 text-gray-300 mt-2">
        <CardHeader className="p-3">
          <CardTitle className="text-base text-white">Tool Actions / Configuration</CardTitle>
        </CardHeader>
        <CardContent className="text-xs p-3">
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolDetailPanel; 