import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from 'next/server';
import { updateOrganization } from "@agent-base/api-client";
import { AgentBaseCredentials } from "@agent-base/types";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { organizationId, name, slug } = await req.json();

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId is required" }, { status: 400 });
    }

    // 1. Update on our internal database's side
    const agentBaseApiKey = process.env.AGENT_BASE_API_KEY;
    if (!agentBaseApiKey) {
        console.error('[API] AGENT_BASE_API_KEY environment variable not set');
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const credentials: AgentBaseCredentials = {
        clientAuthUserId: userId,
        clientAuthOrganizationId: organizationId, // Use the ID of the org being modified for context
        platformApiKey: agentBaseApiKey,
    };
    
    const dbUpdateResponse = await updateOrganization(
      organizationId,
      { name },
      credentials
    );

    if (!dbUpdateResponse.success) {
      console.error(`[API] Clerk update succeeded but DB update failed for org ${organizationId}:`, dbUpdateResponse.error);
        return NextResponse.json(dbUpdateResponse, { status: 500 });
    }    
    console.debug(`[API] Clerk update succeeded and DB update succeeded for org ${dbUpdateResponse}`, null, 2);

    // 2. Update on Clerk's side
    const client = await clerkClient();
    const updatedOrgOnClerk = await client.organizations.updateOrganization(organizationId, {
      name,
      slug,
    });
    
    // 3. Revalidate the path to reflect the changes in the UI
    revalidatePath('/', 'layout');

    return NextResponse.json(dbUpdateResponse);

  } catch (error: any) {
    console.error(`[API] Error in update organization:`, error);
    let errorMessage = "Failed to update organization";
    if (error.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].longMessage || errorMessage;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 