/**
 * API Route: Get User API Tools
 * Fetches all API tools available to the authenticated user.
 */
import { NextRequest } from 'next/server';
import { getUserApiTools } from '@agent-base/api-client';
import { ServiceResponse, ApiTool, PlatformUserApiServiceCredentials, SearchApiToolResult } from '@agent-base/types';
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
        const apiToolsResponse: ServiceResponse<SearchApiToolResult> = await getUserApiTools(credentials);

        if (!apiToolsResponse.success) {
            const errorVal = apiToolsResponse.error;
            console.error('[API /api-tools] Failed to fetch API tools: ', errorVal);
            
            // Initialize with undefined or values directly from errorVal if they exist
            let errorMessage: string | undefined;
            let errorDetails: string | undefined;
            let statusCode: number = 500; // Default status code if not specified by errorVal
            let errorCode: string = 'SERVICE_ERROR'; // Default error code if not specified

            if (typeof errorVal === 'string') {
                errorMessage = errorVal;
            } else if (errorVal && typeof errorVal === 'object') {
                // Attempt to extract specific fields, without fallbacks to generic strings for these fields
                errorMessage = (errorVal as any).message; 
                errorDetails = (errorVal as any).details;
                // Only override defaults if statusCode and code are present and valid types
                if (typeof (errorVal as any).statusCode === 'number') {
                    statusCode = (errorVal as any).statusCode;
                }
                if (typeof (errorVal as any).code === 'string') {
                    errorCode = (errorVal as any).code;
                }
            }

            // If errorMessage is still undefined, set a generic one, as it's required by createErrorResponse
            if (errorMessage === undefined) {
                errorMessage = 'Failed to fetch API tools due to an unspecified error from the backend service.';
            }
            // errorDetails can remain undefined

            return createErrorResponse(statusCode, errorCode, errorMessage, errorDetails);
        }

        // Return the successful response with the API tools
        return createSuccessResponse(apiToolsResponse.data, 200);

    } catch (error: any) {
        console.error('❌ API /api-tools - Error:', error);
        const status = typeof error.status === 'number' ? error.status : 500;
        // Ensure message is a string. If error.message is not available or not a string, provide a clear indication.
        const message = typeof error.message === 'string' && error.message ? error.message : 'An unexpected error occurred without a specific message.';
        return createErrorResponse(
            status,
            error.code || 'SERVICE_ERROR', // Fallback for error.code
            message,
            // Pass error.details if available, otherwise it will be undefined
            typeof error.details === 'string' ? error.details : undefined 
        );
    }
}
