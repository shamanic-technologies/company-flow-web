/**
 * ActionConfirmationCard Component
 * 
 * Renders a card prompting the user to confirm a specific action required by a tool.
 * This is often used for setup steps like confirming a webhook has been configured manually.
 * It sends a confirmation result back to the chat flow upon user interaction.
 */
import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { AlertCircle, CheckCircleIcon, Loader2, AlertTriangleIcon } from 'lucide-react';
// Change to regular import for enums
import { UtilityActionConfirmation, UtilityProvider } from '@agent-base/types';

interface ActionConfirmationCardProps {
  utilityProvider: UtilityProvider;
  actionType: UtilityActionConfirmation; // Specific action to confirm
  webhookUrlToInput?: string; // Optional URL to display
  onSubmit: () => Promise<void>; // Callback when submitted
  toolCallId: string; // For unique element IDs (optional usage)
}

/**
 * Represents the possible states of the confirmation process.
 */
type ConfirmationState = 'idle' | 'loading' | 'success' | 'error';

export const ActionConfirmationCard = ({ 
    utilityProvider, 
    actionType, 
    webhookUrlToInput,
    onSubmit, 
    toolCallId 
}: ActionConfirmationCardProps) => {
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (confirmationState === 'loading' || confirmationState === 'success') return;

    setConfirmationState('loading');
    setErrorMessage(null);

    try {
      // Call the onSubmit prop provided by the parent
      await onSubmit();
      // If onSubmit resolves without error, assume success (parent handles actual API)
      setConfirmationState('success');
      // Parent component (ToolInvocationPart) will handle moving to the next step or finishing.
    } catch (error) {
      console.error(`Failed to process confirmation ${actionType}:`, error);
      setConfirmationState('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred while confirming.');
    }
  };

  const cardBorderColor = confirmationState === 'success' ? 'border-green-500'
                        : confirmationState === 'error' ? 'border-red-500'
                        : 'border-blue-500'; // Use blue for pending confirmation

  // Format the action type for display (replace underscores, capitalize)
  const formattedAction = actionType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
    
  // Determine title based on action type
  const title = actionType === UtilityActionConfirmation.WEBHOOK_URL_INPUTED
                ? `Confirm Webhook Setup for ${utilityProvider}`
                : actionType === UtilityActionConfirmation.OAUTH_DONE
                ? `Confirm OAuth Connection for ${utilityProvider}`
                : `Confirm Action for ${utilityProvider}`;
                
  const description = actionType === UtilityActionConfirmation.WEBHOOK_URL_INPUTED
                ? `Please confirm that you have configured the following webhook URL in your ${utilityProvider} dashboard:`
                : actionType === UtilityActionConfirmation.OAUTH_DONE
                ? `Please confirm that you have successfully completed the connection process in the popup window.`
                : `Please confirm you have completed the required action: ${formattedAction}`;

  return (
    <Card className={`mt-4 ${cardBorderColor}`}>
      <CardHeader className="flex flex-row items-start gap-3">
        {confirmationState === 'success' ? <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> :
         confirmationState === 'error' ? <AlertTriangleIcon className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" /> :
         <AlertCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />} 
        <div className="flex flex-col flex-grow">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {/* Display webhook URL if applicable */}
          {actionType === UtilityActionConfirmation.WEBHOOK_URL_INPUTED && webhookUrlToInput && (
            <div className="mt-2 p-2 bg-gray-800 rounded text-xs font-mono break-all">
              {webhookUrlToInput}
            </div>
          )}
          {confirmationState === 'success' && (
            <p className="text-sm text-green-600 mt-2">Confirmation submitted successfully!</p>
          )}
          {confirmationState === 'error' && errorMessage && (
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          )}
        </div>
      </CardHeader>
      {confirmationState !== 'success' && (
        <>
          {/* No content needed, just the footer button */}
          <CardFooter>
            <Button
              onClick={handleConfirm}
              size="sm"
              disabled={confirmationState !== 'idle' && confirmationState !== 'error'}
            >
              {confirmationState === 'loading' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {confirmationState === 'loading' ? 'Confirming...' : `Confirm ${formattedAction}`}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default ActionConfirmationCard; 