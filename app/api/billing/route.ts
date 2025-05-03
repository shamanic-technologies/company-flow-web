/**
 * API Route: Billing
 * Returns user billing data including customer info, transactions and credit balance
 * Requires valid Bearer token
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '../utils/types';
import { getUserBillingData } from '../utils/web-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Billing API: Starting request processing');
    const webGatewayUrl = process.env.NEXT_PUBLIC_WEB_GATEWAY_URL;
    const webGatewayApiKey = process.env.WEB_GATEWAY_API_KEY;

    if (!webGatewayUrl || !webGatewayApiKey) {
      console.error('❌ Billing API: Missing required environment variables');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log(`🔄 Billing API: Using web gateway URL: ${webGatewayUrl}`);

    // Get auth token from request headers
    const token = getAuthToken(request);
    
    if (!token) {
      console.error('❌ Billing API: No auth token found in Authorization header');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch billing data using our utility function
    console.log('🔄 Billing API - Fetching user billing data');
    const data = await getUserBillingData(token);
    
    console.log('✅ Billing API - Billing data retrieved successfully');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Billing API - Error fetching billing data:', error);
    
    // Handle known errors with status code
    if (error && typeof error === 'object' && 'status' in error) {
      return NextResponse.json(
        { success: false, error: error.message || 'Service error' },
        { status: error.status }
      );
    }
    
    // Default error handling
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 