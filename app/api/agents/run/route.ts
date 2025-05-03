/**
 * API Route: /api/agents/run
 * 
 * Handles streaming chat requests using Vercel AI SDK.
 * Receives { message, id } from useChat (due to prepareRequestBody).
 * Forwards the request to the gateway /run endpoint, sending the payload
 * expected by the agent-service /run endpoint: { message: lastMessage, conversation_id: id }.
 */
import { NextRequest } from 'next/server';
// Removed imports for appendClientMessage, CoreMessage
import { 
  createErrorResponse, 
  getAuthToken, 
  callAgentServiceStream,
  handleApiError
} from '../../utils';
import { getOrCreateKeyByName, getPlatformUserFromToken } from '../../utils/web-client';
import { PlatformUser } from '@agent-base/types';
import { ServiceResponse } from '@agent-base/types';

/**
 * POST handler for agent run requests
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Receive Correct Body { message: object, id: string } from useChat
    const { message, id: conversationId } = await req.json();

    // Validate incoming payload
    if (!message || typeof message !== 'object' || !message.content) {
      console.error('[API /agents/run] Invalid message object received' + JSON.stringify(message));
      return createErrorResponse(400, 'INVALID_REQUEST', 'Invalid message object received');
    }
    if (!conversationId) {
      console.error('[API /agents/run] Missing required field: id (conversationId)' + JSON.stringify(conversationId));
      return createErrorResponse(400, 'INVALID_REQUEST', 'Missing required field: id (conversationId)');
    }

    // 2. Auth
    const token = getAuthToken(req);
    if (!token) {
      console.error('[API /agents/run] Missing required field: token' + JSON.stringify(token));
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
    }
    const platformAPIKey : string = await getOrCreateKeyByName(token, "Playground");
    const platformUserResponse : ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
    if (!platformUserResponse.success) {
      // Handle error when fetching platform user
      console.error('[API /agents/run] Error getting platform user from token:', platformUserResponse);
      
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
    // 3. Call Gateway for /run endpoint
    const gatewayRunPath = '/agent/run'; // Path expected by api-gateway-service for agent-service /run

    // Prepare payload expected by agent-service /run endpoint
    const runPayload = {
        message, // Pass the single message object received
        conversationId // Pass the conversationId
    };

    const response = await callAgentServiceStream(
        gatewayRunPath, 
        platformAPIKey, 
        platformClientUserId,
        runPayload // Send the simplified payload
    );

    // 4. Handle Streaming Response
    const headers = new Headers();
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Connection', 'keep-alive');
    headers.set('x-vercel-ai-data-stream', 'v1');

    try {
      console.log('[API /agents/run] Streaming response:', response);
      return new Response(response.body, { headers });
    } catch (streamError) {
      console.error('[API /agents/run] Stream creation error:', streamError);
      return createErrorResponse(500, 'STREAM_ERROR', 'Failed to create streaming response');
    }

  } catch (error: any) {
    console.error('[API /agents/run] Error:', error);
    return handleApiError(error, 'An unexpected error occurred while running the agent');
  }
} 