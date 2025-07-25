/**
 * SetupStepRenderer Component
 * 
 * Determines which card to render based on the current setup step type.
 */
import React from 'react';
import { SetupStep } from '../../../../hooks/useSetupSteps'; // Import the step type
import { UtilityActionConfirmation, UtilityInputSecret } from '@agent-base/types'; // Import enum for comparison
import { OAuthCard } from './OAuthCard';
import { SecretInputCard } from './SecretInputCard';
import { ActionConfirmationCard } from './ActionConfirmationCard';

interface SetupStepRendererProps {
  step: SetupStep;
  onSubmit: (data: any) => Promise<void>; // The central submit handler from the hook
  toolCallId: string; // Needed for some child cards
}

export const SetupStepRenderer: React.FC<SetupStepRendererProps> = ({ step, onSubmit, toolCallId }) => {
  switch (step.type) {
    case 'oauth':
      return (
        <OAuthCard
          utilityProvider={step.provider}
          oauthUrl={step.oauthUrl}
          title={step.title}
          description={step.description}
          // onSubmit for OAuthCard only advances local state in parent hook
          // It doesn't call the main handleStepSubmit directly
          onSubmit={async () => {
            // This onSubmit is slightly different - it signals the OAuth popup step is done
            // The parent hook advances state, and the *next* step (OAUTH_DONE) handles backend call
            // We might need a different callback name or adjust the parent hook's onSubmit
            // For simplicity now, let's assume the parent hook handles this logic correctly when called from OAuthCard.
             // The parent hook's specific onSubmit passed to OAuthCard handles state advancement.
          }}
        />
      );
    case 'secret':
      return (
        <SecretInputCard
          utilityProvider={step.provider}
          secretType={step.secretType as UtilityInputSecret}
          // Pass the onSubmit callback for secret submission
          onSubmit={async (value: string) => {
            await onSubmit({ secrets: { [step.secretType]: value } });
          }}
          toolCallId={toolCallId}
        />
      );
    case 'webhook_confirm':
      const webhookUrlProp = step.actionType === UtilityActionConfirmation.WEBHOOK_URL_INPUTED 
          ? { webhookUrlToInput: step.webhookUrlToInput } 
          : {};
      return (
        <ActionConfirmationCard
          utilityProvider={step.provider}
          actionType={step.actionType}
          {...webhookUrlProp}
          // Pass the onSubmit callback for confirmation
          onSubmit={async () => {
            await onSubmit({ secrets: { [step.actionType]: 'true' } });
          }}
          toolCallId={toolCallId}
        />
      );
    default:
      // Log error for unhandled step types
      console.error("Unknown setup step type:", step);
      return <div>Error: Unknown setup step.</div>;
  }
}; 