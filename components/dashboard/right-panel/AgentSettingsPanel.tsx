'use client';

import { useState } from 'react';
import { Agent, Conversation } from '@agent-base/types';
import AgentSettings from '../agents/agent-settings/AgentSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useConversationsQuery } from '@/hooks/useConversationsQuery';
import { Skeleton } from '@/components/ui/skeleton';
import ConversationViewer from './ConversationViewer';
import { useUserContext } from '@/providers/UserProvider';

interface AgentSettingsPanelProps {
    agent: Agent;
}

function ExecutionsList({ agentId, onConversationSelect }: { agentId: string, onConversationSelect: (conversation: Conversation) => void }) {
    const { conversations, isLoadingConversations, conversationError } = useConversationsQuery(agentId);

    if (isLoadingConversations) {
        return (
            <div className="space-y-2 p-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
                <Skeleton className="h-6 w-2/3" />
            </div>
        );
    }

    if (conversationError) {
        return <div className="p-4 text-sm text-red-500">Error: {conversationError.message}</div>;
    }

    if (conversations.length === 0) {
        return <div className="p-4 text-sm text-muted-foreground">No executions found for this agent.</div>;
    }

    return (
        <ul className="space-y-2 p-4">
            {conversations.map((convo: Conversation) => (
                <li 
                  key={convo.conversationId} 
                  className="text-xs p-2 border rounded-md bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onConversationSelect(convo)}
                >
                    ID: {convo.conversationId}
                </li>
            ))}
        </ul>
    );
}

export default function AgentSettingsPanel({ agent }: AgentSettingsPanelProps) {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const { getClerkUserInitials } = useUserContext();

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">{agent.firstName} {agent.lastName}</h2>
                <p className="text-sm text-muted-foreground">{agent.jobTitle}</p>
            </div>
            <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="executions">Executions</TabsTrigger>
                    </TabsList>
                </div>
                <TabsContent value="overview" className="flex-1 overflow-y-auto">
                    <AgentSettings agent={agent} isPanel={true} />
                </TabsContent>
                <TabsContent value="executions" className="flex-1 overflow-y-auto">
                    <ExecutionsList 
                      agentId={agent.id} 
                      onConversationSelect={setSelectedConversation} 
                    />
                </TabsContent>
            </Tabs>
            <ConversationViewer
                isOpen={!!selectedConversation}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        setSelectedConversation(null);
                    }
                }}
                conversation={selectedConversation}
                agent={agent}
                userInitials={getClerkUserInitials()}
            />
        </div>
    );
} 