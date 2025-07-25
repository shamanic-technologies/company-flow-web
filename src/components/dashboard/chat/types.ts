/**
 * Chat Component Types
 * 
 * Shared type definitions for Chat components
 */

export type ToolInvocation = {
  toolName: string;
  state: 'partial-call' | 'call' | 'result';
  result?: any;
  args?: Record<string, any>;
  toolCallId: string;
};

export type MessagePart = {
  type: string;
  text?: string;
  toolInvocation?: ToolInvocation;
  details?: Array<{type: string; text?: string}>;
  source?: {url: string; title?: string};
  mimeType?: string;
  data?: string;
};

export interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
    parts?: MessagePart[];
  };
  userInitials: string;
}
