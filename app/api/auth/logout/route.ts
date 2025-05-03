/**
 * Server-side API route to securely handle logout
 * Clears auth token from localStorage and invalidates session
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const webGatewayUrl = process.env.NEXT_PUBLIC_WEB_GATEWAY_URL;
  const webGatewayApiKey = process.env.WEB_GATEWAY_API_KEY;
  
  if (!webGatewayUrl || !webGatewayApiKey) {
    console.error('[Web Gateway] Server configuration error (missing env variables)' + webGatewayUrl + ' ' + webGatewayApiKey?.substring(0,4));
    throw new Error('Missing required environment variables');
  }
  
  try {
    // Get the auth token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    
    // Prepare headers for the request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-web-gateway-api-key': webGatewayApiKey,
    };
    
    // Only add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Call auth service to invalidate token
    await fetch(`${webGatewayUrl}/auth/logout`, {
      method: 'POST',
      headers,
    });
    
    // Create HTML response that clears localStorage and redirects to home
    const html = `
      <html>
        <body>
          <script>
            localStorage.removeItem('auth-token');
            window.location.href = '/';
          </script>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('[Web Gateway] Error in logout route:', error);
    // Create HTML response that clears localStorage even if backend call fails
    const html = `
      <html>
        <body>
          <script>
            localStorage.removeItem('auth-token');
            window.location.href = '/?error=logout_failed';
          </script>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
} 