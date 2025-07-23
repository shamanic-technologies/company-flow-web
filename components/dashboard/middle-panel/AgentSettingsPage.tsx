import { Agent } from "@agent-base/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';
import MemoryPanel from "./MemoryPanel";

interface AgentSettingsPageProps {
  agent: Agent;
}

const AgentInfoCard = ({ agent }: { agent: Agent }) => {
  const getAgentAge = (createdAt?: string) => {
    if (!createdAt) return 'Unknown';
    try {
      const creationDate = new Date(createdAt);
      return formatDistanceToNow(creationDate, { addSuffix: false });
    } catch (e) {
      console.error("Error calculating agent age:", e);
      return 'Unknown';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16 border-2 border-blue-600">
            {agent.profilePicture.includes('://') ? (
              <AvatarImage src={agent.profilePicture} alt={`${agent.firstName} ${agent.lastName}`} />
            ) : (
              <AvatarFallback className="text-lg bg-blue-900 text-blue-200">
                {agent.profilePicture || agent.firstName.charAt(0) + agent.lastName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-100">
              {agent.firstName} {agent.lastName}
            </h3>
            <p className="text-sm text-gray-400">{agent.jobTitle}</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div>
                <span className="block text-gray-500">Age</span>
                <span>{getAgentAge(agent.createdAt.toString())}</span>
              </div>
              <div>
                <span className="block text-gray-500">Gender</span>
                <span className="capitalize">{agent.gender}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AgentSettingsPage({ agent }: AgentSettingsPageProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-gray-200">
          <span className="text-gray-400">{agent.firstName} {agent.lastName}</span> &gt; Settings
        </h2>
      </div>
      <div className="flex-grow p-4">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="input">Input</TabsTrigger>
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>
          <div className="flex-grow mt-4 overflow-y-auto">
            <TabsContent value="overview">
              <AgentInfoCard agent={agent} />
            </TabsContent>
            <TabsContent value="triggers">
              <p>Triggers content goes here.</p>
            </TabsContent>
            <TabsContent value="input">
              <p>Input content goes here.</p>
            </TabsContent>
            <TabsContent value="output">
              <p>Output content goes here.</p>
            </TabsContent>
            <TabsContent value="instructions" className="h-full">
              <MemoryPanel selectedAgent={agent} />
            </TabsContent>
            <TabsContent value="tools">
              <p>Tools content goes here.</p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 