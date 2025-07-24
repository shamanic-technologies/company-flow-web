'use client';

import { Agent } from '@agent-base/types';
import AgentSettingsPage from '../middle-panel/AgentSettingsPage';

interface AgentSettingsPanelProps {
    agent: Agent;
}

export default function AgentSettingsPanel({ agent }: AgentSettingsPanelProps) {
    return (
        <div className="h-full overflow-y-auto">
            <AgentSettingsPage agent={agent} isPanel={true} />
        </div>
    );
} 