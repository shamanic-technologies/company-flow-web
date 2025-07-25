/*
/**
 * API Route: /api/agents/run-langgraph
 * 
 * This route is now designed to be compatible with the @langchain/langgraph-sdk's useStream hook.
 * It receives a request body with { input: { messages }, thread_id },
 * authenticates the user, and triggers the backend LangGraph agent stream.
 */
/*
import { NextRequest, NextResponse } from 'next/server';
import { AgentBaseCredentials } from '@agent-base/types';
import { 
  createErrorResponse, 
  handleApiError
} from '../../utils';
import { auth } from '@clerk/nextjs/server';
import { triggerLangGraphAgentRunStream } from '@agent-base/api-client';
import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
*/
/**
 * Converts messages from LangGraph SDK format to LangChain's BaseMessage format.
 * @param messages - An array of messages, typically from the useStream hook.
 * @returns An array of messages in LangChain's core BaseMessage format.
 */
/*
function convertToLangChainMessages(messages: any[]): BaseMessage[] {
  return messages.map(msg => {
    if (msg.type === 'human') {
      return new HumanMessage({ content: msg.content });
    } else if (msg.type === 'ai' || msg.type === 'assistant') {
      return new AIMessage({ content: msg.content });
    }
    throw new Error(`Unsupported message type: ${msg.type}`);
  });
}
*/

/**
 * POST handler for agent run requests.
 * This function handles incoming POST requests to run an agent.
 * It authenticates the user, validates the request payload,
 * and then calls the agent service to process the request, streaming the response back.
 */
/*
export async function POST(req: NextRequest) {
  try {
    // 1. Receive body from LangGraph's useStream hook
    const body = await req.json();
    console.debug('🤍 [CompanyFlow API /agents/run-langgraph] Received body:', JSON.stringify(body, null, 2));

    // Extract data based on the expected format from the SDK
    const messages = body.input?.messages; 
    const conversationId = body.thread_id;

    // Validate incoming payload
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('[API /agents/run-langgraph] Invalid or empty messages array in body.input: ' + JSON.stringify(body));
      return createErrorResponse(400, 'INVALID_REQUEST', 'Invalid or empty messages array in body.input');
    }

    if (!conversationId) {
      console.error('[API /agents/run-langgraph] Missing required field: thread_id: ' + JSON.stringify(body));
      return createErrorResponse(400, 'INVALID_REQUEST', 'Missing required field: thread_id');
    }

    // 2. Auth
    const { userId, orgId } = await auth();

    // Check if the user is authenticated
    if (!userId) {
      console.error('[API /agents/run-langgraph] User not authenticated via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be logged in.');
    }
    if (!orgId) {
      console.error('[API /agents/run-langgraph] User not in an organization via Clerk');
      return createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', 'User must be in an organization.');
    }

    // Retrieve the shared API key from environment variables
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;

    // Check if the API key is configured
    if (!agentBaseApiKey) {
      console.error('[API /agents/run-langgraph] AGENT_BASE_API_KEY environment variable not set');
      return createErrorResponse(500, 'CONFIG_ERROR', 'Server configuration error', 'Required API key is missing.');
    }

    // 3. Call Agent Service using the new SDK client
    const platformUserApiServiceCredentials: AgentBaseCredentials = {
        clientAuthUserId: userId,
        clientAuthOrganizationId: orgId,
        platformApiKey: agentBaseApiKey
    };
    // TODO: Add conversationId to the payload if not present
    console.debug('[API /agents/run-langgraph] messages', JSON.stringify(messages, null, 2));

    const langChainMessages = convertToLangChainMessages(messages);

    const response = await triggerLangGraphAgentRunStream(
        conversationId,
        langChainMessages,
        platformUserApiServiceCredentials
    );

    // 4. Handle Streaming Response
    const headers = new Headers();
    headers.set('Content-Type', 'text/event-stream');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Connection', 'keep-alive');
    headers.set('x-vercel-ai-data-stream', 'v1');

    try {
      if (!response.body) {
        console.error('[API /agents/run] Error: Response body from triggerAgentRunPlatformUserApiServiceStream is null or undefined.');
        return createErrorResponse(500, 'STREAM_ERROR', 'Upstream response body is missing');
      }
      return new Response(response.body, { headers });
    } catch (streamError) {
      console.error('[API /agents/run] Error: Failed to create streaming response:', streamError);
      return createErrorResponse(500, 'STREAM_ERROR', 'Failed to create streaming response');
    }

  } catch (error: any) {
    console.error('[API /agents/run] Error:', error);
    return handleApiError(error, 'An unexpected error occurred while running the agent');
  }
}
*/ 