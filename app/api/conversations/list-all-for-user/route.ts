import { NextResponse, NextRequest } from 'next/server';
import { getAllUserConversationsPlatformUserApiService } from '@agent-base/api-client'; 
import { ServiceResponse, Conversation, AgentBaseCredentials } from '@agent-base/types';

// Import Clerk's auth helper for server-side authentication
import { auth } from "@clerk/nextjs/server";
import { createErrorResponse } from '../../utils';

// Assuming these utility functions are available and correctly pathed from the example
// You might need to adjust the path or ensure these exist in your ../../utils location
// For now, I will use NextResponse directly for simplicity if these are not standard.
// import { createErrorResponse, createSuccessResponse, handleApiError} from '../../utils';

export async function GET(req: NextRequest) { // Changed to NextRequest for consistency with example
    try {
        // Use Clerk's auth() helper to get the userId
        const { userId, orgId } = await auth(); // Renaming to platformClientUserId for clarity

        // Check if the user is authenticated
        if (!userId) {
            console.error('[API /conversations/list-all-for-user] User not authenticated via Clerk');
            return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
        }
        if (!orgId) {
            console.error('[API /conversations/list-all-for-user] User not in an organization via Clerk');
            return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be in an organization.');
        }

        // Retrieve the shared API key from environment variables (using AGENT_BASE_API_KEY from example)
        const platformApiKey = process.env.AGENT_BASE_API_KEY; 

        // Check if the API key is configured
        if (!platformApiKey) {
            console.error('[API /conversations/list-all-for-user] AGENT_BASE_API_KEY environment variable not set');
            return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
        }

        const credentials: AgentBaseCredentials = {
            clientAuthUserId: userId,
            clientAuthOrganizationId: orgId,
            platformApiKey: platformApiKey,
        };

        const response: ServiceResponse<Conversation[]> = await getAllUserConversationsPlatformUserApiService(credentials);

        if (response.success) {
            // Using NextResponse directly for success response
            return NextResponse.json(response, { status: 200 });
        } else {
            console.error('[API /conversations/list-all-for-user] Failed to fetch user conversations:', response.error);
            return NextResponse.json(
                { success: false, error: response.error || 'Failed to retrieve conversations' }, 
                // Check if status is already part of response.error or infer from message
                { status: response.error?.includes('not found') ? 404 : 500 } 
            );
        }

    } catch (error: any) {
        console.error('[API /conversations/list-all-for-user] Error:', error);
        const errorMessage = error.message || 'An unknown error occurred';
        // Using NextResponse directly for catch-all error response
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred', details: errorMessage }, 
            { status: 500 }
        );
    }
} 