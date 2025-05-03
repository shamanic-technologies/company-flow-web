'use client';

import {
  utilityCategories
} from '@/components/dashboard';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

/**
 * Available Tools Page
 * Displays all tools available to the user
 * Uses the dashboard context for user data
 */
export default function ToolsPage() {
  return (
    <>
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-100">Available Tools</h1>
        <p className="text-gray-400">Explore all the tools available through Agent Base</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Card className="mb-6 bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="space-y-8">
              {utilityCategories.map((category) => (
                <div key={category.name} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-100">{category.name}</h2>
                  <p className="text-gray-400">Tools for {category.name}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.utilities.map((tool) => (
                      <Card key={tool.name} className="overflow-hidden bg-gray-800 border-gray-700">
                        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-blue-400">
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-200">{tool.name}</h3>
                            <Badge variant="outline" className="mt-1 text-xs border-gray-600 text-gray-300">
                              Available
                            </Badge>
                          </div>
                        </div>
                        <Separator className="bg-gray-700" />
                        <CardContent className="pt-4">
                          <p className="text-sm text-gray-300 mb-4">{tool.description}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-gray-200"
                            onClick={() => window.open('https://docs.helloworld.ai', '_blank')}
                          >
                            Documentation
                            <ExternalLink className="h-3 w-3 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 