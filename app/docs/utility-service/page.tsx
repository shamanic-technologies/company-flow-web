'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * Utility Service API Documentation
 * Professional documentation page for the Utility Service API
 */
export default function UtilityServiceDocs() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Example code snippets
  const jsExample = `// Send a request to the Utility Service
const response = await fetch('${process.env.NEXT_PUBLIC_UTILITY_SERVICE_URL || 'https://api.agent-base.ai'}/utility', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    operation: 'utility_get_current_datetime',
    user_id: 'user-123',
    conversation_id: 'conv-456',
    input: { format: 'ISO' }
  })
});

const result = await response.json();
console.log(result);`;

  const pythonExample = `import requests
import json

# Send a request to the Utility Service
response = requests.post(
    '${process.env.NEXT_PUBLIC_UTILITY_SERVICE_URL || 'https://api.agent-base.ai'}/utility',
    headers={'Content-Type': 'application/json'},
    json={
        'operation': 'utility_get_current_datetime',
        'user_id': 'user-123',
        'conversation_id': 'conv-456',
        'input': {'format': 'ISO'}
    }
)

result = response.json()
print(result)`;

  const utilities = [
    {
      name: 'utility_get_current_datetime',
      description: 'Get the current date and time in different formats',
      category: 'Basic',
      schema: {
        type: 'object',
        properties: {
          format: {
            type: 'string',
            description: 'Optional date format (ISO, UTC, or custom format)',
            default: 'ISO'
          }
        }
      }
    },
    {
      name: 'utility_github_create_codespace',
      description: 'Create a GitHub Codespace',
      category: 'GitHub',
      schema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'utility_github_destroy_codespace',
      description: 'Destroy a GitHub Codespace',
      category: 'GitHub',
      schema: {
        type: 'object',
        properties: {
          codespaceId: {
            type: 'string',
            description: 'ID of the codespace to destroy'
          }
        },
        required: ['codespaceId']
      }
    },
    {
      name: 'utility_firecrawl_extract_content',
      description: 'Extract content from web pages using FireCrawl API',
      category: 'Content',
      schema: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'The URL to fetch content from'
          },
          onlyMainContent: {
            type: 'boolean',
            description: 'Whether to extract only the main content',
            default: true
          }
        },
        required: ['url']
      }
    },
    {
      name: 'utility_google_search',
      description: 'Search the web using Google Search API',
      category: 'Search',
      schema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'The search query to send to Google Search'
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results to return',
            default: 5
          }
        },
        required: ['query']
      }
    },
    {
      name: 'utility_get_database',
      description: 'Get information about the database',
      category: 'Database',
      schema: {
        type: 'object',
        properties: {}
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Documentation Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-gray-500">
                  <li>
                    <Link href="/" className="hover:text-blue-600">Home</Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li>
                    <span className="text-gray-800 font-medium">API Reference</span>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li className="text-gray-800 font-medium">Utility Service API</li>
                </ol>
              </nav>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">Utility Service API</h1>
              <p className="mt-2 text-lg text-gray-600">
                A collection of utility functions for your AI applications
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button variant="outline" className="border-gray-300" onClick={() => window.open('https://github.com/your-org/utility-service', '_blank')}>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
              <Button>Try the API</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Documentation Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg p-5 sticky top-24">
              <nav className="space-y-1">
                <a 
                  href="#overview" 
                  className={`block px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </a>
                <a 
                  href="#authentication" 
                  className={`block px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'authentication' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('authentication')}
                >
                  Authentication
                </a>
                <a 
                  href="#endpoints" 
                  className={`block px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'endpoints' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('endpoints')}
                >
                  Endpoints
                </a>
                <a 
                  href="#utilities" 
                  className={`block px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'utilities' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('utilities')}
                >
                  Available Utilities
                </a>
                <a 
                  href="#examples" 
                  className={`block px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'examples' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('examples')}
                >
                  Examples
                </a>
                <a 
                  href="#errors" 
                  className={`block px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'errors' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('errors')}
                >
                  Error Handling
                </a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-8">
            {/* Overview Section */}
            <section id="overview" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700">
                  The Utility Service API provides a collection of useful functions that can be integrated into your AI applications. 
                  These utilities include date/time operations, GitHub integrations, web content extraction, Google search functionality, and database operations.
                </p>
                <p className="mt-4 text-gray-700">
                  By leveraging these utilities, you can enhance your AI agents with powerful capabilities without having to implement them from scratch.
                </p>

                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Base URL</h3>
                  <div className="mt-2 bg-gray-100 p-3 rounded-md font-mono text-sm text-gray-800">
                    {process.env.NEXT_PUBLIC_UTILITY_SERVICE_URL || 'https://api.agent-base.ai'}
                  </div>
                </div>
              </div>
            </section>

            {/* Authentication Section */}
            <section id="authentication" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700">
                  All API requests require user authentication. Currently, authentication is handled through the <code>user_id</code> and <code>conversation_id</code> parameters 
                  that must be included in each request.
                </p>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900">Required Parameters</h3>
                  <ul className="mt-2 space-y-2 text-gray-700">
                    <li>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">user_id</span>: 
                      <span className="ml-2">The unique identifier for the user making the request.</span>
                    </li>
                    <li>
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">conversation_id</span>: 
                      <span className="ml-2">The unique identifier for the conversation context.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Endpoints Section */}
            <section id="endpoints" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Endpoints</h2>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-8">
                  {/* Endpoint: /utility */}
                  <div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">POST</span>
                      <span className="ml-2 font-mono text-gray-800">/utility</span>
                    </div>
                    <p className="mt-2 text-gray-700">
                      Execute a utility operation. This is the main endpoint for interacting with the Utility Service.
                    </p>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900">Request Body</h4>
                      <div className="mt-2 bg-gray-100 p-4 rounded-md">
                        <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "operation": "string",    // Required: The utility operation to execute
  "user_id": "string",      // Required: User identifier
  "conversation_id": "string", // Required: Conversation context
  "input": object           // Optional: Input parameters for the operation
}`}
                        </pre>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900">Response</h4>
                      <div className="mt-2 bg-gray-100 p-4 rounded-md">
                        <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "message": "string",      // Optional: Success message
  "data": object,           // Optional: Result data
  "timestamp": "string",    // Optional: Timestamp of the operation
  "error": "string",        // Optional: Error message (if operation failed)
  "details": "string"       // Optional: Additional error details
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Endpoint: /utilities */}
                  <div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">GET</span>
                      <span className="ml-2 font-mono text-gray-800">/utilities</span>
                    </div>
                    <p className="mt-2 text-gray-700">
                      Get a list of all available utility operations.
                    </p>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900">Query Parameters</h4>
                      <ul className="mt-2 space-y-2 text-gray-700">
                        <li>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">user_id</span>: 
                          <span className="ml-2">Required. The unique identifier for the user.</span>
                        </li>
                        <li>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">conversation_id</span>: 
                          <span className="ml-2">Required. The unique identifier for the conversation context.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900">Response</h4>
                      <div className="mt-2 bg-gray-100 p-4 rounded-md">
                        <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "utilities": ["string"]   // Array of utility operation names
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Endpoint: /utility/:id */}
                  <div>
                    <div className="flex items-center">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">GET</span>
                      <span className="ml-2 font-mono text-gray-800">/utility/:id</span>
                    </div>
                    <p className="mt-2 text-gray-700">
                      Get detailed information about a specific utility operation.
                    </p>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900">Path Parameters</h4>
                      <ul className="mt-2 space-y-2 text-gray-700">
                        <li>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">id</span>: 
                          <span className="ml-2">Required. The identifier of the utility operation.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900">Query Parameters</h4>
                      <ul className="mt-2 space-y-2 text-gray-700">
                        <li>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">user_id</span>: 
                          <span className="ml-2">Required. The unique identifier for the user.</span>
                        </li>
                        <li>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">conversation_id</span>: 
                          <span className="ml-2">Required. The unique identifier for the conversation context.</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-md font-medium text-gray-900">Response</h4>
                      <div className="mt-2 bg-gray-100 p-4 rounded-md">
                        <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "name": "string",         // Utility operation name
  "description": "string",  // Description of the utility
  "schema": {               // Input schema for the utility
    "type": "object",
    "properties": {
      // Property definitions
    },
    "required": ["string"]  // Required properties
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Available Utilities Section */}
            <section id="utilities" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Available Utilities</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700 mb-6">
                  The Utility Service provides a variety of operations. Below is a list of available utilities grouped by category.
                </p>
                
                <div className="space-y-6">
                  {/* Group utilities by category */}
                  {['Basic', 'GitHub', 'Content', 'Search', 'Database'].map((category) => (
                    <div key={category}>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">{category}</h3>
                      <div className="space-y-4">
                        {utilities.filter(util => util.category === category).map((utility) => (
                          <Card key={utility.name}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-md font-mono">{utility.name}</CardTitle>
                                </div>
                                <Badge variant="outline" className="text-xs">{utility.category}</Badge>
                              </div>
                              <CardDescription>{utility.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="mt-2">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Input Schema</h4>
                                <div className="bg-gray-100 p-3 rounded-md">
                                  <pre className="text-xs text-gray-800 overflow-x-auto">
                                    {JSON.stringify(utility.schema, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Examples Section */}
            <section id="examples" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Examples</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700 mb-6">
                  Below are examples of how to use the Utility Service API in different programming languages.
                </p>
                
                <Tabs defaultValue="js" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="js">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                  </TabsList>
                  <TabsContent value="js">
                    <div className="bg-gray-800 rounded-md p-4 text-white overflow-auto">
                      <pre className="text-sm">
                        <code>{jsExample}</code>
                      </pre>
                    </div>
                  </TabsContent>
                  <TabsContent value="python">
                    <div className="bg-gray-800 rounded-md p-4 text-white overflow-auto">
                      <pre className="text-sm">
                        <code>{pythonExample}</code>
                      </pre>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            {/* Error Handling Section */}
            <section id="errors" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Error Handling</h2>
              </div>
              <div className="px-6 py-5">
                <p className="text-gray-700 mb-6">
                  The API uses standard HTTP response codes to indicate success or failure of requests.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">200 - OK</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">The request was successful.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">400 - Bad Request</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">The request was invalid or missing required parameters.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">401 - Unauthorized</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Authentication failed or was not provided.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">404 - Not Found</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">The requested resource was not found.</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">500 - Internal Server Error</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">An error occurred on the server.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Error Response Format</h3>
                  <div className="bg-gray-100 p-4 rounded-md">
                    <pre className="text-sm text-gray-800 overflow-x-auto">
{`{
  "error": "Error message",
  "details": "Additional error details"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 