/**
 * API Route: /api/dashboard/list
 * 
 * Lists all dashboards for the authenticated user and their active organization.
 */
import { NextRequest } from 'next/server';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  handleApiError
} from '../../utils';
import { auth } from "@clerk/nextjs/server";
import { listDashboards } from '@agent-base/api-client';
import { AgentBaseCredentials, DashboardInfo, ServiceResponse } from '@agent-base/types';

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth();

    if (!userId) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }
    if (!orgId) {
      return createErrorResponse(401, 'UNAUTHORIZED', 'Organization required', 'User must be part of an organization.');
    }

    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
    if (!agentBaseApiKey) {
      console.error('[API /dashboard/list] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }

    const credentials: AgentBaseCredentials = {
      clientAuthUserId: userId,
      clientAuthOrganizationId: orgId,
      platformApiKey: agentBaseApiKey
    };

    const listResponse : ServiceResponse<DashboardInfo[]> = await listDashboards(credentials);

    if (!listResponse.success) {
      console.error('[API /dashboard/list] Error listing dashboards:', listResponse.error);
      return createErrorResponse(500, 'API_ERROR', 'Failed to list dashboards', listResponse.error);
    }

    return createSuccessResponse(listResponse.data, 200);

  } catch (error: any) {
    console.error('[API /dashboard/list] Error:', error);
    return handleApiError(error, 'An unexpected error occurred while listing dashboards');
  }
} 