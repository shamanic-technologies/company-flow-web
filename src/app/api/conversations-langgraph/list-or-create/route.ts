/**
 * API Route: /api/conversations-langgraph/list-or-create
 * 
 * GET handler to list LangGraph conversations for a given agent_id.
 * If no conversations exist, automatically creates one.
 */
import { type NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleApiError
} from '../../utils';
import { Conversation, AgentBaseCredentials, ServiceResponse } from '@agent-base/types';
import { getOrCreateConversationsLangGraphPlatformUserApiService } from '@agent-base/api-client';
import { auth } from '@clerk/nextjs/server';

export const GET = async (req: NextRequest) => {
  try {
    
    const agentId = req.nextUrl.searchParams.get('agent_id');
    const { userId, orgId } = await auth();
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

    if (!agentId) {
      return createErrorResponse(400, 'INVALID_REQUEST', 'agent_id is required');
    }
    
    if (!userId || !orgId || !agentBaseApiKey) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication details are missing.');
    }

    const credentials: AgentBaseCredentials = {
        clientAuthUserId: userId,
        clientAuthOrganizationId: orgId,
        platformApiKey: agentBaseApiKey
    };

    const getResponse: ServiceResponse<Conversation[]> = await getOrCreateConversationsLangGraphPlatformUserApiService(
        { agentId },
        credentials
    );

    if (!getResponse.success) {
        return createErrorResponse(500, 'API_CLIENT_ERROR', getResponse.error || 'Failed to get/create conversations');
    }

    const conversations : Conversation[] = getResponse.data;
    return createSuccessResponse(conversations, 200);

  } catch (error: any) {
    return handleApiError(error, 'An unexpected error occurred');
  }
}; 