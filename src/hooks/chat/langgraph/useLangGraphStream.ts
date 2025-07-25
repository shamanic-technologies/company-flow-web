import { useStream } from '@langchain/langgraph-sdk/react';
import type { Message } from "@langchain/langgraph-sdk";
import { useState, useCallback } from 'react';

interface UseLangGraphStreamOptions {
  conversationId: string | null;
  // agentId is no longer needed as we are using a static graph ID.
}

export function useLangGraphStream({ conversationId }: UseLangGraphStreamOptions) {
  
  // The LangGraph SDK requires an absolute URL. This should point to the LangGraph
  // server, which is running on port 8080 in the agent-service.
  // TODO: Use an environment variable for the API URL in production.
  const apiUrl = 'http://localhost:8080';

  const { messages, submit, isLoading, error } = useStream<{ messages: Message[] }>({
    apiUrl: apiUrl, 
    // The assistantId must match the graph ID registered on the server.
    // In our agent-service, this is hardcoded as 'agent'.
    assistantId: 'agent',
    // For new conversations, conversationId is null, so we pass null for threadId.
    // The thread will be created on the first submission.
    threadId: conversationId,
    messagesKey: "messages",
  });

  const [input, setInput] = useState('');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messagePayload = { messages: [{ type: 'human' as const, content: input }] };
    
    // If the conversationId exists, we are adding to an existing thread.
    // Otherwise, we are creating a new thread with the provided conversationId.
    if (conversationId) {
      submit(messagePayload, { threadId: conversationId });
    } else {
      // This case handles creating a brand new thread without a pre-existing ID.
      // LangGraph will create a new thread and the ID will be available in the stream events.
      submit(messagePayload);
    }

    setInput('');
  }, [input, submit, conversationId]);
  
  return {
    messages,
    input,
    isLoading,
    error,
    handleInputChange,
    handleSubmit,
  };
} 