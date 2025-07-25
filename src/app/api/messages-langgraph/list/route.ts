/**
 * API Route: /api/messages-langgraph/list
 * 
 * GET handler to retrieve messages for a LangGraph conversation.
 */
import { NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse,
  handleApiError 
} from '../../utils';
import { AgentBaseCredentials, ConversationLanggraph, ServiceResponse } from '@agent-base/types';
import { auth } from '@clerk/nextjs/server';
import { getConversationByIdLangGraphInternalApiService } from '@agent-base/api-client';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const conversationId = url.searchParams.get('conversationId');
    
    if (!conversationId) {
      return createErrorResponse(400, 'INVALID_REQUEST', 'conversationId query parameter is required');
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

    const getMessagesResponse: ServiceResponse<ConversationLanggraph> = await getConversationByIdLangGraphInternalApiService(
      { conversationId },
      userId,
      orgId,
      userId,
      agentBaseApiKey
    );

    if (!getMessagesResponse.success) {
      return createErrorResponse(500, 'API_CLIENT_ERROR', getMessagesResponse.error || 'Failed to fetch messages');
    }

    const messages = getMessagesResponse.data.messages;
    return createSuccessResponse(messages, 200);
    
  } catch (error: any) {
    return handleApiError(error, 'Failed to retrieve messages');
  }
} 