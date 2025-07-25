'use client';

import { useState } from 'react';
import { Agent, Conversation } from '@agent-base/types';
import AgentSettings from '../../agents/agent-settings/AgentSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLangGraphConversationsQuery } from '@/hooks/langgraph/useLangGraphConversationsQuery';
import { Skeleton } from '@/components/ui/skeleton';
import LangGraphConversationViewer from './LangGraphConversationViewer';
import { useUserContext } from '@/providers/UserProvider';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquareText } from 'lucide-react';

interface LangGraphAgentSettingsPanelProps {
    agent: Agent;
}

function ExecutionsList({ agentId, onConversationSelect }: { agentId: string, onConversationSelect: (conversation: Conversation) => void }) {
    const { conversations, isLoadingConversations, conversationError } = useLangGraphConversationsQuery(agentId);

    if (isLoadingConversations) {
        return (
            <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (conversationError) {
        return <div className="p-4 text-sm text-red-500">Error: {conversationError.message}</div>;
    }

    if (!conversations || conversations.length === 0) {
        return <div className="p-4 text-sm text-muted-foreground">No executions found for this agent.</div>;
    }

    const sortedConversations = [...conversations].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return (
        <ul className="space-y-2 p-4">
            {sortedConversations.map((convo: Conversation) => {
                const hasMessages = convo.messages && convo.messages.length > 0;
                const relativeTime = formatDistanceToNow(new Date(convo.createdAt), { addSuffix: true });

                return (
                    <li
                        key={convo.conversationId}
                        className={`flex items-center justify-between p-3 border rounded-md transition-colors ${
                            hasMessages
                                ? 'bg-muted/50 hover:bg-muted cursor-pointer'
                                : 'bg-muted/20 opacity-60 cursor-not-allowed'
                        }`}
                        onClick={() => hasMessages && onConversationSelect(convo)}
                    >
                        <span className="text-xs text-muted-foreground">{relativeTime}</span>
                        <div className="flex items-center space-x-2">
                            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-medium">{convo.messages.length}</span>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export default function LangGraphAgentSettingsPanel({ agent }: LangGraphAgentSettingsPanelProps) {
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
            <LangGraphConversationViewer
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