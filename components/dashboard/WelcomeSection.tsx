/**
 * Welcome Section Component
 * 
 * Displays welcome information, service explanation and getting started guide
 */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '../../components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Key, ArrowRight, FileText, Rocket, LucideIcon } from 'lucide-react';

interface WelcomeSectionProps {
  userId?: string;
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Step component for the getting started guide
 */
function Step({ number, title, description, icon: Icon, action }: StepProps) {
  return (
    <div className="flex gap-3 items-start p-3 rounded-lg bg-gray-800 border border-gray-700 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Icon className="h-3.5 w-3.5 text-blue-400" />
          <h3 className="font-medium text-sm text-gray-200">{title}</h3>
        </div>
        <p className="text-xs text-gray-400 mb-1.5">{description}</p>
        {action && (
          <Button
            variant="ghost" 
            size="sm"
            className="text-blue-400 hover:text-blue-300 hover:bg-gray-700 p-0 h-auto text-xs"
            onClick={action.onClick}
          >
            {action.label} <ArrowRight className="h-2.5 w-2.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Welcome Section Component displays features and setup instructions
 */
export default function WelcomeSection({ userId }: WelcomeSectionProps) {
  const router = useRouter();

  // Navigation functions
  const goToProfile = () => {
    router.push('/dashboard/profile');
  };

  const goToDocumentation = () => {
    window.open('https://docs.agent-base.ai', '_blank');
  };
  
  return (
    <Card className="bg-gray-900 border-gray-800 text-gray-200 m-5">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 text-white">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold mb-1">Welcome to Agent Base! 🚀</h1>
          <p className="opacity-90">Your one-stop platform for supercharging AI agents</p>
        </div>
      </div>

      <CardContent className="p-5">
        {/* Service explanation */}
        <div className="mb-5 bg-gray-800 p-3 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-2 text-gray-100">What is Agent Base?</h2>
          <p className="text-gray-300 mb-2 text-sm">
            Agent Base provides ready-to-use tools for AI agents that work right out of the box. 
            With just one API integration, your agents can access a comprehensive suite of tools.
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-gray-300 text-sm">
              <div className="h-4 w-4 rounded-full bg-gray-700 flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-blue-400" />
              </div>
              <span>Pre-built, professional tools with minimal setup</span>
            </li>
            <li className="flex items-center gap-2 text-gray-300 text-sm">
              <div className="h-4 w-4 rounded-full bg-gray-700 flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-blue-400" />
              </div>
              <span>Single API endpoint for all tools</span>
            </li>
            <li className="flex items-center gap-2 text-gray-300 text-sm">
              <div className="h-4 w-4 rounded-full bg-gray-700 flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-blue-400" />
              </div>
              <span>Simplified integration and management</span>
            </li>
          </ul>
        </div>

        {/* Getting Started Steps */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-100">Get Started in 3 Simple Steps</h2>
          <div className="space-y-2">
            <Step
              number={1}
              title="Generate Your API Key"
              description="Create a new API key to authenticate your requests"
              icon={Key}
              action={{
                label: "Go to Profile",
                onClick: goToProfile
              }}
            />
            
            <Step
              number={2}
              title="Call the API"
              description="Add the API to your agent with our simple integration guide"
              icon={FileText}
              action={{
                label: "View Documentation",
                onClick: goToDocumentation
              }}
            />
            
            <Step
              number={3}
              title="All Set!"
              description="Your agent now has access to all tools at once with a single API call"
              icon={Rocket}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 