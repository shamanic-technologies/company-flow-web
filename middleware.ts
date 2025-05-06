/**
 * Authentication Middleware
 * Redirects unauthenticated users to the auth service
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from 'next/server';

/**
 * Protected paths that require authentication
 */
const PROTECTED_PATHS = ['/chat', '/dashboard'];

/**
 * Public paths that don't need to check authentication
 */
const PUBLIC_PATHS = [
  '/',
  '/auth/callback',
  '/api',
  '/api/auth/callback',
  '/api/auth/google-auth',
  '/health',
];

/**
 * Check if the route is public
 * @param req The incoming request
 */
function isPublicRoute(req: NextRequest) {
  const { pathname } = req.nextUrl;
  return PUBLIC_PATHS.some(path => pathname.startsWith(path)) || 
         pathname.match(/\.(js|css|ico|png|jpg|svg|webp)$/);
}

// Define public routes using createRouteMatcher for clarity and consistency
const isPublicRouteMatcher = createRouteMatcher([
  '/', 
  '/about', 
  '/pricing', 
  '/terms', 
  '/privacy', 
  '/api/webhooks(.*)', 
  '/api/health', 
  '/api/contact',
  // Clerk auth routes are implicitly public
  '/sign-in(.*)', 
  '/sign-up(.*)'
]);

/**
 * Middleware function to handle authentication on each request
 * @param req The incoming request
 */
export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Check if the route is public
  if (isPublicRouteMatcher(req)) {
    return; // Do not protect public routes
  }

  // For all other routes, check if the user is authenticated
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    // If user is not signed in, redirect them to the sign-in page
    return redirectToSignIn();
  }

  // If user is signed in, allow the request to proceed
  // (Clerk handles session validation automatically)
  // You can add role/permission checks here if needed using protect() or has()
  // Example: 
  // const { has } = await auth();
  // if (!has({ role: 'admin' })) { 
  //   // Handle unauthorized user, e.g., redirect or return 403
  // }
});

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (e.g., images, fonts)
     * Feel free to modify this pattern to include more exceptions.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)', // Exclude API routes from this general client-side matcher
    // Match root path explicitly if not covered by the above
    '/', 
    // Ensure API routes are matched specifically if needed (Clerk handles most API auth internally)
    // If you have specific API routes to protect, you might add them here or handle auth within the route handler using auth()
    // '/(api|trpc)(.*)', 
  ],
}; 