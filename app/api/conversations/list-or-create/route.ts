/**
 * API Route: /api/conversations/list
 * 
 * GET handler to list conversations for a given agent_id.
 * If no conversations exist, automatically creates one.
 * Calls the agent-service via API gateway to retrieve/create the conversations.
 */
import { type NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleApiError
} from '../../utils';
import { PlatformUserApiServiceCredentials, Conversation } from '@agent-base/types';
import { getOrCreateConversationsPlatformUserApiService } from '@agent-base/api-client';
import { auth } from '@clerk/nextjs/server';

export const GET = async (req: NextRequest) => {
  try {
    
    // Get agent_id from query parameters
    const agentId = req.nextUrl.searchParams.get('agent_id');
    const { userId } = await auth();
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

    if (!agentId) {
      console.error('[API /conversations/list-or-create] Missing agent_id parameter');
      return createErrorResponse(400, 'INVALID_REQUEST', 'agent_id is required', 'Missing required query parameter: agent_id');
    }
    
    // Check if the user is authenticated
    if (!userId) {
      console.error('[API /agents/get-or-create] User not authenticated via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }

    // Check if the API key is configured
    if (!agentBaseApiKey) {
      console.error('[API /agents/get-or-create] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }

    const credentials: PlatformUserApiServiceCredentials = {
        platformClientUserId: userId,
        platformApiKey: agentBaseApiKey // Assuming the fetched apiKey is the platformApiKey
    };

    // --- Call API client function ---
    // Replace callApiService with the specific client function
    const getResponse = await getOrCreateConversationsPlatformUserApiService(
        { agentId }, // Pass agentId in the params object
        credentials // Pass the credentials object
    );
    // --- End call API client function ---

    // Check if the API client call itself failed
    if (!getResponse.success) {
        console.error('[API /conversations/list-or-create] API client call failed:', getResponse.error);
        // Use default status 500 if specific status isn't available in the response
        return createErrorResponse(500, 'API_CLIENT_ERROR', getResponse.error || 'Failed to get/create conversations via API client', getResponse.error);
    }

    const conversations : Conversation[] = getResponse.data;
    // Return successful response with data from the API client
    // Directly construct the Response to bypass linter issue with createSuccessResponse signature
    return createSuccessResponse(conversations, 200);

  } catch (error: any) {
    console.log('Error in /conversations/list-or-create:', error);
    return handleApiError(error, 'An unexpected error occurred while listing or creating conversations');
  }
}; 