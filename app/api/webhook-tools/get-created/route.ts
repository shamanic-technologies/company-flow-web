/**
 * API Route: Get User Created Webhooks
 * Fetches all webhook definitions created by the authenticated user.
 */
import { NextRequest } from 'next/server';
import { getUserCreatedWebhooks } from '@agent-base/api-client';
import { ServiceResponse, Webhook, AgentBaseCredentials } from '@agent-base/types';
import { createErrorResponse, createSuccessResponse } from '../../utils/types'; // Assuming location of getAuthToken
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {

        const { userId, orgId } = await auth();
        const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
        
        // Check if the user is authenticated
        if (!userId) {
          console.error('[API /webhooks/get-created] User not authenticated via Clerk');
          return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
        }
        if (!orgId) {
          console.error('[API /webhooks/get-created] User not in an organization via Clerk');
          return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be in an organization.');
        }
        // Check if the API key is configured
        if (!agentBaseApiKey) {
          console.error('[API /webhooks/get-created] AGENT_BASE_API_KEY environment variable not set');
          return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
        }
    
        const credentials: AgentBaseCredentials = {
            clientAuthUserId: userId,
            clientAuthOrganizationId: orgId,
            platformApiKey: agentBaseApiKey // Assuming the fetched apiKey is the platformApiKey
        };
        
        // 5. Call the SDK function
        const webhooksResponse: ServiceResponse<Webhook[]> = await getUserCreatedWebhooks(credentials);
        if (!webhooksResponse.success) {
            console.error('[API /webhooks/get-created] Failed to fetch webhooks' + webhooksResponse.error);
            return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Failed to fetch webhooks');
        }
        
        // 6. Return the response
        return createSuccessResponse(webhooksResponse.data, 200);

    } catch (error: any) {
        console.error('❌ GetCreatedWebhooks API - Error:', error);
        return createErrorResponse(error.status, 'SERVICE_ERROR', error.message || 'Service error', 'Service error');
    }
} 