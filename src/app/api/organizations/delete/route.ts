import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from 'next/server';
import { deleteOrganization } from "@agent-base/api-client";
import { AgentBaseCredentials } from "@agent-base/types";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { organizationId } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    // 1. Delete on our internal database's side
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
    if (!agentBaseApiKey) {
        console.error('[API] AGENT_BASE_API_KEY environment variable not set');
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const credentials: AgentBaseCredentials = {
        clientAuthUserId: userId,
        clientAuthOrganizationId: organizationId,
        platformApiKey: agentBaseApiKey,
    };

    const dbDeleteResponse = await deleteOrganization(organizationId, credentials);

    if (!dbDeleteResponse.success) {
      console.error(`[API] Clerk delete succeeded but DB delete failed for org ${organizationId}:`, dbDeleteResponse.error);
      return NextResponse.json(dbDeleteResponse, { status: 500 });
    }

    // 2. Delete on Clerk's side
    const client = await clerkClient();
    const deletedOrgOnClerk = await client.organizations.deleteOrganization(organizationId);

    // 3. Revalidate the path to reflect the changes in the UI
    revalidatePath('/', 'layout');
    
    return NextResponse.json(dbDeleteResponse);

  } catch (error: any) {
    console.error(`[API] Error in delete organization:`, error);
    let errorMessage = "Failed to delete organization";
    if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].longMessage || errorMessage;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 