/**
 * SecretInputCard Component
 * 
 * Renders a card with a form for the user to input a required secret.
 * Used sequentially when a tool invocation requires specific API keys or other sensitive information.
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UtilityInputSecret, UtilityProvider } from '@agent-base/types';
import { WrenchIcon, CheckCircleIcon, Loader2, AlertTriangleIcon } from 'lucide-react';

interface SecretInputCardProps {
  utilityProvider: UtilityProvider;
  secretType: UtilityInputSecret;
  onSubmit: (value: string) => Promise<void>; // Callback when submitted
  toolCallId: string; // For unique element IDs
}

/**
 * Represents the possible states of the secret submission process.
 */
type SubmissionState = 'idle' | 'loading' | 'success' | 'error';

// Map secret types to user-friendly labels and input types
const secretMeta: Record<UtilityInputSecret, { label: string; type: 'text' | 'password' }> = {
  [UtilityInputSecret.API_SECRET_KEY]: { label: 'API Secret Key', type: 'password' },
  [UtilityInputSecret.API_PUBLISHABLE_KEY]: { label: 'API Publishable Key', type: 'text' },
  [UtilityInputSecret.API_IDENTIFIER]: { label: 'API Identifier', type: 'text' },
  [UtilityInputSecret.USERNAME]: { label: 'Username', type: 'text' },
  [UtilityInputSecret.PASSWORD]: { label: 'Password', type: 'password' },
};

export const SecretInputCard = ({ 
    utilityProvider, 
    secretType,
    onSubmit, 
    toolCallId 
}: SecretInputCardProps) => {
  const [secretValue, setSecretValue] = useState<string>('');
  const [submissionState, setSubmissionState] = useState<SubmissionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { label, type: inputType } = secretMeta[secretType] || { label: secretType.replace(/_/g, ' '), type: 'text' };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (submissionState !== 'success') {
      setSecretValue(e.target.value);
      if (submissionState === 'error') {
        setSubmissionState('idle');
        setErrorMessage(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submissionState === 'loading' || submissionState === 'success' || !secretValue) return;

    setSubmissionState('loading');
    setErrorMessage(null);

    try {
      // Call the onSubmit prop provided by the parent
      await onSubmit(secretValue);
      // If onSubmit resolves without error, assume success (parent handles actual API)
      setSubmissionState('success'); 
      // Parent component (ToolInvocationPart) will handle moving to the next step or finishing.
    } catch (error) {
      console.error(`Failed to process secret ${secretType}:`, error);
      setSubmissionState('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const cardBorderColor = submissionState === 'success' ? 'border-green-500'
                        : submissionState === 'error' ? 'border-red-500'
                        : 'border-yellow-500';

  return (
    <Card className={`mt-4 ${cardBorderColor}`}>
      <CardHeader className="flex flex-row items-start gap-3">
        {submissionState === 'success' ? <CheckCircleIcon className="h-5 w-5 text-green-500 mt-1 flex-shrink-0" /> :
         submissionState === 'error' ? <AlertTriangleIcon className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" /> :
         <WrenchIcon className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />}
        <div className="flex flex-col flex-grow">
          {/* Use provider and secret type for title */}
          <CardTitle className="text-base">Input Required: {label} for {utilityProvider}</CardTitle>
          <CardDescription>Please enter the required credential.</CardDescription>
          {submissionState === 'success' && (
            <p className="text-sm text-green-600 mt-2">Submitted successfully!</p>
          )}
          {submissionState === 'error' && errorMessage && (
            <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          )}
        </div>
      </CardHeader>
      {submissionState !== 'success' && (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor={`${toolCallId}-${secretType}`} className="text-xs font-medium capitalize">
                {label}
              </Label>
              <Input
                id={`${toolCallId}-${secretType}`}
                type={inputType}
                value={secretValue}
                onChange={handleInputChange}
                required
                disabled={submissionState !== 'idle' && submissionState !== 'error'}
                className={`text-sm ${submissionState === 'error' ? 'border-red-500 focus:border-red-500' : ''}`}
                placeholder={`Enter your ${label}`}
                autoComplete="off"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              size="sm"
              disabled={submissionState !== 'idle' && submissionState !== 'error'}
            >
              {submissionState === 'loading' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {submissionState === 'loading' ? 'Submitting...' : 'Submit'}
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
};

export default SecretInputCard; 