import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Zap, Clock, MessageSquare } from "lucide-react";

export default function TriggersTab() {
  const mockTriggers = [
    {
      id: 1,
      name: "New User Welcome",
      type: "event",
      condition: "User joins organization",
      action: "Send welcome message",
      status: "active",
      icon: MessageSquare,
    },
    {
      id: 2,
      name: "Daily Standup Reminder",
      type: "schedule",
      condition: "Every weekday at 9:00 AM",
      action: "Ask for daily updates",
      status: "active",
      icon: Clock,
    },
    {
      id: 3,
      name: "Project Completion",
      type: "webhook",
      condition: "Task marked as complete",
      action: "Congratulate and ask for feedback",
      status: "inactive",
      icon: Zap,
    },
  ];

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-600" : "bg-gray-600";
  };

  const getStatusText = (status: string) => {
    return status === "active" ? "Active" : "Inactive";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-100">Agent Triggers</h3>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Trigger
        </Button>
      </div>

      <div className="space-y-3">
        {mockTriggers.map((trigger) => {
          const IconComponent = trigger.icon;
          return (
            <Card key={trigger.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-700 rounded-lg">
                      <IconComponent className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-100">{trigger.name}</h4>
                        <Badge className={`${getStatusColor(trigger.status)} text-white text-xs`}>
                          {getStatusText(trigger.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{trigger.condition}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">Action:</span> {trigger.action}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-800 border-gray-700 border-dashed">
        <CardContent className="p-6 text-center">
          <Plus className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Create your first trigger to automate agent responses</p>
          <Button variant="outline" size="sm" className="mt-3">
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 