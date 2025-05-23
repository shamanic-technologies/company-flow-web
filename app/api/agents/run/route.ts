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
  callAgentServiceStream,
  handleApiError
} from '../../utils';
import { auth } from '@clerk/nextjs/server';

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
    const { userId } = await auth();

    // Check if the user is authenticated
    if (!userId) {
      console.error('[API /agents/run] User not authenticated via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }

    // Retrieve the shared API key from environment variables
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

    // Check if the API key is configured
    if (!agentBaseApiKey) {
      console.error('[API /agents/run] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }


    // 3. Call Gateway for /run endpoint
    const gatewayRunPath = '/agent/run'; // Path expected by api-gateway-service for agent-service /run

    // Prepare payload expected by agent-service /run endpoint
    const runPayload = {
        message, // Pass the single message object received
        conversationId // Pass the conversationId
    };

    const response = await callAgentServiceStream(
        gatewayRunPath, 
        agentBaseApiKey, 
        userId,
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