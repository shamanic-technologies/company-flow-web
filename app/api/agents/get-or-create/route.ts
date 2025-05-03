/**
 * API Route: /api/agents/get-or-create
 * 
 * Proxy to the agent-service's /get-or-create-user-agents endpoint via API gateway
 * Handles authentication, API key management, and retrieves agent list (creating one if none exist)
 */
import { NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  getAuthToken,
  callApiService,
  handleApiError
} from '../../utils'; // Assuming utils path is correct
import { getOrCreateKeyByName, getPlatformUserFromToken } from '../../utils/web-client';
import { ServiceResponse } from '@agent-base/types';
import { PlatformUser } from '@agent-base/types';

/**
 * GET handler for getting or creating agents
 * Returns a list of agents for the authenticated user.
 * If no agents exist, the agent-service will create a default one and return it.
 */
export async function GET(req: NextRequest) {
  try {
    // Get auth token from request headers
    const token = getAuthToken(req);
    
    if (!token) {
      console.error('[API /agents/get-or-create] No valid authorization token provided');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'No valid authorization token provided');
    }
    
    // Get API key for the user
    const platformApiKey: string = await getOrCreateKeyByName(token, "Playground");
    console.log('[API /agents/get-or-create] Platform API key:', platformApiKey);
    // Get platform client user id from token
    const platformUserResponse : ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
    if (!platformUserResponse.success) {
      console.error('[API /agents/get-or-create] Error getting platform user from token:', platformUserResponse);
      
      // Cast to access error properties when success is false
      const errorResponse = platformUserResponse as unknown as { error?: any; details?: any };

      // Convert the ServiceResponse error into a standard Response object
      // Access error details from the casted errorResponse
      const message = typeof errorResponse.error === 'string' 
          ? errorResponse.error 
          : JSON.stringify(errorResponse.error) || 'Failed to get platform user';
      const details = typeof errorResponse.details === 'string'
          ? errorResponse.details
          : JSON.stringify(errorResponse.details) || message;

      // Use a default status and code, as they aren't directly on the failed ServiceResponse
      return createErrorResponse(500, 'PLATFORM_USER_FETCH_FAILED', message, details);
    }
    const platformClientUserId = platformUserResponse.data.id;
    console.log('[API /agents/get-or-create] Platform client user id:', platformClientUserId);
    // Call agent service's get-or-create endpoint
    const data = await callApiService('/agent/get-or-create-user-agents', 'GET', platformClientUserId, platformApiKey);
    console.log('[API /agents/get-or-create] Agent service response:', data);
    // Return successful response (status code will be handled by agent-service response)
    return createSuccessResponse(data, data.status || 200); // Pass status from service if available

  } catch (error: any) {
    console.error('[API /agents/get-or-create] Error:', error);
    return handleApiError(error, 'An unexpected error occurred while getting or creating agents');
  }
} 