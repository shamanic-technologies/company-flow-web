import { Agent } from "@agent-base/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

interface OverviewTabProps {
  agent: Agent;
}

export default function OverviewTab({ agent }: OverviewTabProps) {
  const getAgentAge = (createdAt?: string) => {
    if (!createdAt) return 'Unknown';
    try {
      const creationDate = new Date(createdAt);
      return formatDistanceToNow(creationDate, { addSuffix: false });
    } catch (e) {
      console.error("Error calculating agent age:", e);
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16 border-2 border-blue-600">
              {agent.profilePicture.includes('://') ? (
                <AvatarImage src={agent.profilePicture} alt={`${agent.firstName} ${agent.lastName}`} />
              ) : (
                <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                  {agent.profilePicture || agent.firstName.charAt(0) + agent.lastName.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                {agent.firstName} {agent.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{agent.jobTitle}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block text-muted-foreground">Age</span>
                  <span>{getAgentAge(agent.createdAt.toString())}</span>
                </div>
                <div>
                  <span className="block text-muted-foreground">Gender</span>
                  <span className="capitalize">{agent.gender}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <h4 className="text-md font-semibold text-foreground mb-3">Agent Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-muted-foreground">Total Conversations</span>
              <span className="text-foreground">42</span>
            </div>
            <div>
              <span className="block text-muted-foreground">Messages Sent</span>
              <span className="text-foreground">1,247</span>
            </div>
            <div>
              <span className="block text-muted-foreground">Average Response Time</span>
              <span className="text-foreground">2.3s</span>
            </div>
            <div>
              <span className="block text-muted-foreground">Last Active</span>
              <span className="text-foreground">5 minutes ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 