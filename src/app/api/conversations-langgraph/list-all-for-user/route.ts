import { NextResponse, NextRequest } from 'next/server';
import { getAllClientUserConversationsLangGraphApiService } from '@agent-base/api-client'; 
import { ServiceResponse, Conversation, AgentBaseCredentials } from '@agent-base/types';
import { auth } from "@clerk/nextjs/server";
import { createErrorResponse } from '@/app/api/utils';

export async function GET(req: NextRequest) {
    try {
        const { userId, orgId } = await auth();

        if (!userId) {
            return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required');
        }
        if (!orgId) {
            return createErrorResponse(401, 'UNAUTHORIZED', 'User must be in an organization.');
        }

        const platformApiKey = process.env.AGENT_BASE_API_KEY; 

        if (!platformApiKey) {
            return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error');
        }

        const credentials: AgentBaseCredentials = {
            clientAuthUserId: userId,
            clientAuthOrganizationId: orgId,
            platformApiKey: platformApiKey,
        };

        const response: ServiceResponse<Conversation[]> = await getAllClientUserConversationsLangGraphApiService(credentials);

        if (response.success) {
            return NextResponse.json(response, { status: 200 });
        } else {
            return NextResponse.json(
                { success: false, error: response.error || 'Failed to retrieve conversations' }, 
                { status: 500 } 
            );
        }

    } catch (error: any) {
        const errorMessage = error.message || 'An unknown error occurred';
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred', details: errorMessage }, 
            { status: 500 }
        );
    }
} 