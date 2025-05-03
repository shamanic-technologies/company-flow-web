/**
 * API Route: Logs
 * Returns user logs from logging service
 * Requires valid Bearer token
 */
import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '../utils/types';
import { getUserLogs } from '../utils/web-client';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Logs API - Starting request');
    
    // Get auth token from request headers
    const token = getAuthToken(request);
    
    if (!token) {
      console.error('❌ Logs API - No auth token found in Authorization header');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch logs using our utility function
    console.log('🔄 Logs API - Fetching user logs from logging service');
    const data = await getUserLogs(token);
    
    console.log('✅ Logs API - Logs retrieved successfully');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Logs API - Error fetching logs:', error);
    
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