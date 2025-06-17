/**
 * API Route: /api/agents/run
 * 
 * Handles streaming chat requests using Vercel AI SDK.
 * Receives { message, id } from useChat (due to prepareRequestBody).
 * Forwards the request to the gateway /run endpoint, sending the payload
 * expected by the agent-service /run endpoint: { message: lastMessage, conversation_id: id }.
 */
import { NextRequest, NextResponse } from 'next/server';
import { Message } from 'ai';
import { AgentBaseCredentials } from '@agent-base/types';
import { 
  createErrorResponse, 
  handleApiError
} from '../../utils';
import { auth } from '@clerk/nextjs/server';
import { triggerAgentRunPlatformUserApiServiceStream } from '@agent-base/api-client';

/**
 * POST handler for agent run requests.
 * This function handles incoming POST requests to run an agent.
 * It authenticates the user, validates the request payload,
 * and then calls the agent service to process the request, streaming the response back.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Receive Correct Body { messages: Message[], id: string } from useChat
    const { messages, id: conversationId } = await req.json();

    // Validate incoming payload
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('[API /agents/run] Invalid or empty messages array received: ' + JSON.stringify(messages));
      return createErrorResponse(400, 'INVALID_REQUEST', 'Invalid or empty messages array received');
    }
    if (!conversationId) {
      console.error('[API /agents/run] Missing required field: id (conversationId): ' + JSON.stringify(conversationId));
      return createErrorResponse(400, 'INVALID_REQUEST', 'Missing required field: id (conversationId)');
    }

    // 2. Auth
    const { userId, orgId } = await auth();

    // Check if the user is authenticated
    if (!userId) {
      console.error('[API /agents/run] User not authenticated via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }
    if (!orgId) {
      console.error('[API /agents/run] User not in an organization via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be in an organization.');
    }

    // Retrieve the shared API key from environment variables
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

    // Check if the API key is configured
    if (!agentBaseApiKey) {
      console.error('[API /agents/run] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }

    // 3. Call Agent Service using the new SDK client
    const platformUserApiServiceCredentials: AgentBaseCredentials = {
        clientAuthUserId: userId,
        clientAuthOrganizationId: orgId,
        platformApiKey: agentBaseApiKey
    };

    const response = await triggerAgentRunPlatformUserApiServiceStream(
        conversationId,
        messages,
        platformUserApiServiceCredentials
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
      if (!response.body) {
        console.error('[API /agents/run] Error: Response body from triggerAgentRunPlatformUserApiServiceStream is null or undefined.');
        return createErrorResponse(500, 'STREAM_ERROR', 'Upstream response body is missing');
      }
      return new Response(response.body, { headers });
    } catch (streamError) {
      console.error('[API /agents/run] Error: Failed to create streaming response:', streamError);
      return createErrorResponse(500, 'STREAM_ERROR', 'Failed to create streaming response');
    }

  } catch (error: any) {
    console.error('[API /agents/run] Error:', error);
    return handleApiError(error, 'An unexpected error occurred while running the agent');
  }
} 