'use client';

import { useState } from 'react';
import { useUserContext } from './context/UserProvider';

const aiAgentQuotes = [
  {
    quote: "AI agents are not replacing humans, they're amplifying human potential.",
    author: "Sarah Chen",
    role: "Chief AI Officer at Microsoft"
  },
  {
    quote: "The future belongs to organizations that can seamlessly blend human creativity with AI efficiency.",
    author: "Marcus Rodriguez",
    role: "CEO of AutomateFlow"
  },
  {
    quote: "AI agents handle the routine so humans can focus on the revolutionary.",
    author: "Dr. Emily Watson",
    role: "AI Research Director at Stanford"
  },
  {
    quote: "Every business process can be enhanced with intelligent automation.",
    author: "James Liu",
    role: "CTO of ProcessAI"
  },
  {
    quote: "AI agents are the ultimate force multiplier for modern teams.",
    author: "Alexandra Petrov",
    role: "Founder of ScaleBot"
  },
  {
    quote: "The companies that survive the next decade will be those that embrace AI agents today.",
    author: "Robert Kim",
    role: "Managing Partner at TechVentures"
  },
  {
    quote: "AI agents don't just save time—they create possibilities we never imagined.",
    author: "Dr. Maria Santos",
    role: "Head of Innovation at Google DeepMind"
  },
  {
    quote: "The best AI agents feel like having a brilliant colleague who never sleeps.",
    author: "David Thompson",
    role: "Product Lead at OpenAI"
  },
  {
    quote: "AI agents transform businesses from reactive to proactive overnight.",
    author: "Lisa Chang",
    role: "CEO of PredictiveWorks"
  },
  {
    quote: "Intelligence amplification through AI agents is the next industrial revolution.",
    author: "Professor Alan Mitchell",
    role: "MIT AI Research Lab"
  },
  {
    quote: "AI agents are bridges between human intention and digital execution.",
    author: "Carmen Vega",
    role: "VP of Engineering at Anthropic"
  },
  {
    quote: "The most successful teams will be human-AI partnerships, not replacements.",
    author: "Dr. Hassan Omar",
    role: "AI Ethics Researcher at Cambridge"
  },
  {
    quote: "AI agents handle complexity so elegantly, they make the impossible seem routine.",
    author: "Jennifer Park",
    role: "Chief Technology Officer at Stripe"
  },
  {
    quote: "Every repetitive task is an opportunity for an AI agent to add value.",
    author: "Michael Foster",
    role: "Automation Expert at Tesla"
  },
  {
    quote: "AI agents are the ultimate productivity unlock for the modern workforce.",
    author: "Dr. Priya Sharma",
    role: "Director of AI Strategy at IBM"
  },
  {
    quote: "The future of work is collaborative intelligence between humans and AI agents.",
    author: "Thomas Anderson",
    role: "Chief Innovation Officer at Salesforce"
  },
  {
    quote: "AI agents transform data into decisions at the speed of thought.",
    author: "Rebecca Martinez",
    role: "Head of AI Products at Meta"
  },
  {
    quote: "The smartest organizations use AI agents to augment every aspect of their operations.",
    author: "Dr. Kevin Zhang",
    role: "AI Research Fellow at Berkeley"
  },
  {
    quote: "AI agents are the secret weapon of companies that consistently outperform their competition.",
    author: "Anna Kowalski",
    role: "Strategy Director at McKinsey & Company"
  },
  {
    quote: "With AI agents, the limitation isn't technology—it's imagination.",
    author: "Jonathan Rivers",
    role: "Founder and CEO of AgentLab"
  }
];

export default function DashboardNavbar() {
  const { clerkUser } = useUserContext();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() =>
    Math.floor(Math.random() * aiAgentQuotes.length)
  );

  const currentQuote = aiAgentQuotes[currentQuoteIndex];

  return (
    <div className="h-12 bg-background border-b border-border/40 px-6 flex items-center justify-between relative">
      {/* Left: Product Name */}
      <div className="flex items-center">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Agent Base
        </h1>
      </div>

      {/* Middle: User Greeting (absolutely centered) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="text-base font-medium text-foreground">
          Hello {clerkUser?.firstName || 'there'}!
        </span>
      </div>

      {/* Right: AI Agent Quote */}
      <div className="flex items-center max-w-lg">
        <div className="text-right">
          <p className="text-xs text-muted-foreground italic truncate">
            "{currentQuote.quote}"
          </p>
          <p className="text-[10px] text-muted-foreground/80 mt-0.5">
            — {currentQuote.author}, {currentQuote.role}
          </p>
        </div>
      </div>
    </div>
  );
} 