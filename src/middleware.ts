/**
 * Clerk Authentication Middleware
 * Protects routes based on Clerk authentication status.
 */
import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from 'next/server';

// Define routes that should be publicly accessible
// Includes home, auth callbacks, public API endpoints, and health checks
const isPublicRoute = createRouteMatcher([
  '/', // Home page
  '/sign-in(.*)', // Clerk Sign In page
  '/sign-up(.*)', // Clerk Sign Up page
  '/dashboard/settings/billing(.*)', // Stripe Billing Page
  '/api/auth(.*)', // Clerk auth routes (catch-all handles specifics)
  '/api/health', // Health check endpoint
  '/api/contact', // Contact form endpoint (assuming public)
  // Add any other specific public pages or API routes here
  // e.g., '/pricing', '/about', '/api/public-data'
]);

// Clerk middleware configuration
export default clerkMiddleware(async (auth, req) => {
  // If the route is public, allow the request to proceed.
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Get the complete auth state from the session
  const authState = await auth();

  // If the user is not authenticated, decide what to do based on the route type.
  if (!authState.userId) {
    const isApiRoute = req.nextUrl.pathname.startsWith('/api');
    if (isApiRoute) {
      // For API routes, return a 401 Unauthorized response. This fixes the 404 error.
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      // For page routes, redirect the user to the sign-in page.
      return authState.redirectToSignIn({ returnBackUrl: req.url });
    }
  }

  // Allow all other authenticated requests to proceed.
  // The client-side useOrganizations hook now handles ensuring a personal org exists.
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