/**
 * API Route: /api/dashboard/get
 * 
 * Retrieves the full details of a single dashboard by its ID.
 */
import { NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleApiError
} from '../../utils';
import { auth } from "@clerk/nextjs/server";
import { getDashboardById } from '@agent-base/api-client';
import { AgentBaseCredentials, Dashboard, ServiceResponse } from '@agent-base/types';

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }
    if (!orgId) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Organization required', 'User must be part of an organization.');
    }

    const { searchParams } = new URL(req.url);
    const dashboardId = searchParams.get('id');

    if (!dashboardId) {
        return createErrorResponse(400, 'BAD_REQUEST', 'Missing dashboard ID', 'The "id" query parameter is required.');
    }

    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
    if (!agentBaseApiKey) {
      console.error('[API /dashboard/get] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }

    const credentials: AgentBaseCredentials = {
      clientAuthUserId: userId,
      clientAuthOrganizationId: orgId,
      platformApiKey: agentBaseApiKey
    };

    const getResponse: ServiceResponse<Dashboard> = await getDashboardById(dashboardId, credentials);

    if (!getResponse.success) {
      console.error(`[API /dashboard/get] Error getting dashboard ${dashboardId}:`, getResponse.error);
      return new Response(JSON.stringify(getResponse), {status: 500});
    }
    return new Response(JSON.stringify(getResponse.data), {status: 200}); 

  } catch (error: any) {
    console.error('[API /dashboard/get] Error:', error);
    return handleApiError(error, 'An unexpected error occurred while getting the dashboard');
  }
} 