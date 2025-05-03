/**
 * Tool Invocation Helpers
 * 
 * Utility functions for handling tool invocations in the chat interface
 */

import type { ToolInvocation } from '../types';

/**
 * Opens a centered popup window for authentication
 * @param url URL to open in the popup
 * @param title Title of the popup window
 * @param w Width of the popup window
 * @param h Height of the popup window
 * @returns The opened window object
 */
export const openCenteredPopup = (url: string, title: string, w: number, h: number) => {
  const left = window.screenX + (window.outerWidth - w) / 2;
  const top = window.screenY + (window.outerHeight - h) / 2;
  
  const popup = window.open(
    url, 
    title,
    `width=${w},height=${h},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no`
  );

  // Send the opener's origin to the popup immediately after opening
  if (popup) {
    // Get the target origin for the postMessage (the popup's origin)
    let targetOrigin: string;
    try {
      targetOrigin = new URL(url).origin;
    } catch (e) {
      console.error('Invalid URL provided to openCenteredPopup:', url);
      // Fallback or handle error appropriately - maybe use current origin?
      // For now, let's default to the current origin, but this might not be correct
      // depending on where the popup URL points.
      targetOrigin = window.location.origin; 
    }
    
    // Send the message after a brief delay to ensure the popup window has loaded the listener
    setTimeout(() => {
        try {
             popup.postMessage({ type: 'origin_request_response', origin: targetOrigin }, targetOrigin);
             console.log(`Sent origin ${targetOrigin} to popup at ${targetOrigin}`);
        } catch (error) {
             console.error("Error sending origin message to popup:", error);
        }
    }, 500); // 500ms delay, adjust if needed
  }

  return popup;
};

/**
 * Check if the tool result contains an error
 * @param toolInvocation The tool invocation object to check
 * @returns Whether the result contains an error
 */
export const hasToolError = (toolInvocation: ToolInvocation): boolean => {
  return !!toolInvocation.result && (
    (typeof toolInvocation.result === 'string' && 
      toolInvocation.result.toLowerCase().includes('error')) ||
    (typeof toolInvocation.result === 'object' && 
      (
        (toolInvocation.result.error) || 
        (toolInvocation.result.status === 'error') || 
        (toolInvocation.result.success === false)
      )
    )
  );
};
