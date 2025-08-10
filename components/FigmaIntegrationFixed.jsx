'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { 
  RefreshCw, 
  Download, 
  Upload, 
  Settings, 
  Palette, 
  Type, 
  Layers,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

const FigmaIntegrationFixed = () => {
  const [tokens, setTokens] = useState(null);
  const [components, setComponents] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentCode, setComponentCode] = useState('');
  const [codeViewerOpen, setCodeViewerOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  return (
    <div className="container py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Figma Design System</h1>
        <p className="text-muted-foreground">
          Manage design tokens, sync components, and explore your Figma design system
        </p>
      </div>

      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="sync">Sync Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Tokens
              </CardTitle>
              <CardDescription>
                Browse and explore design tokens from your Figma file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No Figma configuration found. Set up your FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY to sync design tokens.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sample Design Tokens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Colors</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-sm">Primary Blue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-500"></div>
                        <span className="text-sm">Success Green</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-500"></div>
                        <span className="text-sm">Error Red</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Typography</h4>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">Heading 1</div>
                      <div className="text-lg font-semibold">Heading 2</div>
                      <div className="text-base">Body Text</div>
                      <div className="text-sm text-muted-foreground">Caption</div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Spacing</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-2 bg-gray-300"></div>
                        <span className="text-sm">4px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-2 bg-gray-300"></div>
                        <span className="text-sm">8px</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-300"></div>
                        <span className="text-sm">16px</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Component Library
              </CardTitle>
              <CardDescription>
                Discover and explore components from your Figma file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No synced components found. Run sync commands to generate components from your Figma file.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sample Components</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Button</CardTitle>
                      <CardDescription className="text-sm">
                        Primary action button component
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                        <Button>Sample Button</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Code
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Input</CardTitle>
                      <CardDescription className="text-sm">
                        Text input field component
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                        <div className="w-full max-w-xs">
                          <input className="w-full px-3 py-2 border rounded" placeholder="Sample input" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Code
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Card</CardTitle>
                      <CardDescription className="text-sm">
                        Content container component
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3">
                        <div className="w-full max-w-xs p-3 border rounded-lg bg-background">
                          <div className="text-sm font-medium">Sample Card</div>
                          <div className="text-xs text-muted-foreground">Card content</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          View Code
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sync Dashboard
              </CardTitle>
              <CardDescription>
                Synchronize design tokens and components from Figma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Configure your Figma access token and file key to enable syncing.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Manual Sync Commands</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Sync Tokens
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Fetch design tokens from Figma
                      </p>
                      <Button className="w-full" disabled>
                        <Download className="h-4 w-4 mr-2" />
                        Sync Tokens
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Sync Components
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Generate React components from Figma
                      </p>
                      <Button className="w-full" disabled>
                        <Upload className="h-4 w-4 mr-2" />
                        Sync Components
                      </Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Full Sync
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sync both tokens and components
                      </p>
                      <Button className="w-full" disabled>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Full Sync
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Terminal Commands</h4>
                  <div className="bg-muted p-3 rounded-lg font-mono text-sm space-y-1">
                    <div>npm run figma:tokens</div>
                    <div>npm run figma:components</div>
                    <div>npm run figma:sync</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </CardTitle>
              <CardDescription>
                Configure your Figma integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuration Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Figma Access Token</span>
                    </div>
                    <Badge variant="destructive">Not Configured</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Figma File Key</span>
                    </div>
                    <Badge variant="destructive">Not Configured</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Setup Instructions</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">1. Get Figma Access Token</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Generate a personal access token from your Figma account settings.
                    </p>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Open Figma Settings
                    </Button>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">2. Get File Key from URL</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Copy the file key from your Figma file URL.
                    </p>
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      https://figma.com/file/<span className="bg-yellow-200 px-1">FILE_KEY</span>/...
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">3. Set Environment Variables</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add these to your .env.local file:
                    </p>
                    <div className="bg-muted p-3 rounded-lg font-mono text-sm space-y-1">
                      <div>FIGMA_ACCESS_TOKEN=your_token_here</div>
                      <div>FIGMA_FILE_KEY=your_file_key_here</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Figma File</h3>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4" />
                    <span className="font-medium">shadcn/ui Design System</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    You shared: https://www.figma.com/design/5rvwh7hXpC1jqEiL97B9z2/-shadcn-ui---Design-System--Community-
                  </p>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    Open in Figma
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FigmaIntegrationFixed;
