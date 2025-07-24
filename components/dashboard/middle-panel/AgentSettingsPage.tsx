import { Agent } from "@agent-base/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "@/components/agent-settings/OverviewTab";
import TriggersTab from "@/components/agent-settings/TriggersTab";
import InputTab from "@/components/agent-settings/InputTab";
import OutputTab from "@/components/agent-settings/OutputTab";
import InstructionsTab from "@/components/agent-settings/InstructionsTab";
import ToolsTab from "@/components/agent-settings/ToolsTab";
import Link from "next/link";

interface AgentSettingsPageProps {
  agent: Agent;
  isPanel?: boolean;
}

export default function AgentSettingsPage({ agent, isPanel = false }: AgentSettingsPageProps) {
  return (
    <div className={`h-full overflow-y-auto ${isPanel ? 'p-0' : 'p-6'}`}>
       <h1 className="text-2xl font-bold">
        <Link href="/dashboard/agents">
          <span
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            Agents
          </span>
        </Link>
        <span className="text-muted-foreground mx-2">&gt;</span>
        <span>{agent.firstName} {agent.lastName}</span>
      </h1>
      <p className="text-muted-foreground mb-4">
        Manage your agent's settings and configuration.
      </p>
      <div className="flex-grow">
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
              <OverviewTab agent={agent} />
            </TabsContent>
            <TabsContent value="triggers">
              <TriggersTab />
            </TabsContent>
            <TabsContent value="input">
              <InputTab />
            </TabsContent>
            <TabsContent value="output">
              <OutputTab />
            </TabsContent>
            <TabsContent value="instructions" className="h-full">
              <InstructionsTab agent={agent} />
            </TabsContent>
            <TabsContent value="tools">
              <ToolsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 