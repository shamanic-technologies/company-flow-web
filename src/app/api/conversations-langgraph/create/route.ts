/**
 * API Route: /api/conversations-langgraph/create
 * 
 * POST handler to create a new LangGraph conversation.
 */
import { type NextRequest } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError
} from '../../utils';
import { CreateConversationInput, AgentBaseCredentials, ServiceResponse, ConversationId } from '@agent-base/types';
import { createConversationLangGraphExternalApiService } from '@agent-base/api-client';
import { auth } from '@clerk/nextjs/server';

export const POST = async (req: NextRequest) => {
  try {

    let body: CreateConversationInput;
    try {
      body = await req.json();
    } catch (error) {
      return createErrorResponse(400, 'INVALID_REQUEST', 'Invalid JSON format');
    }

    const { agentId, channelId, conversationId } = body;
    if (!agentId || !channelId || !conversationId) {
      return createErrorResponse(400, 'INVALID_REQUEST', 'Missing required fields: agentId, channelId, conversationId');
    }

    const { userId, orgId } = await auth();
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

    if (!userId || !orgId || !agentBaseApiKey) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication details are missing.');
    }

    const credentials: AgentBaseCredentials = {
        clientAuthUserId: userId,
        clientAuthOrganizationId: orgId,
        platformApiKey: agentBaseApiKey
    };

    const createResponse: ServiceResponse<ConversationId> = await createConversationLangGraphExternalApiService(
      body,
      credentials
    );

    if (!createResponse.success) {
      return createErrorResponse(500, 'API_CLIENT_ERROR', createResponse.error || 'Failed to create conversation');
    }

    return createSuccessResponse(createResponse.data, 201);

  } catch (error: any) {
    return handleApiError(error, 'An unexpected error occurred');
  }
}; 