/**
 * useLogs Hook
 * 
 * Custom hook for fetching and managing API logs
 */
import { useState, useEffect } from 'react';
import { ApiLog } from './types';

export function useLogs(isUserLoading: boolean) {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch logs from API
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setError(null);
        
        // Wait for user data to be loaded
        if (isUserLoading) {
          return;
        }

        // Get auth token from localStorage
        const token = localStorage.getItem('auth-token');
        
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/logs', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch logs: ${response.statusText}`);
        }
        
        // Added debug logging to inspect the exact response
        const data = await response.json();
        console.log('API response:', data);
        
        // Extract logs array from response, handling different possible formats
        let logsArray: ApiLog[] = [];
        
        if (Array.isArray(data)) {
          // If the response is directly an array
          console.log('Response is an array with', data.length, 'items');
          logsArray = data;
        } else if (data.data && Array.isArray(data.data)) {
          // If the response has a data property that is an array
          console.log('Response has data array with', data.data.length, 'items');
          logsArray = data.data;
        } else if (data.success && data.data && Array.isArray(data.data)) {
          // If the response has success flag and data property
          console.log('Response has success flag and data array with', data.data.length, 'items');
          logsArray = data.data;
        } else if (!data || Object.keys(data).length === 0) {
          // Handle empty object or null/undefined response
          console.log('API returned an empty response, using empty logs array');
          logsArray = [];
        } else {
          // For any other unexpected format, log it but don't throw an error
          // Just use an empty array instead
          console.warn('Unexpected logs data format:', data);
          console.log('Using empty logs array instead of throwing an error');
          logsArray = [];
        }

        // Sort logs by timestamp in descending order (newest first)
        const sortedLogs = logsArray.sort((a: ApiLog, b: ApiLog) => {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });

        setLogs(sortedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
    
    // Refresh logs every minute
    const interval = setInterval(fetchLogs, 60000);
    return () => clearInterval(interval);
  }, [isUserLoading]);

  return { logs, loading, error };
} 