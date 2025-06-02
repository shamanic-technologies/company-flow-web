/**
 * Clerk Authentication Middleware
 * Protects routes based on Clerk authentication status.
 */
import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from 'next/server';

// Define routes that should be publicly accessible
// Includes home, auth callbacks, public API endpoints, and health checks
const isPublicRoute = createRouteMatcher([
  '/', // Home page
  '/api/auth(.*)', // Clerk auth routes (catch-all handles specifics)
  '/api/health', // Health check endpoint
  '/api/contact', // Contact form endpoint (assuming public)
  // Add any other specific public pages or API routes here
  // e.g., '/pricing', '/about', '/api/public-data'
]);

// Define routes that should always be protected
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', // All dashboard routes
  // Add other routes that strictly require authentication
]);

// Clerk middleware configuration
export default clerkMiddleware(async (auth, req) => {
  // Protect routes that are not public
  if (!isPublicRoute(req)) {
    // Call protect() directly on the auth object passed to the callback
    const { userId, orgId } = await auth.protect();

    if (userId) {
      try {
        const client = await clerkClient(); // Corrected: Call clerkClient() to get the instance

        const orgName = "Personal";
        let personalOrgId: string | null = null; // To store the ID of the personal org
        let personalOrgExistsAndWasCreatedByUser = false;

        const membershipsResponse = await client.users.getOrganizationMembershipList({ userId });
        const organizationMemberships = membershipsResponse.data;

        for (const membership of organizationMemberships) {
          if (membership.organization &&
              membership.organization.name === orgName &&
              membership.organization.createdBy === userId) {
            personalOrgId = membership.organization.id;
            personalOrgExistsAndWasCreatedByUser = true;
            console.log(`[Middleware] "Personal" organization already exists for user ${userId}. Org ID: ${personalOrgId}`);
            break;
          }
        }

        if (!personalOrgExistsAndWasCreatedByUser) {
          console.log(`[Middleware] "Personal" organization not found for user ${userId}. Creating it...`);
          const newOrg = await client.organizations.createOrganization({
            name: orgName,
            createdBy: userId,
          });
          personalOrgId = newOrg.id;
          console.log(`[Middleware] "Personal" organization created for user ${userId}. New Org ID: ${personalOrgId}`);
        }
        
        // Note: Activating the organization is typically handled client-side in the DashboardContext
        // or by Clerk's default behavior when a user has only one org or based on last active.
        // The middleware's primary role here is to ensure the org exists.

      } catch (error) {
        console.error(`[Middleware] Error ensuring "Personal" organization for user ${userId} for path ${req.nextUrl.pathname}:`, error);
      }
    }
  }
  return NextResponse.next();
});

// Configuration for the Next.js middleware matcher
export const config = {
  matcher: [
    // Skip Next.js internals, static files, and common image formats
    '/((?!.+\\.[\\w]+$|_next).*)', // Base matcher: Run on most paths
    '/', // Ensure the root path is matched
    '/(api|trpc)(.*)', // Run on all API routes
  ],
}; 