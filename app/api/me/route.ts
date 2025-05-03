/**
 * API Route: Me
 * Returns authenticated user data
 * Requires valid Bearer token
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '../utils/types';
import { getPlatformUserFromToken } from '../utils/web-client';
import { ServiceResponse } from '@agent-base/types';
import { PlatformUser } from '@agent-base/types';

export async function GET(request: NextRequest) {
  try {
    
    // Get auth token from request headers
    const token = getAuthToken(request);
    
    if (!token) {
      console.error('❌ User API - No auth token found in Authorization header');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user data using our utility function
    const dataResponse : ServiceResponse<PlatformUser> = await getPlatformUserFromToken(token);
    
    return NextResponse.json(dataResponse);
  } catch (error: any) {
    console.error('❌ User API - Error fetching user data:', error);
    
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