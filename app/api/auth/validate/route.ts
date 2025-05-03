/**
 * Server-side API route to securely validate authentication
 * Uses Bearer token authentication exclusively
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const webGatewayUrl = process.env.NEXT_PUBLIC_WEB_GATEWAY_URL;
  const webGatewayApiKey = process.env.WEB_GATEWAY_API_KEY;
  
  if (!webGatewayUrl || !webGatewayApiKey) {
    throw new Error('Missing required environment variables: WEB_GATEWAY_URL or WEB_GATEWAY_API_KEY');
  }
  
  // Get auth token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[API /auth/validate] No valid Authorization header found' + authHeader);
    return NextResponse.json({ success: false, error: 'No valid Authorization header found' }, { status: 401 });
  }
  
  // Extract the token from the Bearer authorization header
  const authToken = authHeader.split(' ')[1];
  if (!authToken) {
    console.error('[API /auth/validate] No auth token found' + authToken);
    return NextResponse.json({ success: false, error: 'No auth token found' }, { status: 401 });
  }
  
  try {
    const response = await fetch(`${webGatewayUrl}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-web-gateway-api-key': webGatewayApiKey,
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({})
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Invalid response from auth service' }));
      console.error('[API /auth/validate] Authentication failed' + response.status + ' ' + response.statusText);
      return NextResponse.json(
        { success: false, error: errorData.error || 'Authentication failed' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('[API /auth/validate] Authentication failed' + data.error);
      return NextResponse.json(data, { status: 401 });
    }
    
    // Return the response from the web gateway
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API /auth/validate] Error validating authentication:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication validation failed' }, 
      { status: 500 }
    );
  }
} 