import { NextResponse, NextRequest } from 'next/server';
import { getAllUserConversationsPlatformUserApiService } from '@agent-base/api-client'; 
import { PlatformUserApiServiceCredentials, ServiceResponse, Conversation } from '@agent-base/types';

// Import Clerk's auth helper for server-side authentication
import { auth } from "@clerk/nextjs/server";

// Assuming these utility functions are available and correctly pathed from the example
// You might need to adjust the path or ensure these exist in your ../../utils location
// For now, I will use NextResponse directly for simplicity if these are not standard.
// import { createErrorResponse, createSuccessResponse, handleApiError} from '../../utils';

export async function GET(req: NextRequest) { // Changed to NextRequest for consistency with example
    try {
        // Use Clerk's auth() helper to get the userId
        const { userId: platformClientUserId } = await auth(); // Renaming to platformClientUserId for clarity

        // Check if the user is authenticated
        if (!platformClientUserId) {
            console.error('[API /conversations/list-all-for-user] User not authenticated via Clerk');
            // Using NextResponse directly for error response
            return NextResponse.json(
                { success: false, error: 'Authentication required', details: 'User must be logged in.' }, 
                { status: 401 }
            );
        }

        // Retrieve the shared API key from environment variables (using AGENT_BASE_API_KEY from example)
        const platformApiKey = process.env.AGENT_BASE_API_KEY; 

        // Check if the API key is configured
        if (!platformApiKey) {
            console.error('[API /conversations/list-all-for-user] AGENT_BASE_API_KEY environment variable not set');
            return NextResponse.json(
                { success: false, error: 'Server configuration error', details: 'Required API key is missing.' }, 
                { status: 500 }
            );
        }

        const credentials: PlatformUserApiServiceCredentials = {
            platformClientUserId: platformClientUserId, 
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