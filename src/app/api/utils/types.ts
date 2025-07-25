/**
 * Shared authentication utilities
 * 
 * Common functions for API routes that need authentication and API key management
 */
import { NextRequest } from 'next/server';

// Retrieve environment variables
export const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3002';
export const WEB_GATEWAY_URL = process.env.NEXT_PUBLIC_WEB_GATEWAY_URL || 'http://localhost:3030';
export const WEB_GATEWAY_API_KEY = process.env.WEB_GATEWAY_API_KEY;

/**
 * Creates a consistent error response
 */
export function createErrorResponse(
  status: number,
  errorCode: string,
  message: string,
  details?: string
) {
  return new Response(
    JSON.stringify({
      error: message,
      errorCode: errorCode,
      details: details
    }),
    { 
      status: status, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      } 
    }
  );
}

/**
 * Creates a success response
 */
export function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    }
  );
}

// /**
//  * Extracts the auth token from request headers
//  */
// export function getAuthToken(req: NextRequest): string | null {
//   const token = req.headers.get('Authorization')?.substring(7) || '';
//   return token || null;
// }

/**
 * Standardizes error handling for API calls
 */
export function handleApiError(error: any, defaultMessage = 'An unexpected error occurred') {
  console.error('API proxy error:', error);
  
  // If it's our custom error with status and code
  if (error && typeof error === 'object' && 'status' in error && 'code' in error) {
    return createErrorResponse(
      error.status,
      error.code,
      error.message || 'Unknown error',
      error.details
    );
  }
  
  // Generic error
  return createErrorResponse(
    500,
    'INTERNAL_SERVER_ERROR',
    'Internal server error',
    defaultMessage
  );
} 