/**
 * API Route: /api/messages/list-by-agent
 * 
 * GET handler to retrieve messages for an agent across all conversations.
 * Makes a call to the agent-service backend endpoint.
 * Returns data in the format expected by Vercel AI SDK.
 */
import { NextRequest, NextResponse } from 'next/server';
import { 
  createErrorResponse, 
  getAuthToken, 
  callApiService,
  handleApiError 
} from '../../utils';
import { getOrCreateKeyByName, getPlatformUserFromToken } from '../../utils/web-client';
import { ServiceResponse } from '@agent-base/types';
import { PlatformUser } from '@agent-base/types';

export async function GET(req: NextRequest) {
  try {
    // Get agent_id from query params
    const url = new URL(req.url);
    const agentId = url.searchParams.get('agent_id');
    
    if (!agentId) {
      console.error('[API /messages/list-by-agent] Missing agent_id query parameter');
      return NextResponse.json({
        success: false,
        error: 'agent_id query parameter is required'
      }, { status: 400 });
    }
    
    // Get auth token from request headers
    const token = getAuthToken(req);
    
    if (!token) {
      console.error('[API /messages/list-by-agent] No valid authorization token provided');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'No valid authorization token provided');
    }
    
    // Get API key for the user
    const apiKey = await getOrCreateKeyByName(token, "Playground");
    const platformUserResponse : ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
    if (!platformUserResponse.success) {
      console.error('[API /messages/list-by-agent] Error getting platform user from token:', platformUserResponse);
      // Cast to access error properties when success is false
      const errorResponse = platformUserResponse as unknown as { error?: any; details?: any };

      // Convert the ServiceResponse error into a standard Response object
      const message = typeof errorResponse.error === 'string' 
          ? errorResponse.error 
          : JSON.stringify(errorResponse.error) || 'Failed to get platform user';
      const details = typeof errorResponse.details === 'string'
          ? errorResponse.details
          : JSON.stringify(errorResponse.details) || message;

      // Use a default status and code
      return createErrorResponse(500, 'PLATFORM_USER_FETCH_FAILED', message, details);
    }
    const platformClientUserId = platformUserResponse.data.id;
    
    
    // Call agent service endpoint using the correct name
    const messagesResponse = await callApiService(
      `agent/message/get-messages-from-agent?agent_id=${agentId}`,
      'GET',
      platformClientUserId,
      apiKey
    );
    
    // If the backend call was successful, transform the response
    if (messagesResponse.success) {
      // Format the messages to match frontend expectations
      
      return NextResponse.json({
        success: true,
        data: messagesResponse.data || []
      }, { status: 200 });
    } else {
      console.error('[API /messages/list-by-agent] Failed to fetch messages' + messagesResponse.error);
      // If the backend call failed, pass along the error
      return NextResponse.json({
        success: false,
        error: messagesResponse.error || 'Failed to fetch messages'
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('[API /messages/list-by-agent] Error:', error);
    return handleApiError(error, 'Failed to retrieve agent messages');
  }
} 