/**
 * API Route: Keys
 * Securely manages API keys via web gateway
 * Gets user ID from auth token for security
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '../utils/types';
import { getUserKeys, getOrCreateKeyByName } from '../utils/web-client';

export async function GET(request: NextRequest) {
  try {
    
    // Get auth token from request headers
    const token = getAuthToken(request);
    
    if (!token) {
      console.error('❌ Keys API - No auth token found in Authorization header');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch keys using our utility function
    const data = await getUserKeys(token);
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Keys API - Error fetching keys:', error);
    
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get auth token from request headers
    const token = getAuthToken(request);
    
    if (!token) {
      console.error('❌ Keys API POST - No auth token found in Authorization header');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Create key using our utility function
    // Only pass the name from the request body
    const data = await getOrCreateKeyByName(token, body.name);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Keys API POST - Error creating key:', error);
    
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