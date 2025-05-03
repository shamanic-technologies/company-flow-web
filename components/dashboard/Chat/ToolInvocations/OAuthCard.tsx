import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { UtilityProvider } from '@agent-base/types';
import { openCenteredPopup } from './utils';
import { AppWindowIcon, CheckCircle, Loader2 } from 'lucide-react';

// Map provider names to Icon components (Can be shared or defined locally)
const providerIcons: { [key: string]: React.ElementType } = {
  // Add provider icons here if needed, e.g.:
  // gmail: GmailIcon,
};

interface OAuthCardProps {
  utilityProvider: UtilityProvider;
  oauthUrl: string;
  title: string;
  description: string;
  onSubmit: () => Promise<void>; // Callback when user confirms completion
}

export const OAuthCard: React.FC<OAuthCardProps> = ({ 
  utilityProvider,
  oauthUrl,
  title,
  description,
  onSubmit,
}) => {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false); // State for 2-button flow
  const [isSubmitting, setIsSubmitting] = useState(false); // State for submission loading
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConnectClick = () => {
    const popup = openCenteredPopup(oauthUrl, title, 600, 700);
    if (!popup) {
      toast({
        title: "Popup Blocked",
        description: `Please allow popups for this site to connect with ${utilityProvider}`,
        variant: "destructive"
      });
      return;
    }
    // No message listener needed here - user manually confirms
    setIsConnecting(true); // Show the confirmation button
    setErrorMessage(null); // Clear previous errors
  };
  
  const handleConfirmationClick = async () => {
     if (isSubmitting) return;
     setIsSubmitting(true);
     setErrorMessage(null);
     
     try {
        // Call the parent onSubmit (which now just advances the step locally)
        await onSubmit();
        // Success is handled by the parent advancing the step
        // No need to change isConnecting state here, parent will unmount this card
     } catch(error) {
        console.error("Error during OAuth confirmation step advancement:", error);
        setErrorMessage(error instanceof Error ? error.message : "Failed to proceed after OAuth.");
        // Optionally reset isConnecting if you want them to be able to retry the OAuth popup?
        // setIsConnecting(false);
     } finally {
        setIsSubmitting(false);
     }
  };

  // Determine Icon
  const IconComponent = providerIcons[utilityProvider] || AppWindowIcon;

  return (
    <div className="flex justify-center w-full my-6">
      <Card className="w-full max-w-md border border-gray-800 bg-gray-900/50">
        <CardHeader className="space-y-1 flex items-center text-center">
          <div className="w-12 h-12 mx-auto mb-2">
            <IconComponent className="w-full h-full text-gray-400" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {errorMessage && (
             <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
          )}
        </CardHeader>
        <CardContent>
          {!isConnecting ? (
            <Button
              onClick={handleConnectClick}
              className="w-full"
              variant="default"
            >
              Connect to {utilityProvider.charAt(0).toUpperCase() + utilityProvider.slice(1)}
            </Button>
          ) : (
            <div className="text-center space-y-3">
               <p className="text-sm text-gray-400">Please complete the connection process in the popup window.</p>
               <Button
                 onClick={handleConfirmationClick}
                 className="w-full"
                 variant="outline"
                 disabled={isSubmitting}
               >
                 {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                 {isSubmitting ? "Processing..." : "I've Completed the Connection"}
               </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Your connection details are handled securely by {utilityProvider}.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

// Default export needs to match the new name
export default OAuthCard; 