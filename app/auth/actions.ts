'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Server action to set the auth token cookie
 */
export async function setAuthTokenCookie(token: string) {
  if (!token) {
    return { success: false, error: 'No token provided' };
  }

  try {
    // Get the cookie store by awaiting cookies() - important in Next.js 15
    const cookieStore = await cookies();
    
    // Set the auth token cookie with secure options
    cookieStore.set({
      name: 'auth-token',
      value: token,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'strict', // Use strict for Next.js 15 compatibility
      secure: process.env.NODE_ENV === 'production', // Only in production
      httpOnly: true, // Prevent JavaScript access
    });
    
    // Verify the cookie was set
    const authCookie = cookieStore.get('auth-token');
    
    if (authCookie) {
      return { success: true };
    } else {
      console.error('Failed to set auth cookie');
      return { 
        success: false, 
        error: 'Failed to set cookie',
        fallbackUrl: `/dashboard?directAuth=${encodeURIComponent(token)}`
      };
    }
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return { success: false, error: String(error) };
  }
} 