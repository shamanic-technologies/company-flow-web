/**
 * API Route: Get User Created Webhooks
 * Fetches all webhook definitions created by the authenticated user.
 */
import { NextRequest } from 'next/server';
import { getWebhookEvents } from '@agent-base/api-client';
import { ServiceResponse, PlatformUserApiServiceCredentials, WebhookEvent } from '@agent-base/types';
import { createErrorResponse, createSuccessResponse } from '../../utils/types';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const webhookId = url.searchParams.get('webhookId');

        if (!webhookId) {
            console.error('[API /webhook-tools/get-events] Missing webhookId query parameter');
            return createErrorResponse(400, 'INVALID_REQUEST', 'webhookId query parameter is required', 'Missing required query parameter: webhookId');
        }

        const { userId } = await auth();
        const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

        // Check if the user is authenticated
        if (!userId) {
          console.error('[API /webhook-tools/get-events] User not authenticated via Clerk');
          return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
        }
    
        // Check if the API key is configured
        if (!agentBaseApiKey) {
          console.error('[API /webhook-tools/get-events] AGENT_BASE_API_KEY environment variable not set');
          return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
        }
    
        const credentials: PlatformUserApiServiceCredentials = {
            platformClientUserId: userId,
            platformApiKey: agentBaseApiKey // Assuming the fetched apiKey is the platformApiKey
        };
        
        // 5. Call the SDK function
        const webhooksResponse: ServiceResponse<WebhookEvent[]> = await getWebhookEvents(webhookId, credentials);
        if (!webhooksResponse.success) {
            console.error('[API /webhook-tools/get-events] Failed to fetch webhooks' + webhooksResponse.error);
            return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Failed to fetch webhooks');
        }
        console.log('Successfully fetched webhook events:', JSON.stringify(webhooksResponse, null, 2));
        // 6. Return the response
        return createSuccessResponse(webhooksResponse, 200);

    } catch (error: any) {
        console.error('❌ GetCreatedWebhooks API - Error:', error);
        return createErrorResponse(error.status, 'SERVICE_ERROR', error.message || 'Service error', 'Service error');
    }
} 