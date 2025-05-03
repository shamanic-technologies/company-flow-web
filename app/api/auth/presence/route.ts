/**
 * Server-side API route to securely handle user presence updates
 * This allows us to use the API key without exposing it to the client
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const webGatewayUrl = process.env.NEXT_PUBLIC_WEB_GATEWAY_URL;
  const gatewayApiKey = process.env.GATEWAY_API_KEY;
  
  // Get auth token from Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  
  if (!token) {
    console.error('[API /auth/presence] No authentication token provided');
    return NextResponse.json({ success: false, error: 'No authentication token provided' }, { status: 401 });
  }
  
  // Get the request body
  const body = await request.json();
  
  try {
    const response = await fetch(`${webGatewayUrl}/auth/presence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-web-gateway-api-key': gatewayApiKey || '',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    // Return the response from the web gateway
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating user presence:', error);
    return NextResponse.json({ success: false, error: 'Failed to update presence' }, { status: 500 });
  }
} 