'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Key, RefreshCw, Loader2, Copy, Check, Plus } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDashboard } from '@/components/dashboard/context/DashboardContext';
import { toast } from '@/hooks/use-toast';

// Type definitions for API key data
interface ApiKeyInfo {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsed: string | null;
  active: boolean;
}

/**
 * API Keys Page
 * Allows users to manage their API keys
 */
export default function ApiKeysPage() {
  const router = useRouter();
  const { user, isLoading, error } = useDashboard();
  
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [isLoadingKeys, setIsLoadingKeys] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Load API keys on component mount
  useEffect(() => {
    if (user?.id) {
      fetchApiKeys();
    }
  }, [user]);

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (copiedKey) {
      const timeout = setTimeout(() => {
        setCopiedKey(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [copiedKey]);

  // Fetch API keys from the server
  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth-token');
      
      if (!token) {
        console.error('No authentication token found');
        toast({
          title: 'Error',
          description: 'Authentication required. Please log in again.',
          variant: 'destructive',
        });
        return;
      }
      
      const response = await fetch('/api/keys', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      
      const data = await response.json();
      setApiKeys(data.data || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast({
        title: 'Error',
        description: 'Failed to load API keys. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingKeys(false);
    }
  };

  // Create a new API key
  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a name for your API key',
        variant: 'destructive',
      });
      return;
    }

    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    
    if (!token) {
      console.error('No authentication token found');
      toast({
        title: 'Error',
        description: 'Authentication required. Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingKey(true);
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const data = await response.json();
      
      // Add the new key info to the list with active set to true
      setApiKeys((prev) => [{
        ...data.data,
        active: true // Ensure new keys are marked as active
      }, ...prev]);
      
      // Clear form and close dialog
      setNewKeyName('');
      setCreateDialogOpen(false);
      
      toast({
        title: 'Success',
        description: 'API key created successfully',
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to create API key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    toast({
      title: 'Copied!',
      description: 'API key copied to clipboard',
    });
  };

  // Format date in a readable way
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // User not found or not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to manage your API keys</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex-shrink-0 mb-4">
        <h1 className="text-2xl font-bold text-gray-100">API Keys</h1>
        <p className="text-gray-400">Manage the API keys that can be used to authenticate with the API</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div></div> {/* Empty div for flex spacing */}
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800">
            <Plus className="mr-2 h-4 w-4" /> Create API Key
          </Button>
        </div>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-100">Your API Keys</CardTitle>
            <CardDescription className="text-gray-400">
              These keys allow secure access to the Agent Base API
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingKeys ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="text-center py-8">
                <Key className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-200">No API Keys</h3>
                <p className="text-gray-400">
                  You haven't created any API keys yet. Click the button above to create your first key.
                </p>
              </div>
            ) : (
              <div className="rounded-md overflow-hidden border border-gray-800">
                <Table>
                  <TableHeader className="bg-gray-800">
                    <TableRow className="hover:bg-gray-800/80 border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Key</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Last Used</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id} className="hover:bg-gray-800/50 border-gray-800">
                        <TableCell className="font-medium text-gray-200">{key.name}</TableCell>
                        <TableCell className="text-gray-300">
                          <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">
                            {key.keyPrefix}••••••••••••••••••••••
                          </code>
                        </TableCell>
                        <TableCell className="text-gray-300">{formatDate(key.createdAt)}</TableCell>
                        <TableCell className="text-gray-300">{formatDate(key.lastUsed)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            key.active 
                              ? 'bg-green-900/30 text-green-400'
                              : 'bg-red-900/30 text-red-400'
                          }`}>
                            {key.active ? 'Active' : 'Revoked'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-auto border-gray-700 text-gray-300 hover:bg-gray-800" 
              onClick={fetchApiKeys}
              disabled={isLoadingKeys}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingKeys ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-gray-900 text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription className="text-gray-400">
              Give your API key a name to help you identify it later
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="key-name" className="text-gray-300">API Key Name</Label>
              <Input
                id="key-name"
                placeholder="e.g., Development API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-200"
              />
            </div>
            
            {newlyCreatedKey && (
              <div className="space-y-2">
                <Label htmlFor="api-key" className="text-gray-300">Your New API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    value={newlyCreatedKey}
                    readOnly
                    className="pr-10 font-mono bg-gray-800 border-gray-700 text-gray-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-100"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                  >
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-amber-500">
                  This key will only be shown once. Make sure to copy it now!
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setNewKeyName('');
                setCreateDialogOpen(false);
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={createApiKey} 
              disabled={isCreatingKey || !newKeyName.trim()} 
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800"
            >
              {isCreatingKey ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Key'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 