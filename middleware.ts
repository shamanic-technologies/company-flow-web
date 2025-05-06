/**
 * Clerk Authentication Middleware
 * Protects routes based on Clerk authentication status.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
export default clerkMiddleware((auth, req) => {
  // Protect routes that are not public
  if (!isPublicRoute(req)) {
    // Call protect() directly on the auth object passed to the callback
    auth.protect();
  }

  // Example: Apply additional protection/logic for specific routes if needed
  // if (isProtectedRoute(req)) {
  //   // You could add role/permission checks here if necessary
  //   // await auth().protect((has) => has({ role: 'admin' }));
  // }
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