/**
 * API Route: /api/conversations/create
 * 
 * POST handler to create a new conversation.
 * Calls the agent-service via the API gateway using the createConversationExternalApiService client function.
 */
import { type NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError
} from '../../utils';
import { CreateConversationInput, AgentBaseCredentials } from '@agent-base/types';
// Import the specific API client function
import { createConversationExternalApiService } from '@agent-base/api-client';
import { auth } from '@clerk/nextjs/server';

export const POST = async (req: NextRequest) => {
  try {

    // Parse request body
    let body: CreateConversationInput;
    try {
      body = await req.json();
    } catch (error) {
      console.error('[API /conversations/create] Invalid JSON body:', error);
      return createErrorResponse(400, 'INVALID_REQUEST', 'Invalid JSON format in request body', 'Could not parse request body as JSON');
    }

    // Validate required fields in body
    const { agentId, channelId, conversationId } = body;
    if (!agentId || !channelId || !conversationId) {
      const missing = [
        !agentId ? 'agentId' : null,
        !channelId ? 'channelId' : null,
        !conversationId ? 'conversationId' : null
      ].filter(Boolean).join(', ');
      console.error(`[API /conversations/create] Missing required fields: ${missing}`);
      return createErrorResponse(400, 'INVALID_REQUEST', `Missing required fields: ${missing}`, `Request body must include agentId, channelId, and conversationId`);
    }

    // Prepare credentials

    const { userId, orgId } = await auth();
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

    // Check if the user is authenticated
    if (!userId) {
      console.error('[API /agents/get-or-create] User not authenticated via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }
    if (!orgId) {
      console.error('[API /conversations/create] User not in an organization via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be in an organization.');
    }
    // Check if the API key is configured
    if (!agentBaseApiKey) {
      console.error('[API /agents/get-or-create] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }

    const credentials: AgentBaseCredentials = {
        clientAuthUserId: userId,
        clientAuthOrganizationId: orgId,
        platformApiKey: agentBaseApiKey // Assuming the fetched apiKey is the platformApiKey
    };

    // Call API client function
    const createResponse = await createConversationExternalApiService(
      body, // Pass the validated request body
      credentials // Pass the credentials object
    );


    // 6. Handle response from API client
    if (!createResponse.success) {
      console.error('[API /conversations/create] API client call failed:', createResponse.error);
      return createErrorResponse(500, 'API_CLIENT_ERROR', createResponse.error || 'Failed to create conversation via API client', createResponse.error);
    }

    const conversation = createResponse.data;

    return createSuccessResponse(conversation, 201);

  } catch (error: any) {
    console.log('Error in /conversations/create:', error);
    return handleApiError(error, 'An unexpected error occurred while creating the conversation');
  }
}; 