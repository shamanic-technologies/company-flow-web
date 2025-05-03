/**
 * API Route: /api/messages/list
 * 
 * GET handler to retrieve messages for a conversation.
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
    // Get conversation_id from query params
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversation_id');
    
    if (!conversationId) {
      console.error('[API /messages/list] Missing conversation_id query parameter');
      return NextResponse.json({
        success: false,
        error: 'conversation_id query parameter is required'
      }, { status: 400 });
    }
    
    // Get auth token from request headers
    const token = getAuthToken(req);
    
    if (!token) {
      console.error('[API /messages/list] No valid authorization token provided');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'No valid authorization token provided');
    }
    
    // Get API key for the user
    const apiKey = await getOrCreateKeyByName(token, "Playground");
    const platformUserResponse : ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
    if (!platformUserResponse.success) {
      console.error('[API /messages/list] Error getting platform user from token:', platformUserResponse);
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
        
    // Call agent service using the correct endpoint name
    const conversationResponse = await callApiService(
      `/agent/message/get-messages-from-conversation?conversation_id=${conversationId}`,
      'GET',
      platformClientUserId,
      apiKey
    );
    
    // If the backend call was successful, transform the response
    if (conversationResponse.success) {
      // Format the messages to match frontend expectations
      // This may require additional transformation depending on 
      // the exact format returned by the backend API
      
      return NextResponse.json({
        success: true,
        data: conversationResponse.data || []
      }, { status: 200 });
    } else {
      console.error('[API /messages/list] Failed to fetch messages' + conversationResponse.error);
      // If the backend call failed, pass along the error
      return NextResponse.json({
        success: false,
        error: conversationResponse.error || 'Failed to fetch messages'
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('[API /messages/list] Error:', error);
    return handleApiError(error, 'Failed to retrieve messages');
  }
} 