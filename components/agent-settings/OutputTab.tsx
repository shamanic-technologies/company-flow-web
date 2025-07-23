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
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Response Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tone" className="text-gray-300">
              Response Tone
            </Label>
            <Select defaultValue="professional">
              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
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
            <Label htmlFor="length" className="text-gray-300">
              Response Length
            </Label>
            <Select defaultValue="medium">
              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
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
            <Label htmlFor="language" className="text-gray-300">
              Primary Language
            </Label>
            <Select defaultValue="en">
              <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
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

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Output Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {outputFormats.map((format) => {
              const IconComponent = format.icon;
              return (
                <div
                  key={format.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-600 rounded-lg">
                      <IconComponent className="w-4 h-4 text-gray-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-100">{format.name}</h4>
                      <p className="text-sm text-gray-400">{format.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={format.enabled} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Response Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="typing-delay" className="text-gray-300">
              Typing Indicator Delay (seconds)
            </Label>
            <Input
              id="typing-delay"
              type="number"
              step="0.1"
              defaultValue="1.5"
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
            <p className="text-xs text-gray-500">
              How long to show typing indicator before responding
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="response-delay" className="text-gray-300">
              Minimum Response Time (seconds)
            </Label>
            <Input
              id="response-delay"
              type="number"
              step="0.1"
              defaultValue="0.5"
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
            <p className="text-xs text-gray-500">
              Minimum time before sending response (for natural feel)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 