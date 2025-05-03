/**
 * Server-side API route to securely initiate Google authentication
 * This calls the web gateway with the API key, then redirects to Google
 */
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const webGatewayUrl = process.env.NEXT_PUBLIC_WEB_GATEWAY_URL;
  const webGatewayApiKey = process.env.WEB_GATEWAY_API_KEY;
    
  // Get the current origin for the return URL
  const origin = request.nextUrl.origin;
  
  if (!webGatewayUrl || !webGatewayApiKey) {
    console.error('[Web Gateway] Server configuration error (missing env variables)' + webGatewayUrl + ' ' + webGatewayApiKey?.substring(0,4));
    return NextResponse.json({ 
      success: false, 
      error: '[Web Gateway] Server configuration error (missing env variables)'
    }, { status: 500 });
  }
  
  try {
    // Construct full request URL for logging
    const requestUrl = `${webGatewayUrl.replace(/\/$/, '')}/oauth/google?origin=${encodeURIComponent(origin)}`;
    
    // Call the auth service via gateway with API key
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'x-web-gateway-api-key': webGatewayApiKey,
      },
      // Don't follow redirects automatically, we need to handle them manually
      redirect: 'manual',
    });
    
    // For OAuth flow, we expect a 302 redirect status code
    if (response.status >= 300 && response.status < 400) {
      // Get the redirect URL from the Location header
      const redirectUrl = response.headers.get('location');
      
      if (redirectUrl) {
        // Forward the redirect to the client - make sure this preserves cookies
        return NextResponse.redirect(redirectUrl, {
          // Preserve all headers from the response
          headers: Object.fromEntries(response.headers.entries())
        });
      }
    }
    
    if (!response.ok) {
      console.error('[Web Gateway] Failed to initiate Google auth' + response.status + ' ' + response.statusText);
      let errorDetail = '';
      try {
        const errorResponse = await response.text();
        errorDetail = errorResponse;
      } catch (e) {
        errorDetail = '[Web Gateway] Could not read error response';
      }
      
      return NextResponse.json({ 
        success: false, 
        error: '[Web Gateway] Failed to initiate Google authentication',
        status: response.status,
        statusText: response.statusText,
        detail: errorDetail
      }, { status: response.status });
    }
    
    // If we somehow get here without a redirect, try to get the URL from response
    console.error('[Web Gateway] Missing redirect from authentication service' + response.status + ' ' + response.statusText);
    const responseData = await response.json().catch(() => ({}));
    return NextResponse.json(responseData || { 
      success: false, 
      error: '[Web Gateway] Missing redirect from authentication service' 
    });
    
  } catch (error) {
    console.error('[Web Gateway] Error initiating Google auth:', error);
    return NextResponse.json({
      success: false,
      error: '[Web Gateway] Could not contact authentication service',
      detail: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}