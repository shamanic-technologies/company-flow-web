/**
 * API Route: /api/billing/create-checkout-session
 * 
 * Initiate a Stripe checkout flow for adding credits to a user account.
 * Uses the web gateway to communicate with the payment service.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Checkout Session API: Starting request processing');
    const webGatewayUrl = process.env.NEXT_PUBLIC_WEB_GATEWAY_URL;
    const webGatewayApiKey = process.env.WEB_GATEWAY_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!webGatewayUrl) {
      console.error('❌ Checkout Session API: Missing NEXT_PUBLIC_WEB_GATEWAY_URL environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!webGatewayApiKey) {
      console.error('❌ Checkout Session API: Missing WEB_GATEWAY_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!appUrl) {
      console.error('❌ Checkout Session API: Missing NEXT_PUBLIC_APP_URL environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get auth token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Checkout Session API: No valid token found in request');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);

    // Parse and validate request body
    let amount;
    try {
      const body = await request.json();
      amount = body.amount;
      
      // Validate required fields
      if (typeof amount !== 'number' || amount < 5) {
        throw new Error('amount must be a number >= 5');
      }
    } catch (err) {
      console.error('❌ Checkout Session API: Invalid request body', err);
      return NextResponse.json(
        { success: false, error: 'Invalid request body. amount must be a number >= 5' },
        { status: 400 }
      );
    }

    // Create a checkout session
    // The web gateway auth middleware will add the user ID to the request headers
    console.log(`🔄 Checkout Session API: Creating checkout session for amount $${amount}`);
    const checkoutResponse = await fetch(`${webGatewayUrl}/payment/payment/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': webGatewayApiKey
      },
      body: JSON.stringify({
        amount,
        successUrl: `${appUrl}/dashboard/budget?status=success`,
        cancelUrl: `${appUrl}/dashboard/budget?status=canceled`
      })
    });
    
    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text();
      console.error(`❌ Checkout Session API: Checkout creation failed with status ${checkoutResponse.status}`, errorText);
      
      if (checkoutResponse.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Failed to create checkout session: ${errorText}` },
        { status: checkoutResponse.status }
      );
    }
    
    const checkoutData = await checkoutResponse.json();
    if (!checkoutData.success || !checkoutData.data?.checkoutUrl) {
      console.error('❌ Checkout Session API: Invalid checkout data response', checkoutData);
      return NextResponse.json(
        { success: false, error: checkoutData.error || 'Invalid checkout data response' },
        { status: 500 }
      );
    }
    
    console.log('✅ Checkout Session API: Successfully created checkout session');
    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutData.data.checkoutUrl
    });
  } catch (error) {
    console.error('❌ Checkout Session API: Unhandled error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
} 