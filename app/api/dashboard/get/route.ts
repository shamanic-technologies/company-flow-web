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
import { getDashboard } from '@agent-base/api-client';
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

    const getResponse: ServiceResponse<Dashboard> = await getDashboard(dashboardId, credentials);

    if (!getResponse.success) {
      console.error(`[API /dashboard/get] Error getting dashboard ${dashboardId}:`, getResponse.error);
      return createErrorResponse(500, 'API_ERROR', 'Failed to get dashboard', getResponse.error);
    }

    console.debug('🎉 [API /dashboard/get] Get response:', getResponse);
    console.debug('🎉 [API /dashboard/get] Get response data:', getResponse.data.webContainerConfig.src.directory['main.tsx'].file.contents);
    return createSuccessResponse(getResponse.data, 200); 

  } catch (error: any) {
    console.error('[API /dashboard/get] Error:', error);
    return handleApiError(error, 'An unexpected error occurred while getting the dashboard');
  }
} 