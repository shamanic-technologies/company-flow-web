/**
 * Error Handlers for Vercel AI SDK
 * 
 * Utilities for handling different types of errors in the chat interface
 * Following Vercel AI SDK documentation patterns
 */

/**
 * Process error messages from different sources into consistent format
 */
export function processErrorMessage(error: any): string {
  // Handle error string
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle objects with error messages
  if (typeof error === 'object' && error !== null) {
    if (error.message) {
      return error.message;
    }
    if (error.error) {
      return typeof error.error === 'string' ? error.error : 'Unknown error format';
    }
  }
  
  // Fallback
  return 'An unexpected error occurred';
}

/**
 * Classify error based on stack trace and message
 */
export function classifyError(error: any): {
  message: string;
  code: string;
  details?: string;
} {
  const errorMessage = processErrorMessage(error);
  const stackTrace = error?.stack || '';
  const errorStr = error?.toString() || '';
  
  // Check for specific AI SDK response format errors
  if (errorStr.includes('response stream format') || 
      errorMessage.includes('invalid response') || 
      stackTrace.includes('processDataStream') ||
      errorMessage.includes('STREAM_ERROR')) {
    return {
      message: 'There was an issue with the AI response stream format',
      code: 'STREAM_ERROR',
      details: 'The server response format may be incorrect. This might be due to a temporary service issue. Please try again.'
    };
  }
  
  // Tool call errors
  if (errorStr.includes('tool call') || errorMessage.includes('tool call')) {
    return {
      message: `Tool execution error: ${errorMessage}`,
      code: 'TOOL_ERROR',
      details: 'There was an issue executing a tool. The result format may be invalid.'
    };
  }
  
  // Vercel AI SDK streaming errors (more general)
  if (stackTrace.includes('@ai-sdk/ui-utils') || 
      stackTrace.includes('ai-sdk') || 
      errorStr.includes('onErrorPart')) {
    return {
      message: 'AI SDK streaming error',
      code: 'STREAM_ERROR',
      details: 'There was an issue with the AI response stream. Please try again later.'
    };
  }
  
  // Authentication errors
  if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('auth')) {
    return {
      message: 'Authentication error',
      code: 'AUTH_ERROR',
      details: 'Your session may have expired. Please try refreshing the page or logging in again.'
    };
  }
  
  // Rate limiting errors
  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return {
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT',
      details: 'Please wait a moment before trying again.'
    };
  }
  
  // Server errors
  if (errorMessage.includes('5') && /5\d\d/.test(errorMessage)) {
    return {
      message: 'Server error',
      code: 'SERVER_ERROR',
      details: 'Our team has been notified. Please try again later.'
    };
  }
  
  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
    return {
      message: 'Network error',
      code: 'NETWORK_ERROR',
      details: 'Please check your internet connection and try again.'
    };
  }
  
  // Default error
  return {
    message: errorMessage,
    code: 'UNKNOWN_ERROR',
    details: 'An unexpected error occurred. Please try again.'
  };
}

/**
 * Handle tool call errors according to Vercel AI SDK docs
 */
export function handleToolCallError(error: any, toolName: string): any {
  console.error(`Tool call error for ${toolName}:`, error);
  
  // Return a properly formatted error object that will work with Vercel AI SDK
  return {
    error: true,
    message: processErrorMessage(error),
    code: error?.code || 'TOOL_ERROR'
  };
} 