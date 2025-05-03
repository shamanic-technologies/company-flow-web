/**
 * Log Types
 * 
 * Type definitions for the logs functionality
 */

/**
 * API Log interface representing log data from the logging service
 */
export interface ApiLog {
  id: string;
  user_id: string;
  api_key: string;
  endpoint: string;
  method: string;
  status_code?: number;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  duration_ms?: number;
  timestamp: string;
  request_body?: any;
  response_body?: any;
  headers?: Record<string, string>;
  conversation_id?: string;
  price?: number;
  input_tokens?: number;
  output_tokens?: number;
} 