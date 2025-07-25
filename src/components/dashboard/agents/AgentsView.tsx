"use client"

import { Agent } from "@agent-base/types"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { columns } from "@/components/dashboard/agents/columns"
import { DataTable } from "@/components/dashboard/agents/data-table"
import { useAgentContext } from "@/providers/AgentProvider"
import { useViewContext } from "@/providers/ViewProvider"

export function AgentsView() {
  const { 
    agents, 
    isLoadingAgents, 
    setSelectedAgentForSettings, 
  } = useAgentContext()
  const { setIsRightPanelOpen, setIsCreatingAgent } = useViewContext()

  const handleRowClick = (agent: Agent) => {
    setSelectedAgentForSettings(agent);
    setIsRightPanelOpen(true);
  }

  // The parent layout now handles the skeleton loading state.
  // This internal loading state is no longer needed.
  /*
  if (isLoadingAgents) {
    return <div>Loading agents...</div>
  }
  */

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-muted-foreground">
            Here is a list of all the agents in your organization.
          </p>
        </div>
        <Button
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setIsCreatingAgent(true);
            setSelectedAgentForSettings(null);
            setIsRightPanelOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
      </div>
      <DataTable columns={columns} data={agents} onRowClick={handleRowClick} />
    </div>
  )
} 