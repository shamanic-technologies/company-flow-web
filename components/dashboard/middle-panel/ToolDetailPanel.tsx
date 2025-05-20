import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { ApiTool, SearchApiToolResultItem } from '@agent-base/types'; // Import ApiTool

// ToolItem interface removed, using ApiTool from @agent-base/types

interface ToolDetailPanelProps {
  searchApiTool: SearchApiToolResultItem; // Changed to ApiTool
}

/**
 * ToolDetailPanel Component
 * 
 * Displays the details of a selected tool.
 */
const ToolDetailPanel: React.FC<ToolDetailPanelProps> = ({ searchApiTool }) => {
  if (!searchApiTool) {
    return (
      <div className="p-4 h-full flex items-center justify-center text-sm text-gray-500">
        No tool selected or tool data is unavailable.
      </div>
    );
  }

  // Attempt to get a display name. Fallback to ID.
  const displayName = searchApiTool.name;
  const description = searchApiTool.description;
  const status = searchApiTool.status;
  const utilityProvider = searchApiTool.utilityProvider;
  const securityOption = searchApiTool.securityOption;
  const isVerified = searchApiTool.isVerified;
  const creatorUserId = searchApiTool.creatorUserId;
  const userId = searchApiTool.userId; // This might be the same as creatorUserId or different
  const totalExecutions = searchApiTool.totalExecutions;
  const succeededExecutions = searchApiTool.succeededExecutions;
  const failedExecutions = searchApiTool.failedExecutions;
  const createdAt = searchApiTool.createdAt; // This should now be a Date object
  const updatedAt = searchApiTool.updatedAt; // This should now be a Date object

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    // Check if the date is valid before calling toLocaleString()
    if (isNaN(date.getTime())) {
      console.warn("ToolDetailPanel: Received invalid date object for formatting:", date);
      return 'Invalid Date'; 
    }
    try {
      return date.toLocaleString();
    } catch (e) {
      console.error("ToolDetailPanel: Error formatting date:", e, "Original date:", date);
      return 'Error formatting date';
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
            <span className="font-mono break-all">{searchApiTool.apiToolId}</span>

            {searchApiTool.name && (
              <>
                <span className="font-semibold text-gray-400">Name:</span>
                <span>{searchApiTool.name}</span>
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