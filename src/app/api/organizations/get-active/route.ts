import { getAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from 'next/server';
import { getOrganizationByAuthId } from "@agent-base/api-client";
import { AgentBaseCredentials } from "@agent-base/types";

export async function GET(req: NextRequest) {
  const { userId, orgId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!orgId) {
    return NextResponse.json({ error: "No active organization found" }, { status: 404 });
  }

  const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
  if (!agentBaseApiKey) {
      console.error('[API] AGENT_BASE_API_KEY environment variable not set');
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const credentials: AgentBaseCredentials = {
      clientAuthUserId: userId,
      clientAuthOrganizationId: orgId,
      platformApiKey: agentBaseApiKey,
  };

  try {
    const response = await getOrganizationByAuthId(orgId, credentials);

    if (!response.success) {
      return NextResponse.json(response, { status: 502 });
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error(`[API] Error fetching active organization:`, error);
    return NextResponse.json({ error: "Failed to fetch active organization" }, { status: 500 });
  }
}