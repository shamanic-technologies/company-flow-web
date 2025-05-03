/**
 * API Route: /api/billing/auto-recharge
 * 
 * Updates user's auto-recharge settings via the payment service.
 * Uses the web gateway middleware for authentication and user identification.
 */
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Auto-Recharge API: Starting request processing');
    const webGatewayUrl = process.env.NEXT_PUBLIC_WEB_GATEWAY_URL;
    const webGatewayApiKey = process.env.WEB_GATEWAY_API_KEY;

    if (!webGatewayUrl) {
      console.error('❌ Auto-Recharge API: Missing NEXT_PUBLIC_WEB_GATEWAY_URL environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!webGatewayApiKey) {
      console.error('❌ Auto-Recharge API: Missing WEB_GATEWAY_API_KEY environment variable');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Get auth token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Auto-Recharge API: No valid token found in request');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);

    // Parse and validate request body
    let settings;
    try {
      settings = await request.json();
      
      // Validate required fields
      if (typeof settings.enabled !== 'boolean') {
        throw new Error('enabled field must be a boolean');
      }
      
      if (settings.enabled) {
        if (typeof settings.thresholdAmount !== 'number' || settings.thresholdAmount < 1) {
          throw new Error('thresholdAmount must be a number >= 1');
        }
        
        if (typeof settings.rechargeAmount !== 'number' || settings.rechargeAmount < 10) {
          throw new Error('rechargeAmount must be a number >= 10');
        }
      }
    } catch (err) {
      console.error('❌ Auto-Recharge API: Invalid request body', err);
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Update auto-recharge settings directly
    // The web gateway middleware will add the user ID from the token to headers,
    // and the payment service will use that to look up the customer
    console.log('🔄 Auto-Recharge API: Updating auto-recharge settings');
    const updateResponse = await fetch(`${webGatewayUrl}/payment/payment/auto-recharge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'x-api-key': webGatewayApiKey
      },
      body: JSON.stringify(settings)
    });
    
    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`❌ Auto-Recharge API: Update failed with status ${updateResponse.status}`, errorText);
      
      if (updateResponse.status === 401) {
        return NextResponse.json(
          { success: false, error: 'Authentication failed' },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { success: false, error: `Failed to update auto-recharge settings: ${errorText}` },
        { status: updateResponse.status }
      );
    }
    
    const updateData = await updateResponse.json();
    if (!updateData.success) {
      console.error('❌ Auto-Recharge API: Update response indicates failure', updateData);
      return NextResponse.json(
        { success: false, error: updateData.error || 'Failed to update auto-recharge settings' },
        { status: 500 }
      );
    }
    
    console.log('✅ Auto-Recharge API: Successfully updated auto-recharge settings');
    return NextResponse.json({
      success: true,
      data: updateData.data
    });
  } catch (error) {
    console.error('❌ Auto-Recharge API: Unhandled error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to update auto-recharge settings: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
} 