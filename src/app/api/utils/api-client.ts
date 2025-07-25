/**
 * Shared service utilities
 * 
 * Common functions for making API calls to backend services
 */
import { API_GATEWAY_URL } from './types';

/**
 * Makes a request to the API service
 */
export async function callApiService(endpoint: string, method: string, clientAuthUserId: string, clientAuthOrganizationId: string, apiKey: string, body?: any) {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-client-auth-user-id': clientAuthUserId,
        'x-client-auth-organization-id': clientAuthOrganizationId,
        'x-platform-api-key': apiKey
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_GATEWAY_URL}${endpoint}`, options);
    
    // Check if the response was successful
    if (!response.ok) {
      let errorMessage = 'API service error';
      try {
        const errorText = await response.text();
        console.error('API gateway error:', errorText);
        errorMessage = errorText || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      
      // Map HTTP status codes to more descriptive error codes
      let errorCode = 'API_ERROR';
      if (response.status === 400) errorCode = 'INVALID_REQUEST';
      else if (response.status === 401) errorCode = 'API_AUTH_ERROR';
      else if (response.status === 404) errorCode = 'API_NOT_FOUND';
      else if (response.status === 429) errorCode = 'API_RATE_LIMITED';
      else if (response.status >= 500) errorCode = 'API_SERVER_ERROR';
      
      throw { 
        status: response.status,
        code: errorCode,
        message: `API service error: ${errorMessage}`,
        details: 'There was an issue with the API service'
      };
    }
    
    // Get response data
    return await response.json();
  } catch (error: any) {
    console.error('API gateway connection error:', error);
    if (error && typeof error === 'object' && 'status' in error && 'code' in error) {
      // Re-throw our custom error
      throw error;
    }
    
    throw { 
      status: 503,
      code: 'API_CONNECTION_ERROR',
      message: 'Failed to connect to API service',
      details: 'Could not establish connection to the API service. Please try again later.'
    };
  }
}

/**
 * Makes a streaming request to the agent service
 */
export async function callAgentServiceStream(endpoint: string, apiKey: string, clientAuthUserId: string, clientAuthOrganizationId: string, body: any) {
  try {
    const response = await fetch(`${API_GATEWAY_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-auth-user-id': clientAuthUserId,
        'x-client-auth-organization-id': clientAuthOrganizationId,
        'x-platform-api-key': apiKey,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(body)
    });
    
    // Check if the response was successful
    if (!response.ok) {
      let errorBody: any = null;
      let errorText: string = 'Unknown agent service error';
      let parsedError: string | null = null;
      let parsedDetails: any = null;

      try {
        // Try to read as text first, in case JSON parsing fails
        errorText = await response.text(); 
        try {
          // Attempt to parse the text as JSON
          errorBody = JSON.parse(errorText);
          parsedError = errorBody?.error; // Extract 'error' field if present
          parsedDetails = errorBody?.details; // Extract 'details' field if present
        } catch (parseError) {
          console.warn('Failed to parse error response body as JSON:', parseError);
          // Keep errorText as the primary message if JSON parsing fails
        }
      } catch (readError) {
        console.error('Failed to read error response body:', readError);
      }
      
      console.error('API gateway error received:', errorText); // Log the raw text

      // Map HTTP status codes 
      let errorCode = 'AGENT_ERROR';
      if (response.status === 400) errorCode = 'INVALID_REQUEST';
      else if (response.status === 401) errorCode = 'AGENT_AUTH_ERROR';
      else if (response.status === 429) errorCode = 'AGENT_RATE_LIMITED';
      else if (response.status >= 500) errorCode = 'AGENT_SERVER_ERROR';
      
      // Throw a new error object, using parsed fields if available
      throw { 
        status: response.status,
        code: errorCode,
        // Use parsed error message, fallback to text or generic message
        message: parsedError || `Agent service error: ${errorText}`,
        // Use parsed details, fallback to generic message
        details: parsedDetails || 'There was an issue with the agent service' 
      };
    }
    
    // Check if response body exists
    if (!response.body) {
      throw {
        status: 500,
        code: 'EMPTY_RESPONSE',
        message: 'Empty response from agent service',
        details: 'The agent service returned an empty response. Please try again.'
      };
    }
    
    // Return the streaming response
    return response;
  } catch (error: any) {
    if (error && typeof error === 'object' && 'status' in error && 'code' in error) {
      // Re-throw our custom error
      throw error;
    }
    
    console.error('API gateway connection error:', error);
    throw { 
      status: 503,
      code: 'AGENT_CONNECTION_ERROR',
      message: 'Failed to connect to agent service',
      details: 'Could not establish connection to the agent service. Please try again later.'
    };
  }
}
