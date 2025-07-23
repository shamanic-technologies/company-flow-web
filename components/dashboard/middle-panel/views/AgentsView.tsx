"use client"

import { Agent } from "@agent-base/types"
import { useRouter } from "next/navigation"

import { columns } from "@/components/dashboard/agents-list-page/columns"
import { DataTable } from "@/components/dashboard/agents-list-page/data-table"
import { useAgentContext } from "../../context/AgentProvider"
import { useViewContext } from "../../context/ViewProvider"

export function AgentsView() {
  const { agents, isLoadingAgents, selectAgentId } = useAgentContext()
  const { setActiveView } = useViewContext()

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
      <h1 className="text-2xl font-bold">Agents</h1>
      <p className="text-muted-foreground mb-4">
        Here is a list of all the agents in your organization.
      </p>
      <DataTable columns={columns} data={agents} onRowClick={handleRowClick} />
    </div>
  )
} 