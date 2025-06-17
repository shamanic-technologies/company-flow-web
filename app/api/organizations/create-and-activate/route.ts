import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const authState = getAuth(req);

  const { userId, setActive } = authState;

  if (!userId || !setActive) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clerkClient();
    const membershipsResponse = await client.users.getOrganizationMembershipList({ userId });

    const personalOrgs = membershipsResponse.data.filter(
      (mem: any) => mem.organization.name.startsWith("Personal") && mem.organization.createdBy === userId
    );

    let newOrgName = "Personal";
    if (personalOrgs.length > 0) {
      const personalOrgNumbers = personalOrgs
        .map((mem: any) => {
          const name = mem.organization.name;
          if (name === "Personal") return 1;
          const match = name.match(/^Personal (\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0);
      
      const maxNumber = personalOrgNumbers.length > 0 ? Math.max(...personalOrgNumbers) : 0;
      newOrgName = `Personal ${maxNumber + 1}`;
    }

    console.log(`[API] Creating "${newOrgName}" organization for user ${userId}.`);
    const newOrg = await client.organizations.createOrganization({
      name: newOrgName,
      createdBy: userId,
    });
    console.log(`[API] Organization "${newOrgName}" created with ID ${newOrg.id}.`);

    await setActive({ organization: newOrg.id });
    
    return NextResponse.json({ success: true, organizationId: newOrg.id });

  } catch (error) {
    console.error(`[API] Error in createAndActivatePersonalOrg for user ${userId}:`, error);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
} 