'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Globe, 
  Shield, 
  Code,
  BookOpen,
  Activity,
  AlertCircle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'inactive';
  lastUsed: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
  requestCount: number;
  rateLimit: number;
}

interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  example: string;
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    path: '/api/v1/news',
    method: 'GET',
    description: 'Get published news articles with pagination',
    parameters: [
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Items per page (default: 10, max: 100)' },
      { name: 'category', type: 'string', required: false, description: 'Filter by category ID' },
      { name: 'search', type: 'string', required: false, description: 'Search in title and content' }
    ],
    example: `{
  "data": [
    {
      "id": "news_id",
      "title": "News Title",
      "content": "News content...",
      "imageUrl": "https://...",
      "category": {
        "id": "cat_id",
        "name": "Sports"
      },
      "publishedAt": "2024-01-01T00:00:00Z",
      "views": 1250,
      "likes": 45
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}`
  },
  {
    path: '/api/v1/news/{id}',
    method: 'GET',
    description: 'Get a specific news article by ID',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'News article ID' }
    ],
    example: `{
  "data": {
    "id": "news_id",
    "title": "News Title",
    "content": "Full news content...",
    "imageUrl": "https://...",
    "category": {
      "id": "cat_id",
      "name": "Sports"
    },
    "publishedAt": "2024-01-01T00:00:00Z",
    "views": 1250,
    "likes": 45,
    "shares": 12
  }
}`
  },
  {
    path: '/api/v1/categories',
    method: 'GET',
    description: 'Get all news categories',
    parameters: [],
    example: `{
  "data": [
    {
      "id": "cat_id",
      "name": "Sports",
      "slug": "sports"
    }
  ]
}`
  },
  {
    path: '/api/v1/notifications/register',
    method: 'POST',
    description: 'Register device for push notifications',
    parameters: [
      { name: 'token', type: 'string', required: true, description: 'FCM device token' },
      { name: 'platform', type: 'string', required: true, description: 'Device platform (android/ios)' },
      { name: 'deviceId', type: 'string', required: true, description: 'Unique device identifier' }
    ],
    example: `{
  "message": "Device registered successfully",
  "tokenId": "token_id"
}`
  }
];

export default function APIPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
  const [newKeyExpiry, setNewKeyExpiry] = useState('never');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(1000);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const permissions = [
    { id: 'news:read', label: 'Read News', description: 'Access to news articles and categories' },
    { id: 'news:write', label: 'Write News', description: 'Create and update news articles' },
    { id: 'notifications:send', label: 'Send Notifications', description: 'Send push notifications' },
    { id: 'analytics:read', label: 'Read Analytics', description: 'Access to analytics data' },
    { id: 'internal:unlimited', label: 'Internal App Access', description: 'Unlimited access for official mobile app (includes all permissions)' }
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          permissions: newKeyPermissions,
          expiresAt: newKeyExpiry === 'never' ? null : new Date(Date.now() + parseInt(newKeyExpiry) * 24 * 60 * 60 * 1000),
          rateLimit: newKeyRateLimit
        })
      });

      if (response.ok) {
        await fetchApiKeys();
        setShowKeyForm(false);
        setNewKeyName('');
        setNewKeyPermissions([]);
        setNewKeyExpiry('never');
        setNewKeyRateLimit(1000);
      }
    } catch (error) {
      console.error('Error generating API key:', error);
    }
  };

  const generateUnlimitedKey = async () => {
    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Internal App - Unlimited Access',
          permissions: ['internal:unlimited'],
          expiresAt: null,
          rateLimit: -1
        })
      });

      if (response.ok) {
        await fetchApiKeys();
      }
    } catch (error) {
      console.error('Error generating unlimited API key:', error);
    }
  };

  const toggleKeyStatus = async (keyId: string, status: 'active' | 'inactive') => {
    try {
      await fetch(`/api/keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchApiKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
    }
  };

  const deleteApiKey = async (keyId: string) => {
    try {
      await fetch(`/api/keys/${keyId}`, { method: 'DELETE' });
      await fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(keyId)) {
      newVisible.delete(keyId);
    } else {
      newVisible.add(keyId);
    }
    setVisibleKeys(newVisible);
  };

  const formatKey = (key: string, visible: boolean) => {
    if (visible) return key;
    return key.substring(0, 8) + '•'.repeat(24) + key.substring(-8);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage API keys and integration endpoints for your mobile application
          </p>
        </div>
      </div>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="documentation" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Usage Analytics
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">API Keys</h2>
            <div className="flex gap-2">
              <Button 
                onClick={generateUnlimitedKey} 
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              >
                <Shield className="h-4 w-4" />
                Generate Unlimited Key
              </Button>
              <Button onClick={() => setShowKeyForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Generate New Key
              </Button>
            </div>
          </div>

          {showKeyForm && (
            <Card>
              <CardHeader>
                <CardTitle>Generate New API Key</CardTitle>
                <CardDescription>
                  Create a new API key with specific permissions and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Mobile App Production"
                  />
                </div>

                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={newKeyPermissions.includes(permission.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyPermissions([...newKeyPermissions, permission.id]);
                            } else {
                              setNewKeyPermissions(newKeyPermissions.filter(p => p !== permission.id));
                            }
                          }}
                          className="mt-1"
                        />
                        <div>
                          <Label htmlFor={permission.id} className="font-medium">
                            {permission.label}
                          </Label>
                          <p className="text-sm text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiration</Label>
                    <Select value={newKeyExpiry} onValueChange={setNewKeyExpiry}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                    <Select value={newKeyRateLimit === -1 ? 'unlimited' : newKeyRateLimit.toString()} onValueChange={(value) => setNewKeyRateLimit(value === 'unlimited' ? -1 : parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200">
                        <SelectItem value="100">100/hour</SelectItem>
                        <SelectItem value="500">500/hour</SelectItem>
                        <SelectItem value="1000">1,000/hour</SelectItem>
                        <SelectItem value="5000">5,000/hour</SelectItem>
                        <SelectItem value="10000">10,000/hour</SelectItem>
                        <SelectItem value="unlimited">Unlimited (Internal App)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={generateApiKey} disabled={!newKeyName || newKeyPermissions.length === 0}>
                    Generate Key
                  </Button>
                  <Button variant="outline" onClick={() => setShowKeyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 font-mono text-sm bg-gray-50 p-2 rounded">
                        <code>{formatKey(apiKey.key, visibleKeys.has(apiKey.id))}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {visibleKeys.has(apiKey.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {apiKey.permissions.map((permission) => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-sm text-gray-500 grid grid-cols-2 gap-4">
                        <div>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</div>
                        <div>Last Used: {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : 'Never'}</div>
                        <div>Requests: {apiKey.requestCount.toLocaleString()}</div>
                        <div>Rate Limit: {apiKey.rateLimit === -1 ? 'Unlimited' : `${apiKey.rateLimit}/hour`}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Switch
                        checked={apiKey.status === 'active'}
                        onCheckedChange={(checked) => toggleKeyStatus(apiKey.id, checked ? 'active' : 'inactive')}
                      />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this API key? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteApiKey(apiKey.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">API Documentation</h2>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Base URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <code className="bg-gray-100 p-2 rounded block font-mono">
                  https://your-domain.com/api/v1
                </code>
                <p className="text-sm text-gray-600 mt-2">
                  All API requests should include your API key in the Authorization header:
                  <code className="bg-gray-100 p-1 rounded ml-1">Authorization: Bearer YOUR_API_KEY</code>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {API_ENDPOINTS.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                      {endpoint.method}
                    </Badge>
                    <code className="font-mono">{endpoint.path}</code>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {endpoint.parameters.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Parameters</h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param, paramIndex) => (
                          <div key={paramIndex} className="flex items-center gap-4 text-sm">
                            <code className="bg-gray-100 px-2 py-1 rounded">{param.name}</code>
                            <Badge variant="outline">{param.type}</Badge>
                            {param.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                            <span className="text-gray-600">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium mb-2">Example Response</h4>
                    <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                      <code>{endpoint.example}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-xl font-semibold">API Usage Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245,678</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{apiKeys.filter(k => k.status === 'active').length}</div>
                <p className="text-xs text-muted-foreground">
                  {apiKeys.filter(k => k.status === 'inactive').length} inactive
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.3%</div>
                <p className="text-xs text-muted-foreground">-0.1% from last week</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Most Used Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {API_ENDPOINTS.slice(0, 4).map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{endpoint.method}</Badge>
                      <code className="text-sm">{endpoint.path}</code>
                    </div>
                    <div className="text-sm text-gray-600">
                      {Math.floor(Math.random() * 10000).toLocaleString()} requests
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}