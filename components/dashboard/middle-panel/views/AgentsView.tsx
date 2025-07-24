"use client"

import { Agent } from "@agent-base/types"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { columns } from "@/components/dashboard/agents-list-page/columns"
import { DataTable } from "@/components/dashboard/agents-list-page/data-table"
import { useAgentContext } from "../../context/AgentProvider"
import { useViewContext } from "../../context/ViewProvider"

export function AgentsView() {
  const { agents, isLoadingAgents, selectAgentId } = useAgentContext()
  const { setActiveView, setIsRightPanelOpen } = useViewContext()

  const handleRowClick = (agent: Agent) => {
    if (selectAgentId) {
      selectAgentId(agent.id)
    }
    setActiveView("memory")
  }

  if (isLoadingAgents) {
    return <div>Loading agents...</div>
  }

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
          onClick={() => setIsRightPanelOpen(true)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Agent
        </Button>
      </div>
      <DataTable columns={columns} data={agents} onRowClick={handleRowClick} />
    </div>
  )
} 