'use client';

import { AgentsView } from '@/components/dashboard/agents/AgentsView';
import { AgentsSkeleton } from '@/components/dashboard/skeletons/skeletons';
import { useAgentContext } from '@/providers/AgentProvider';

export default function AgentsPage() {
  const { isPendingAgents } = useAgentContext();

  if (isPendingAgents) {
    return <AgentsSkeleton />;
  }

  return <AgentsView />;
} 