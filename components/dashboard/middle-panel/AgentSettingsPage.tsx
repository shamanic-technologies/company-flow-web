import { Agent } from "@agent-base/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bot, 
  Settings, 
  MessageSquare, 
  Zap, 
  FileText, 
  Wrench,
  ChevronLeft,
  Edit3
} from "lucide-react";
import Link from "next/link";

interface AgentSettingsPageProps {
  agent: Agent;
  isPanel?: boolean;
}

export default function AgentSettingsPage({ agent, isPanel = false }: AgentSettingsPageProps) {
  if (isPanel) {
    return (
      <div className="h-full overflow-y-auto p-4 space-y-4">
        {/* Simplified Header for Panel */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {agent.firstName[0]}{agent.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{agent.firstName} {agent.lastName}</h2>
              <Badge variant="secondary" className="text-xs">
                <Bot className="w-3 h-3 mr-1" />
                Active Agent
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>

        <Separator />

        {/* Agent Overview Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Agent ID</label>
              <p className="text-sm mt-1">{agent.id}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Model</label>
              <p className="text-sm mt-1">{agent.modelId || "Default Model"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">System Instructions</div>
            <div className="bg-muted/50 rounded-md p-3 text-sm max-h-32 overflow-y-auto">
              No instructions configured yet
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Created</span>
              <Badge variant="outline">{new Date(agent.createdAt).toLocaleDateString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Updated</span>
              <Badge variant="outline">{new Date(agent.updatedAt).toLocaleDateString()}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Tools Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <Wrench className="w-4 h-4 mr-2" />
              Connected Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground mb-2">Available Tools</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tool management coming soon</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
          <Button variant="outline" className="w-full justify-start" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </Button>
        </div>
      </div>
    );
  }

  // Original full-page layout for non-panel view
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/dashboard/agents">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Agents
          </Button>
        </Link>
      </div>
      
      <div className="max-w-4xl">
        <div className="flex items-center space-x-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
              {agent.firstName[0]}{agent.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{agent.firstName} {agent.lastName}</h1>
            <p className="text-muted-foreground">AI Assistant</p>
          </div>
        </div>
        
        {/* Full page content would go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Similar cards but with more space for full page */}
        </div>
      </div>
    </div>
  );
} 