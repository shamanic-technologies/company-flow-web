import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Wrench, Database, Globe, Calculator, Calendar, Mail } from "lucide-react";

export default function ToolsTab() {
  const availableTools = [
    {
      id: "calculator",
      name: "Calculator",
      description: "Perform mathematical calculations",
      icon: Calculator,
      enabled: true,
      category: "Utilities",
    },
    {
      id: "calendar",
      name: "Calendar",
      description: "Schedule and manage appointments",
      icon: Calendar,
      enabled: false,
      category: "Productivity",
    },
    {
      id: "email",
      name: "Email",
      description: "Send and manage email communications",
      icon: Mail,
      enabled: true,
      category: "Communication",
    },
    {
      id: "web-search",
      name: "Web Search",
      description: "Search the internet for information",
      icon: Globe,
      enabled: true,
      category: "Information",
    },
    {
      id: "database",
      name: "Database Query",
      description: "Query and retrieve data from databases",
      icon: Database,
      enabled: false,
      category: "Data",
    },
  ];

  const categories = Array.from(new Set(availableTools.map(tool => tool.category)));

  const getCategoryColor = (category: string) => {
    const colors = {
      "Utilities": "bg-blue-600",
      "Productivity": "bg-green-600",
      "Communication": "bg-purple-600",
      "Information": "bg-orange-600",
      "Data": "bg-red-600",
    };
    return colors[category as keyof typeof colors] || "bg-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground">Available Tools</h3>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Custom Tool
        </Button>
      </div>

      {categories.map((category) => (
        <Card key={category} className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground flex items-center text-md">
              <Wrench className="w-4 h-4 mr-2" />
              {category}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableTools
                .filter((tool) => tool.category === category)
                .map((tool) => {
                  const IconComponent = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-background rounded-lg">
                          <IconComponent className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-foreground">{tool.name}</h4>
                            <Badge className={`${getCategoryColor(tool.category)} text-white text-xs`}>
                              {tool.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch defaultChecked={tool.enabled} />
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Tool Usage Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">23</div>
              <div className="text-muted-foreground">Tools Used Today</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">156</div>
              <div className="text-muted-foreground">Total Tool Calls</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-muted-foreground">Active Tools</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-orange-600">98%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 