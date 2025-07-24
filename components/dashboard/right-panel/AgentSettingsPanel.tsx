'use client';

import { Agent } from '@agent-base/types';
import AgentSettings from '../agents/agent-settings/AgentSettings';

interface AgentSettingsPanelProps {
    agent: Agent;
}

export default function AgentSettingsPanel({ agent }: AgentSettingsPanelProps) {
    return (
        <div className="h-full overflow-y-auto">
            <AgentSettings agent={agent} isPanel={true} />
        </div>
    );
} 