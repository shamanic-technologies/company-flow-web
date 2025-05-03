/**
 * Shared request utilities
 * 
 * Common functions for making HTTP requests to backend services
 */
import { PlatformUser, SecretValue, ServiceResponse } from '@agent-base/types';
import { WEB_GATEWAY_URL, WEB_GATEWAY_API_KEY } from './types';

/**
 * Interface for request options
 */
export interface RequestOptions {
  method?: string;
  body?: any;
  additionalHeaders?: Record<string, string>;
}

/**
 * Make a request to the web gateway
 */
export async function callWebGateway(
  endpoint: string, 
  token: string, 
  options: RequestOptions = {}
): Promise<ServiceResponse<any>> {

  const { method = 'GET', body, additionalHeaders = {} } = options;

  // Validate web gateway configuration
  if (!WEB_GATEWAY_URL || !WEB_GATEWAY_API_KEY) {
    console.error('Web gateway configuration error:', WEB_GATEWAY_URL, WEB_GATEWAY_API_KEY);
    throw { 
      status: 500,
      code: 'SERVER_CONFIG_ERROR',
      message: 'Server configuration error',
      details: 'Missing web gateway URL or API key'
    };
  }

  // Prepare request options
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-web-gateway-api-key': WEB_GATEWAY_API_KEY,
      ...additionalHeaders
    }
  };

  // Add body for non-GET requests
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    // Make the request
    const response = await fetch(`${WEB_GATEWAY_URL}${endpoint}`, requestOptions);
    
    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'Service error';
      try {
        const errorText = await response.text();
        console.error('Web gateway error:', errorText);
        errorMessage = errorText || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', e);
      }
      
      // Map HTTP status codes to descriptive error codes
      let errorCode = 'SERVICE_ERROR';
      if (response.status === 401) errorCode = 'UNAUTHORIZED';
      else if (response.status === 403) errorCode = 'FORBIDDEN';
      else if (response.status === 404) errorCode = 'NOT_FOUND';
      else if (response.status === 429) errorCode = 'RATE_LIMITED';
      else if (response.status >= 500) errorCode = 'SERVER_ERROR';
      
      throw { 
        status: response.status,
        code: errorCode,
        message: `Service error: ${errorMessage}`,
        details: 'There was an issue with the web gateway service'
      };
    }
    
    // Parse and return JSON response
    return await response.json();
  } catch (error: any) {

    console.error('Web gateway connection error:', error);

    if (error && typeof error === 'object' && 'status' in error && 'code' in error) {
      // Re-throw our custom error
      throw error;
    }
    
    throw { 
      status: 503,
      code: 'CONNECTION_ERROR',
      message: 'Failed to connect to service',
      details: 'Could not establish connection to the web gateway. Please try again later.'
    };
  }
}

/**
 * Get user data from the database service
 */
export async function getPlatformUserFromToken(token: string) {
  return callWebGateway('/database/platform-users/me', token) as Promise<ServiceResponse<PlatformUser>>;
}

/**
 * Get user billing data from the payment service
 */
export async function getUserBillingData(token: string): Promise<ServiceResponse<any>> {
  // Step 1: Get or create customer through web gateway
  const customerData = await callWebGateway('/payment/customers', token, {
    method: 'POST',
    body: {}
  });
  
  if (!customerData.success || !customerData.data || !customerData.data.id) {
    throw { 
      status: 500,
      code: 'INVALID_CUSTOMER_DATA',
      message: 'Invalid customer data response',
      details: 'Unable to retrieve customer data'
    };
  }
  
  const customerId = customerData.data.id;
  
  // Step 2: Get transactions for this customer
  try {
    const transactionsResponse: ServiceResponse<any[]> = await callWebGateway(
      `/payment/customers-direct/${customerId}/transactions`, 
      token
    );
    if (!transactionsResponse.success) {
      console.warn('Could not fetch transactions:', transactionsResponse.error);
      return transactionsResponse;
    }
    console.log('Transactions fetched successfully:', transactionsResponse.data);
    return transactionsResponse;
  } catch (error) {
    console.warn('Could not fetch transactions:', error);
    return { success: false, error: error as string };
  }
  
}

/**
 * Get user keys from the key service
 */
export async function getUserKeys(token: string) {
  return callWebGateway('/keys', token);
}

/**
 * Get or create an API key by name
 * 
 * @param token User's authentication token
 * @param keyName Name of the API key to retrieve or create
 * @returns The API key value (string)
 * @throws Error if the key cannot be retrieved or created
 */
export async function getOrCreateKeyByName(token: string, keyName: string): Promise<string> {
  console.log(`Getting or creating API key with name: ${keyName}`);

  // Validate web gateway configuration
  if (!WEB_GATEWAY_URL || !WEB_GATEWAY_API_KEY) {
    console.error('Web gateway configuration error:', WEB_GATEWAY_URL);
    throw {
      status: 500,
      code: 'SERVER_CONFIG_ERROR',
      message: 'Server configuration error',
      details: 'Missing web gateway URL or API key'
    };
  }

  const endpoint = `/keys/by-name?name=${encodeURIComponent(keyName)}`;
  const requestOptions: RequestInit = {
    method: 'GET', // Assuming GET is appropriate, adjust if needed
    headers: {
      // No 'Content-Type' needed for GET if no body
      'Authorization': `Bearer ${token}`,
      'x-web-gateway-api-key': WEB_GATEWAY_API_KEY,
    }
  };

  try {
    const response = await fetch(`${WEB_GATEWAY_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
      console.error('Failed to get or create API key:', response);
      let errorMessage = 'Failed to get or create API key';
      try {
        errorMessage = await response.text() || errorMessage;
      } catch (e) { /* Ignore */ }

      let errorCode = 'KEY_ERROR';
      if (response.status === 401) errorCode = 'UNAUTHORIZED';
      else if (response.status === 403) errorCode = 'FORBIDDEN';
      else if (response.status === 404) errorCode = 'NOT_FOUND';

      throw {
        status: response.status,
        code: errorCode,
        message: `Failed to get or create API key: ${response.statusText}`,
        details: errorMessage
      };
    }
    // Expecting plain text response (the API key)
    const platformApiKeyResponse: ServiceResponse<SecretValue> = await response.json();

    if (!platformApiKeyResponse.success) {
      console.error('Invalid API key response:', platformApiKeyResponse);
      throw {
        status: 500,
        code: 'INVALID_KEY_RESPONSE',
        message: 'Invalid API key response',
        details: 'API key value not found in response'
      };
    }

    return platformApiKeyResponse.data?.value as string;

  } catch (error: any) {
    console.error('Error fetching/creating key:', error);
     if (error && typeof error === 'object' && 'status' in error && 'code' in error) {
      // Re-throw our custom error
      throw error;
    }
    throw {
      status: 503, // Service Unavailable or appropriate error
      code: 'CONNECTION_ERROR',
      message: 'Failed to connect to key service',
      details: 'Could not establish connection to retrieve the API key.'
    };
  }
}

/**
 * Fetches user logs from the logging service
 * @param token User's authentication token
 * @returns Response data from the logging service
 */
export async function getUserLogs(token: string): Promise<any> {
  return callWebGateway('/logging/api-logs/me', token);
}