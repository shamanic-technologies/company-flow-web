/**
 * API Route: /api/dashboard/query
 * 
 * Executes a raw SQL query against the user's sandboxed database via the dashboard-service.
 */
import { NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleApiError
} from '../../utils';
import { auth } from "@clerk/nextjs/server";
import { queryDashboard } from '@agent-base/api-client';
import { AgentBaseCredentials, ServiceResponse } from '@agent-base/types';

export async function POST(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }
    if (!orgId) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Organization required', 'User must be part of an organization.');
    }

    const { query } = await req.json();

    if (!query || typeof query !== 'string') {
        return createErrorResponse(400, 'BAD_REQUEST', 'Missing query', 'A "query" string is required in the request body.');
    }

    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
    if (!agentBaseApiKey) {
      console.error('[API /dashboard/query] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }

    const credentials: AgentBaseCredentials = {
      clientAuthUserId: userId,
      clientAuthOrganizationId: orgId,
      platformApiKey: agentBaseApiKey
    };

    const queryResponse: ServiceResponse<Record<string, any>[]> = await queryDashboard(query, credentials);

    if (!queryResponse.success) {
      console.error(`[API /dashboard/query] Error executing query:`, queryResponse.error);
      return new Response(JSON.stringify(queryResponse), {status: 500});
    }
    console.debug(queryResponse, null, 2);
    return new Response(JSON.stringify(queryResponse.data), {status: 200}); 

  } catch (error: any) {
    console.error('[API /dashboard/query] Error:', error);
    return handleApiError(error, 'An unexpected error occurred while executing the query');
  }
} 