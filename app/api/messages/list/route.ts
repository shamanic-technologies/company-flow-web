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
  createSuccessResponse,
  handleApiError 
} from '../../utils';
import { getOrCreateKeyByName, getPlatformUserFromToken } from '../../utils/web-client';
import { PlatformUserApiServiceCredentials, ServiceResponse } from '@agent-base/types';
import { PlatformUser } from '@agent-base/types';
import { auth } from '@clerk/nextjs/server';
import { getMessagesFromConversationExternalApiService } from '@agent-base/api-client';

export async function GET(req: NextRequest) {
  try {
    // Get conversation_id from query params
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    
    if (!conversationId) {
      console.error('[API /messages/list] Missing conversationId query parameter');
      return createErrorResponse(400, 'INVALID_REQUEST', 'conversationId query parameter is required', 'Missing required query parameter: conversationId');
    }
    
    const { userId } = await auth();
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
    
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

    const getMessagesFromConversationResponse = await getMessagesFromConversationExternalApiService(
      { conversationId },
      credentials
    );

    // If the backend call was successful, transform the response
    if (!getMessagesFromConversationResponse.success) {
      console.error('[API /messages/list] Failed to fetch messages' + getMessagesFromConversationResponse.error);
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Failed to fetch messages');
    }

    const messages = getMessagesFromConversationResponse.data;

    return createSuccessResponse(messages, 200);
    
  } catch (error: any) {
    console.error('[API /messages/list] Error:', error);
    return handleApiError(error, 'Failed to retrieve messages');
  }
} 