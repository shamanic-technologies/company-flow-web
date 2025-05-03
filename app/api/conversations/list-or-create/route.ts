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
  getAuthToken, 
  callApiService,
  handleApiError
} from '../../utils';
import { getOrCreateKeyByName, getPlatformUserFromToken } from '../../utils/web-client';
import { ServiceResponse, PlatformUser, PlatformUserApiServiceCredentials } from '@agent-base/types';
// Import the specific API client function
import { getOrCreateConversationsExternalApiService } from '@agent-base/api-client';

export const GET = async (req: NextRequest) => {
  try {
    // Get auth token from request headers
    const token = getAuthToken(req);
    
    if (!token) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'No valid authorization token provided');
    }
    
    // Get agent_id from query parameters
    const agentId = req.nextUrl.searchParams.get('agent_id');

    if (!agentId) {
      console.error('[API /conversations/list-or-create] Missing agent_id parameter');
      return createErrorResponse(400, 'INVALID_REQUEST', 'agent_id is required', 'Missing required query parameter: agent_id');
    }

    console.log(`[API /conversations/list-or-create] Getting or creating conversations for agent_id: ${agentId}`);
    
    // --- Prepare credentials for API client ---
    const apiKey = await getOrCreateKeyByName(token, "Playground");
    const platformUserResponse: ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
    if (!platformUserResponse.success || !platformUserResponse.data) {
      console.error('[API /conversations/list-or-create] Error getting platform user from token:', platformUserResponse);
      // Return the error response directly if fetching the user failed
      // Use default status 500 if specific status isn't available in the response
      return createErrorResponse(500, 'USER_FETCH_FAILED', platformUserResponse.error || 'Failed to get user info', platformUserResponse.error);
    }
    const platformClientUserId = platformUserResponse.data.id; // Assuming this ID corresponds to platformClientUserId for credentials

    const credentials: PlatformUserApiServiceCredentials = {
        platformClientUserId: platformClientUserId,
        platformApiKey: apiKey // Assuming the fetched apiKey is the platformApiKey
    };
    // --- End prepare credentials ---

    // --- Call API client function ---
    // Replace callApiService with the specific client function
    const data = await getOrCreateConversationsExternalApiService(
        { agentId }, // Pass agentId in the params object
        credentials // Pass the credentials object
    );
    // --- End call API client function ---
    
    console.log(`[API /conversations/list-or-create] Retrieved ${data?.data?.length || 0} conversations from API client`);
    console.log(`[API /conversations/list-or-create] Data:`, data);

    // Check if the API client call itself failed
    if (!data.success) {
        console.error('[API /conversations/list-or-create] API client call failed:', data.error);
        // Use default status 500 if specific status isn't available in the response
        return createErrorResponse(500, 'API_CLIENT_ERROR', data.error || 'Failed to get/create conversations via API client', data.error);
    }

    // Return successful response with data from the API client
    // Directly construct the Response to bypass linter issue with createSuccessResponse signature
    return new Response(
        JSON.stringify(data), // Stringify the successful ServiceResponse object
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store' // Keep consistent headers
          }
        }
      );
  } catch (error: any) {
    return handleApiError(error, 'An unexpected error occurred while listing or creating conversations');
  }
}; 