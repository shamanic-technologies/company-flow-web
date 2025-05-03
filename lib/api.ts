/**
 * API utilities for communicating with the api-gateway-service
 */

// Default api-gateway-service URL from environment variables
const AGENT_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

/**
 * Makes a server-side authenticated request to the api-gateway-service
 * This should only be called from server-side code (Server Components, Route Handlers, Server Actions)
 * @param endpoint The API endpoint path
 * @param method HTTP method (GET, POST, etc.)
 * @param body Optional request body for POST/PUT requests
 * @returns The response data
 */
export async function callServerApiGateway(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
): Promise<any> {
  // This key is only available on the server
  const API_KEY = process.env.WEB_GATEWAY_API_KEY;
  
  if (!API_KEY) {
    throw new Error('API key not found in environment variables');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  };
  
  const options: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  };
  
  try {
    const response = await fetch(`${AGENT_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Tests the connection to the api-gateway-service
 * @returns A boolean indicating whether the connection was successful
 */
export async function testApiGatewayConnection(): Promise<boolean> {
  try {
    const result = await callServerApiGateway('/api/proxy-mode');
    return !!result.success;
  } catch (error) {
    console.error('Failed to connect to api-gateway-service:', error);
    return false;
  }
} 