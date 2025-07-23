import { Agent } from "@agent-base/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InstructionsTabProps {
  agent: Agent;
}

export default function InstructionsTab({ agent }: InstructionsTabProps) {
  return (
    <ScrollArea className="h-full">
      {agent?.memory ? (
        <pre className="text-xs bg-gray-900/50 p-3 rounded overflow-auto h-full text-gray-300 font-mono whitespace-pre-wrap">
          {(() => {
            try {
              const memoryObject = typeof agent.memory === 'string' 
                ? JSON.parse(agent.memory)
                : agent.memory;
              return JSON.stringify(memoryObject, null, 2); 
            } catch (e) {
              console.warn("Agent memory is not valid JSON, displaying as raw string.");
              return agent.memory;
            }
          })()}
        </pre>
      ) : (
        <div className="text-center text-gray-500 py-4">No memory data available for this agent.</div>
      )}
    </ScrollArea>
  );
} 