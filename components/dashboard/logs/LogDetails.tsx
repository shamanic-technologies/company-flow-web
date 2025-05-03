/**
 * Log Details Component
 * 
 * Displays expanded details for a log entry
 */
import { 
  Server, 
  Globe, 
  User, 
  Key, 
  Clock, 
  Terminal 
} from 'lucide-react';
import { format } from 'date-fns';
import { ApiLog } from './types';

interface LogDetailsProps {
  log: ApiLog;
}

export function LogDetails({ log }: LogDetailsProps) {
  // Format JSON for display
  const formatJson = (data: any) => {
    try {
      if (typeof data === 'string') {
        return JSON.stringify(JSON.parse(data), null, 2);
      }
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  };
  
  const timestamp = new Date(log.timestamp);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1">
            <Server size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="text-gray-400 text-xs mb-1">Endpoint</div>
            <div className="font-mono text-xs break-all">{log.endpoint}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1">
            <Globe size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="text-gray-400 text-xs mb-1">IP Address</div>
            <div className="font-mono text-xs">{log.ip_address}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1">
            <User size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="text-gray-400 text-xs mb-1">User ID</div>
            <div className="font-mono text-xs">{log.user_id}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1">
            <Key size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="text-gray-400 text-xs mb-1">API Key</div>
            <div className="font-mono text-xs">{log.api_key}</div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-1">
            <Clock size={16} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="text-gray-400 text-xs mb-1">Timestamp</div>
            <div className="font-mono text-xs">{format(timestamp, 'PPpp')}</div>
          </div>
        </div>

        {log.conversation_id && (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <Terminal size={16} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-xs mb-1">Conversation ID</div>
              <div className="font-mono text-xs break-all">{log.conversation_id}</div>
            </div>
          </div>
        )}
        
        {log.price !== undefined && (
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 mt-1">
              <Terminal size={16} className="text-gray-400" />
            </div>
            <div className="flex-1">
              <div className="text-gray-400 text-xs mb-1">Price</div>
              <div className="font-mono text-xs">${Number(log.price).toFixed(4)}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {log.request_body && (
          <div>
            <div className="text-gray-400 text-xs mb-1">Request Body</div>
            <pre className="bg-gray-900 p-2 rounded text-xs overflow-auto max-h-32">
              {formatJson(log.request_body)}
            </pre>
          </div>
        )}
        
        {log.response_body && (
          <div>
            <div className="text-gray-400 text-xs mb-1">Response Body</div>
            <pre className="bg-gray-900 p-2 rounded text-xs overflow-auto max-h-32">
              {formatJson(log.response_body)}
            </pre>
          </div>
        )}
        
        {log.input_tokens !== undefined && log.output_tokens !== undefined && (
          <div>
            <div className="text-gray-400 text-xs mb-1">Token Usage</div>
            <div className="font-mono text-xs">
              Input: {log.input_tokens} | Output: {log.output_tokens} | 
              Total: {log.input_tokens + log.output_tokens}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 