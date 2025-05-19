/**
 * API Route: Get User API Tools
 * Fetches all API tools available to the authenticated user.
 */
import { NextRequest } from 'next/server';
import { getUserApiTools } from '@agent-base/api-client';
import { ServiceResponse, ApiTool, PlatformUserApiServiceCredentials } from '@agent-base/types';
import { createErrorResponse, createSuccessResponse } from '../utils/types';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

        // Check if the user is authenticated
        if (!userId) {
            console.error('[API /api-tools] User not authenticated via Clerk');
            return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
        }

        // Check if the API key is configured
        if (!agentBaseApiKey) {
            console.error('[API /api-tools] AGENT_BASE_API_KEY environment variable not set');
            return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
        }

        const credentials: PlatformUserApiServiceCredentials = {
            platformClientUserId: userId,
            platformApiKey: agentBaseApiKey
        };

        // Call the SDK function to get user-specific API tools
        const apiToolsResponse: ServiceResponse<ApiTool[]> = await getUserApiTools(credentials);

        if (!apiToolsResponse.success) {
            const errorVal = apiToolsResponse.error;
            console.error('[API /api-tools] Failed to fetch API tools: ', errorVal);
            
            let errorMessage = 'Failed to fetch API tools';
            let errorDetails = 'Error fetching tools from the backend service.';
            let statusCode = 500;
            let errorCode = 'SERVICE_ERROR';

            if (typeof errorVal === 'string') {
                errorMessage = errorVal;
            } else if (errorVal && typeof errorVal === 'object') {
                errorMessage = (errorVal as any).message || errorMessage;
                const details = (errorVal as any).details;
                if (details) {
                    errorDetails = typeof details === 'string' ? details : JSON.stringify(details);
                } else {
                    errorDetails = 'No additional details provided.';
                }
                statusCode = (errorVal as any).statusCode || statusCode;
                errorCode = (errorVal as any).code || errorCode;
            }
            return createErrorResponse(statusCode, errorCode, errorMessage, errorDetails);
        }

        // Return the successful response with the API tools
        return createSuccessResponse(apiToolsResponse.data, 200);

    } catch (error: any) {
        console.error('❌ API /api-tools - Error:', error);
        const status = typeof error.status === 'number' ? error.status : 500;
        return createErrorResponse(
            status,
            'SERVICE_ERROR',
            error.message || 'An unexpected error occurred.',
            'Internal service error while processing the request for API tools.'
        );
    }
}
