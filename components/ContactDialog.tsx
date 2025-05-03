'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

/**
 * Contact Dialog Component
 * Handles the display and submission of the demo contact form.
 */
export const ContactDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [buttonId, setButtonId] = useState<string | null>(null);

  // Listen for sign in click events
  useEffect(() => {
    const handleOpenSignInDialog = (event: Event) => {
      // Cast event to CustomEvent to access detail
      const customEvent = event as CustomEvent<{ buttonId: string }>;
      const receivedButtonId = customEvent.detail?.buttonId || null;
      console.log("Contact Dialog opened via button:", receivedButtonId); // Log the button ID

      setIsOpen(true);
      setSubmitted(false); // Reset submission state when opening
      setName('');         // Clear fields when opening
      setEmail('');
      setMessage('');
      setButtonId(receivedButtonId); // Store the button ID
    };

    // Add type assertion for the event listener
    window.addEventListener('openSignInDialog', handleOpenSignInDialog as EventListener);
    
    return () => {
      // Add type assertion for the event listener removal
      window.removeEventListener('openSignInDialog', handleOpenSignInDialog as EventListener);
    };
  }, []);

  // Contact form handlers
  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          message,
          button_id: buttonId // Include buttonId (using snake_case)
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      setSubmitted(true);
      
      setTimeout(() => {
        setIsOpen(false);
        setTimeout(() => setSubmitted(false), 500);
      }, 2000);

    } catch (error) {
      console.error('Submission failed:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Could not send message. Please try again.",
        variant: "destructive",
      });
      setSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gray-900 text-gray-100 border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{submitted ? "Thanks for reaching out!" : "Start building"}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {submitted ? "We'll get back to you soon." : "Fill out this form and our team will contact you."}
          </DialogDescription>
        </DialogHeader>
        
        {!submitted ? (
          <form onSubmit={handleSubmitContact}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-200">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-200">
                  Message
                </label>
                <Input
                  id="message"
                  placeholder="What are you building?"
                  value={message}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-gray-100 min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Submit"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-900/30 border border-green-700/50 mx-auto mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-green-300">Thank you for your message!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}; 