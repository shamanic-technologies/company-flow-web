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
  getAuthToken,
  handleApiError
} from '../../utils';
import { getOrCreateKeyByName, getPlatformUserFromToken } from '../../utils/web-client';
import { ServiceResponse, PlatformUser, PlatformUserApiServiceCredentials, CreateConversationInput } from '@agent-base/types';
// Import the specific API client function
import { createConversationExternalApiService } from '@agent-base/api-client';

export const POST = async (req: NextRequest) => {
  try {
    // 1. Get auth token
    const token = getAuthToken(req);
    if (!token) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'No valid authorization token provided');
    }

    // 2. Parse request body
    let body: CreateConversationInput;
    try {
      body = await req.json();
    } catch (error) {
      console.error('[API /conversations/create] Invalid JSON body:', error);
      return createErrorResponse(400, 'INVALID_REQUEST', 'Invalid JSON format in request body', 'Could not parse request body as JSON');
    }

    // 3. Validate required fields in body
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

    console.log(`[API /conversations/create] Request to create conversation ${conversationId} for agent ${agentId}`);

    // 4. Prepare credentials
    const apiKey = await getOrCreateKeyByName(token, "Playground"); // Use appropriate key name if needed
    const platformUserResponse: ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
    if (!platformUserResponse.success || !platformUserResponse.data) {
      console.error('[API /conversations/create] Error getting platform user from token:', platformUserResponse);
      return createErrorResponse(500, 'USER_FETCH_FAILED', platformUserResponse.error || 'Failed to get user info', platformUserResponse.error);
    }
    const platformClientUserId = platformUserResponse.data.id;

    // Use PlatformUserApiServiceCredentials type
    const credentials: PlatformUserApiServiceCredentials = {
      platformClientUserId: platformClientUserId,
      platformApiKey: apiKey
    };

    // 5. Call API client function
    const createResponse = await createConversationExternalApiService(
      body, // Pass the validated request body
      credentials // Pass the credentials object
    );

    console.log(`[API /conversations/create] API client response for ${conversationId}:`, createResponse);

    // 6. Handle response from API client
    if (!createResponse.success) {
      console.error('[API /conversations/create] API client call failed:', createResponse.error);
      // Use default status code (e.g., 500) as statusCode might not be present in failed ServiceResponse
      // const statusCode = typeof createResponse.statusCode === 'number' ? createResponse.statusCode : 500;
      return createErrorResponse(500, 'API_CLIENT_ERROR', createResponse.error || 'Failed to create conversation via API client', createResponse.error);
    }

    // Return successful response (201 Created)
    // createSuccessResponse defaults to 200, so specify 201
    return new Response(
      JSON.stringify(createResponse), // Return the full success response from the client
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (error: any) {
    // Use shared error handler for unexpected errors
    return handleApiError(error, 'An unexpected error occurred while creating the conversation');
  }
}; 