/**
 * API Route: Get User Created Webhooks
 * Fetches all webhook definitions created by the authenticated user.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getUserCreatedWebhooks } from '@agent-base/api-client';
import { ServiceResponse, Webhook, InternalServiceCredentials, PlatformUser } from '@agent-base/types';
import { getAuthToken } from '../../utils/types'; // Assuming location of getAuthToken
import { getPlatformUserFromToken, getOrCreateKeyByName } from '../../utils/web-client'; // Added getOrCreateKeyByName

export async function POST(request: NextRequest) {
    try {
        // 1. Get Auth Token
        const token = getAuthToken(request);
        if (!token) {
            console.error('❌ GetCreatedWebhooks API - No auth token found');
            return NextResponse.json(
                { success: false, error: 'Authentication required' },
                { status: 401 }
            );
        }

        // 2. Validate token and get user info
        const userResponse: ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
        if (!userResponse.success || !userResponse.data) {
            console.error('❌ GetCreatedWebhooks API - Invalid token or failed to get user');
            return NextResponse.json(
                { success: false, error: userResponse.error || 'Authentication failed' },
                { status: 401 } // Or appropriate status from userResponse
            );
        }
        const platformUserId = userResponse.data.id; 
        // TODO: Verify how clientUserId should be obtained. Assuming it's the same as platformUserId for now.
        const clientUserId = userResponse.data.id; 

        // 3. Get Platform API Key
        const platformApiKey = await getOrCreateKeyByName(token, "Playground"); // Use the common helper
        if (!platformApiKey) {
            console.error('❌ GetCreatedWebhooks API - Failed to get or create Platform API Key');
            return NextResponse.json({ success: false, error: 'API Key retrieval failed' }, { status: 500 });
        }

        // 4. Prepare Credentials for SDK
        const credentials: InternalServiceCredentials = {
            platformUserId,
            clientUserId, // Using platformUserId here, needs verification
            platformApiKey,
            agentId: undefined, 
        };

        // 5. Call the SDK function
        const webhooksResponse: ServiceResponse<Webhook[]> = await getUserCreatedWebhooks(credentials);

        // 6. Return the response
        return NextResponse.json(webhooksResponse);

    } catch (error: any) {
        console.error('❌ GetCreatedWebhooks API - Error:', error);

        // Handle known errors with status code
        if (error && typeof error === 'object' && 'status' in error) {
            return NextResponse.json(
                { success: false, error: error.message || 'Service error' },
                { status: error.status }
            );
        }

        // Default error handling
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
} 