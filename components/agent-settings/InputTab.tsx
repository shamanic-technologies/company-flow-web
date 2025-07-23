import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mic, FileText, Image, Link, Settings } from "lucide-react";

export default function InputTab() {
  const inputTypes = [
    {
      id: "text",
      name: "Text Messages",
      description: "Accept text-based messages from users",
      icon: FileText,
      enabled: true,
    },
    {
      id: "voice",
      name: "Voice Messages",
      description: "Process voice messages and convert to text",
      icon: Mic,
      enabled: false,
    },
    {
      id: "images",
      name: "Images",
      description: "Analyze and respond to image uploads",
      icon: Image,
      enabled: true,
    },
    {
      id: "links",
      name: "URLs & Links",
      description: "Extract and process content from shared links",
      icon: Link,
      enabled: false,
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Input Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-length" className="text-gray-300">
              Maximum Message Length
            </Label>
            <Input
              id="max-length"
              type="number"
              defaultValue="2000"
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
            <p className="text-xs text-gray-500">
              Maximum number of characters allowed in a single message
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate-limit" className="text-gray-300">
              Rate Limit (messages per minute)
            </Label>
            <Input
              id="rate-limit"
              type="number"
              defaultValue="10"
              className="bg-gray-700 border-gray-600 text-gray-100"
            />
            <p className="text-xs text-gray-500">
              Maximum messages a user can send per minute
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Supported Input Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inputTypes.map((inputType) => {
              const IconComponent = inputType.icon;
              return (
                <div
                  key={inputType.id}
                  className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-600 rounded-lg">
                      <IconComponent className="w-4 h-4 text-gray-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-100">{inputType.name}</h4>
                      <p className="text-sm text-gray-400">{inputType.description}</p>
                    </div>
                  </div>
                  <Switch defaultChecked={inputType.enabled} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Input Preprocessing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preprocessing-rules" className="text-gray-300">
              Custom Preprocessing Rules
            </Label>
            <Textarea
              id="preprocessing-rules"
              placeholder="Enter custom rules for input preprocessing..."
              className="bg-gray-700 border-gray-600 text-gray-100 min-h-[100px]"
              defaultValue="- Remove profanity and inappropriate content&#10;- Normalize text formatting&#10;- Extract mentions and hashtags"
            />
            <p className="text-xs text-gray-500">
              Define rules for how inputs should be processed before reaching the agent
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 