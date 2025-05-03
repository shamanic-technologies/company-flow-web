/**
 * Custom Hook: useSetupSteps
 * 
 * Manages the state and logic for handling sequential setup steps 
 * required by a tool invocation result (SetupNeeded).
 */
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UseChatHelpers, Message } from 'ai/react';
import { 
  SetupNeeded,
  UtilityInputSecret,
  UtilityActionConfirmation,
  UtilityProvider
} from '@agent-base/types';

// Derive ToolInvocation type from Message parts
// Keeping the derivation attempt commented out for reference
// type ToolInvocationType = NonNullable<Message['parts']>[number] extends {{ type: 'tool-invocation'; toolInvocation: infer T }} ? T : never;


// Define the step structure
export type SetupStep = 
  | { type: 'oauth'; provider: UtilityProvider; oauthUrl: string; title: string; description: string }
  | { type: 'secret'; secretType: UtilityInputSecret; provider: UtilityProvider }
  | { type: 'webhook_confirm'; actionType: UtilityActionConfirmation; provider: UtilityProvider; webhookUrlToInput?: string };

interface UseSetupStepsProps {
  // Use the minimal interface or any, and rely on runtime checks + ts-ignore
  toolInvocation: any | undefined | null; 
  addToolResult: (args: { toolCallId: string; result: any }) => void;
}

interface UseSetupStepsReturn {
  currentStep: SetupStep | null;
  isLoading: boolean;
  error: string | null;
  handleStepSubmit: (stepData: any) => Promise<void>;
  isHandlingSetup: boolean; // Flag to indicate if this hook is actively managing steps
}

export function useSetupSteps({
  toolInvocation,
  addToolResult,
}: UseSetupStepsProps): UseSetupStepsReturn {
  const { toast } = useToast();
  const [requiredSteps, setRequiredSteps] = useState<SetupStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSetupData, setCurrentSetupData] = useState<SetupNeeded | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Submission loading state
  const [error, setError] = useState<string | null>(null); // Submission error state

  // Process tool invocation result
  useEffect(() => {
    // Reset state function
    const resetState = () => {
      setRequiredSteps([]);
      setCurrentIndex(0);
      setCurrentSetupData(null);
      setIsLoading(false);
      setError(null);
    };

    // Add log for the incoming toolInvocation
    console.log('[useSetupSteps] Received toolInvocation:', toolInvocation);

    // @ts-ignore - Suppress error due to uncertain toolInvocation type
    if (toolInvocation?.state === 'result') { // Check for result state first
        
      // @ts-ignore - Suppress error due to uncertain toolInvocation type
      const resultData = toolInvocation.result?.data as SetupNeeded | null | undefined;
      
      // @ts-ignore
      
      // Check if the result.data object indicates setup is needed
      if (resultData && typeof resultData === 'object' && resultData.needsSetup === true) {
        // We have a valid SetupNeeded object inside data!
        setCurrentSetupData(resultData); 
        const steps: SetupStep[] = [];

        // 1. OAuth
        if (resultData.oauthUrl) {
          steps.push({ 
            type: 'oauth', 
            provider: resultData.utilityProvider,
            oauthUrl: resultData.oauthUrl,
            title: resultData.title, 
            description: resultData.description
          });
          steps.push({ type: 'webhook_confirm', actionType: UtilityActionConfirmation.OAUTH_DONE, provider: resultData.utilityProvider });
        }

        // 2. Secret Inputs
        resultData.requiredSecretInputs?.forEach(secretType => {
          if (!steps.some(s => s.type === 'secret' && s.secretType === secretType)) {
             steps.push({ type: 'secret', secretType: secretType, provider: resultData.utilityProvider });
          }
        });

        // 3. Action Confirmations
        resultData.requiredActionConfirmations?.forEach(actionType => {
          if (actionType === UtilityActionConfirmation.WEBHOOK_URL_INPUTED) {
             if (!steps.some(s => s.type === 'webhook_confirm' && s.actionType === UtilityActionConfirmation.WEBHOOK_URL_INPUTED)) {
                steps.push({ 
                    type: 'webhook_confirm', 
                    actionType: UtilityActionConfirmation.WEBHOOK_URL_INPUTED, 
                    provider: resultData.utilityProvider, 
                    webhookUrlToInput: resultData.webhookUrlToInput 
                });
             }
          } else if (actionType === UtilityActionConfirmation.OAUTH_DONE) {
            // Skip OAUTH_DONE here 
          }
        });
        
        console.log("[useSetupSteps] Generated Steps:", steps);
        setRequiredSteps(steps);
        setCurrentIndex(0); 
        setError(null);
        setIsLoading(false);
      } else {
        // Add log for when setupNeeded is not valid
        console.log('[useSetupSteps] Result is not a valid SetupNeeded object.');
        resetState();
      }
    } else {
       // Add log for when the state isn't 'result'
       console.log('[useSetupSteps] toolInvocation not relevant for setup (state is not \'result\').');
       resetState();
    }
  }, [toolInvocation]); // Rerun when toolInvocation changes (result is derived from toolInvocation)

  // Handle submission of a single step
  const handleStepSubmit = useCallback(async (stepData: any) => {
    console.log(`[useSetupSteps] Submitting step ${currentIndex + 1}/${requiredSteps.length}:`, stepData);
    // @ts-ignore - Suppress error due to uncertain toolInvocation type
    if (!toolInvocation?.toolCallId || !currentSetupData) return;

    setIsLoading(true);
    setError(null);

    try {
        const authToken = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
        if (!authToken) throw new Error("Auth token not found");

        const response = await fetch('/api/secrets/store-secret', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                secrets: stepData.secrets, 
                secretUtilityProvider: currentSetupData.utilityProvider
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to store step data (status ${response.status})`);
        }

        toast({ title: "Step Complete", description: "Configuration saved.", variant: "default" });

        // Check if last step
        if (currentIndex >= requiredSteps.length - 1) {
            console.log("[useSetupSteps] Last step completed. Sending result to AI.");
            addToolResult({
                // @ts-ignore - Suppress error due to uncertain toolInvocation type
                toolCallId: toolInvocation.toolCallId,
                result: { success: true, message: "Setup complete." }
            });
            // Reset state after finishing
            setRequiredSteps([]);
            setCurrentIndex(0);
            setCurrentSetupData(null);
        } else {
            console.log("[useSetupSteps] Moving to next step.");
            setCurrentIndex(prevIndex => prevIndex + 1);
        }
    } catch (err) {
        console.error("[useSetupSteps] Error submitting setup step:", err);
        const errorMsg = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(errorMsg);
        toast({ title: "Error Saving Step", description: errorMsg, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [currentIndex, requiredSteps, toolInvocation, currentSetupData, addToolResult, toast]);

  const currentStep = requiredSteps.length > 0 && currentIndex < requiredSteps.length ? requiredSteps[currentIndex] : null;
  const isHandlingSetup = currentStep !== null;

  return { 
    currentStep, 
    isLoading, 
    error, 
    handleStepSubmit, 
    isHandlingSetup 
  };
} 