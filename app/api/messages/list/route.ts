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
import { AgentBaseCredentials } from '@agent-base/types';
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
    
    const { userId, orgId } = await auth();
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
    
    // Check if the user is authenticated
    if (!userId) {
      console.error('[API /agents/get-or-create] User not authenticated via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }
    if (!orgId) {
      console.error('[API /messages/list] User not in an organization via Clerk');
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