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
  '/sign-in(.*)', // Clerk Sign In page
  '/sign-up(.*)', // Clerk Sign Up page
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
  // Get the initial auth state by calling and awaiting auth()
  // Note: This call to auth() is for read-only purposes to get the state.
  // The `auth.protect()` call later is what enforces authentication.
  const initialAuthState = await auth();

  console.log(`[Middleware] Request URL: ${req.nextUrl.pathname}${req.nextUrl.search}`);
  console.log(`[Middleware] Is public route? ${isPublicRoute(req)}`);
  console.log(`[Middleware] Auth state before protect: userId=${initialAuthState.userId}, sessionId=${initialAuthState.sessionId}, orgId=${initialAuthState.orgId}, actor=${JSON.stringify(initialAuthState.actor)}, claims=${JSON.stringify(initialAuthState.sessionClaims)}`);

  // Protect routes that are not public
  if (!isPublicRoute(req)) {
    console.log(`[Middleware] Path ${req.nextUrl.pathname} is NOT public. Attempting to protect.`);
    try {
      // Call protect() on the auth object. If it redirects, this won't proceed further for this request.
      // After protect() resolves successfully, auth.userId etc. on the `auth` object itself will be populated.
      const { userId, orgId, sessionClaims, actor } = await auth.protect();
      // If protect() does not redirect, it means the user is authenticated.
      console.log(`[Middleware] Path ${req.nextUrl.pathname} - Successfully protected. userId: ${userId}, orgId: ${orgId}, actor: ${JSON.stringify(actor)}, claims: ${JSON.stringify(sessionClaims)} (from protect result)`);

      if (userId) { // This userId is from the successfully resolved protect()
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
    } catch (error) {
      console.error(`[Middleware] Error protecting route ${req.nextUrl.pathname}:`, error);
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