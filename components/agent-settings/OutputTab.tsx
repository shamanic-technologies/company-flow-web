import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Volume2, FileText, Palette, Clock } from "lucide-react";

export default function OutputTab() {
  const outputFormats = [
    {
      id: "text",
      name: "Text Response",
      description: "Standard text-based responses",
      icon: MessageSquare,
      enabled: true,
    },
    {
      id: "voice",
      name: "Voice Synthesis",
      description: "Convert responses to speech",
      icon: Volume2,
      enabled: false,
    },
    {
      id: "markdown",
      name: "Rich Text (Markdown)",
      description: "Formatted text with styling",
      icon: FileText,
      enabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Response Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tone" className="text-foreground">
              Response Tone
            </Label>
            <Select defaultValue="professional">
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length" className="text-foreground">
              Response Length
            </Label>
            <Select defaultValue="medium">
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1-2 sentences)</SelectItem>
                <SelectItem value="medium">Medium (3-5 sentences)</SelectItem>
                <SelectItem value="long">Long (Detailed explanations)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="text-foreground">
              Primary Language
            </Label>
            <Select defaultValue="en">
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Output Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {outputFormats.map((format) => {
              const IconComponent = format.icon;
              return (
                <div
                  key={format.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-background rounded-lg">
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{format.name}</h4>
                      <p className="text-sm text-muted-foreground">{format.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={format.enabled} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Response Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="typing-delay" className="text-foreground">
              Typing Indicator Delay (seconds)
            </Label>
            <Input
              id="typing-delay"
              type="number"
              step="0.1"
              defaultValue="1.5"
              className="bg-background border-input text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              How long to show typing indicator before responding
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response-delay" className="text-foreground">
              Minimum Response Time (seconds)
            </Label>
            <Input
              id="response-delay"
              type="number"
              step="0.1"
              defaultValue="0.5"
              className="bg-background border-input text-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Minimum time before sending response (for natural feel)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 