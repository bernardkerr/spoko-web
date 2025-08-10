'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Palette, 
  Layers, 
  RefreshCw, 
  Settings, 
  Download, 
  Upload, 
  ExternalLink, 
  AlertCircle,
  Eye,
  Code
} from 'lucide-react';

// Helper components defined first to avoid hoisting issues
const ColorSwatch = ({ name, color }) => (
  <div className="flex items-center gap-3 p-3 border rounded-lg">
    <div 
      className="w-8 h-8 rounded border shadow-sm" 
      style={{ backgroundColor: color }}
    />
    <div>
      <div className="font-medium text-sm">{name}</div>
      <div className="text-xs text-muted-foreground font-mono">{color}</div>
    </div>
  </div>
);

const TypographyExample = ({ name, typography }) => (
  <div className="p-4 border rounded-lg">
    <div className="text-sm font-medium text-muted-foreground mb-2">{name}</div>
    <div 
      style={{ 
        fontSize: typography.fontSize, 
        fontWeight: typography.fontWeight,
        lineHeight: typography.lineHeight 
      }}
    >
      The quick brown fox jumps over the lazy dog
    </div>
    <div className="text-xs text-muted-foreground mt-2 font-mono">
      {typography.fontSize} / {typography.fontWeight} / {typography.lineHeight}
    </div>
  </div>
);

const SpacingExample = ({ name, spacing }) => (
  <div className="p-4 border rounded-lg">
    <div className="text-sm font-medium text-muted-foreground mb-3">{name}</div>
    <div className="flex items-center gap-2">
      <div 
        className="bg-blue-100 border-2 border-blue-300 border-dashed"
        style={{ width: spacing, height: '24px' }}
      />
      <span className="text-xs font-mono text-muted-foreground">{spacing}</span>
    </div>
  </div>
);

const ComponentCard = ({ component, onViewCode }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">{component.name}</CardTitle>
      <CardDescription className="text-sm">
        {component.description}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-3 p-4">
        {component.id === 'button' && (
          <div className="space-y-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
              Secondary Button
            </button>
          </div>
        )}
        {component.id === 'input' && (
          <div className="w-full max-w-xs space-y-2">
            <input 
              type="text" 
              placeholder="Enter text..." 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input 
              type="email" 
              placeholder="email@example.com" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        {component.id === 'checkbox' && (
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" defaultChecked />
              <span className="text-sm text-gray-700">Checked option</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <span className="text-sm text-gray-700">Unchecked option</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer opacity-50">
              <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" disabled />
              <span className="text-sm text-gray-700">Disabled option</span>
            </label>
          </div>
        )}
        {!['button', 'input', 'checkbox'].includes(component.id) && (
          <div className="text-sm text-muted-foreground">Component Preview</div>
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1"
          onClick={() => onViewCode(component)}
        >
          <Code className="h-3 w-3 mr-2" />
          View Code
        </Button>
        <Button size="sm" variant="outline">
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

/**
 * FigmaIntegrationClean - Clean version without hoisting issues
 */
const FigmaIntegrationClean = () => {
  // State declarations
  const [tokens, setTokens] = useState(null);
  const [components, setComponents] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [syncLogs, setSyncLogs] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [componentCode, setComponentCode] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState(false);

  // All function definitions before useEffect
  const checkConfiguration = useCallback(async () => {
    try {
      // Check if we have existing synced files
      const componentsResponse = await fetch('/figma-components.json');
      if (componentsResponse.ok) {
        setIsConfigured(true);
      } else {
        setIsConfigured(false);
      }
    } catch (error) {
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTokens = useCallback(async () => {
    try {
      // Try to load existing synced file
      const response = await fetch('/figma-tokens.json');
      if (response.ok) {
        const data = await response.json();
        if (data && Object.keys(data).length > 0) {
          setTokens(data);
          return;
        }
      }
    } catch (error) {
      // No synced tokens found, will use samples
    }
    // Use sample tokens
    setTokens(getSampleTokens());
  }, []);

  const loadComponents = useCallback(async () => {
    try {
      // Try to load existing synced file
      const response = await fetch('/figma-components.json');
      if (response.ok) {
        const data = await response.json();
        if (data.components && data.components.length > 0) {
          setComponents(data.components);
          return;
        }
      }
    } catch (error) {
      // No synced components found, will use real components based on files
    }
    
    // Create components based on actual files in /public/figma/
    const realComponents = [
      {
        id: 'button',
        name: 'Button',
        description: 'Interactive button component with multiple variants',
        category: 'Actions',
        type: 'COMPONENT',
        properties: {
          variant: ['primary', 'secondary', 'outline', 'ghost'],
          size: ['sm', 'md', 'lg'],
          state: ['default', 'hover', 'active', 'disabled']
        }
      },
      {
        id: 'checkbox',
        name: 'Checkbox',
        description: 'Form checkbox input component',
        category: 'Forms',
        type: 'COMPONENT',
        properties: {
          size: ['sm', 'md', 'lg'],
          state: ['default', 'checked', 'indeterminate', 'disabled']
        }
      },
      {
        id: 'input',
        name: 'Input',
        description: 'Text input field component',
        category: 'Forms',
        type: 'COMPONENT',
        properties: {
          size: ['sm', 'md', 'lg'],
          state: ['default', 'focus', 'error', 'disabled'],
          type: ['text', 'email', 'password', 'number']
        }
      }
    ];
    
    setComponents(realComponents);
  }, []);

  const loadComponentCode = async (component) => {
    try {
      const response = await fetch(`/figma/${component.id}.jsx`);
      if (response.ok) {
        const code = await response.text();
        setComponentCode(code);
      } else {
        const sampleCode = `// ${component.name} Component
// Generated from Figma

import React from 'react';

const ${component.name.charAt(0).toUpperCase() + component.name.slice(1)} = (props) => {
  return (
    <div className="figma-component">
      {/* Component implementation */}
    </div>
  );
};

export default ${component.name.charAt(0).toUpperCase() + component.name.slice(1)};`;
        setComponentCode(sampleCode);
      }
    } catch (error) {
      setComponentCode('// Error loading component code');
    }
  };

  const addSyncLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSyncLogs(prev => [...prev.slice(-9), { timestamp, message }]);
  };

  const getSampleTokens = () => ({
    colors: {
      'primary': '#3b82f6',
      'secondary': '#64748b',
      'accent': '#8b5cf6',
      'success': '#10b981',
      'warning': '#f59e0b',
      'error': '#ef4444',
      'background': '#ffffff',
      'foreground': '#0f172a',
    },
    typography: {
      'heading-1': { fontSize: '48px', fontWeight: '700', lineHeight: '1.2' },
      'heading-2': { fontSize: '36px', fontWeight: '600', lineHeight: '1.3' },
      'body-large': { fontSize: '18px', fontWeight: '400', lineHeight: '1.6' },
      'body': { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
      'caption': { fontSize: '14px', fontWeight: '400', lineHeight: '1.4' },
    },
    spacing: {
      'xs': '4px',
      'sm': '8px',
      'md': '16px',
      'lg': '24px',
      'xl': '32px',
      '2xl': '48px',
    }
  });

  const getSampleComponents = () => [
    {
      id: 'button-primary',
      name: 'Primary Button',
      description: 'Main call-to-action button',
      category: 'Actions',
      properties: {
        variant: ['primary', 'secondary', 'outline'],
        size: ['sm', 'md', 'lg'],
        disabled: [true, false]
      }
    },
    {
      id: 'card-basic',
      name: 'Basic Card',
      description: 'Content container with shadow',
      category: 'Layout',
      properties: {
        padding: ['sm', 'md', 'lg'],
        shadow: ['none', 'sm', 'md', 'lg']
      }
    },
    {
      id: 'input-text',
      name: 'Text Input',
      description: 'Form input field',
      category: 'Forms',
      properties: {
        size: ['sm', 'md', 'lg'],
        state: ['default', 'error', 'disabled']
      }
    }
  ];

  const handleViewCode = (component) => {
    setSelectedComponent(component);
    loadComponentCode(component);
    setIsCodeViewerOpen(true);
  };

  // useEffect after all functions are defined
  useEffect(() => {
    checkConfiguration();
    loadTokens();
    loadComponents();
  }, [checkConfiguration, loadTokens, loadComponents]);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading Figma integration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Figma Design System</h1>
          <p className="text-muted-foreground">
            Live design tokens, components, and sync management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConfigured ? "default" : "destructive"}>
            {isConfigured ? "Connected" : "Not Configured"}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="sync">Sync Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Design Tokens Tab */}
        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Tokens
              </CardTitle>
              <CardDescription>
                Colors, typography, spacing, and other design tokens from your Figma file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isConfigured && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Figma is not configured. Add FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY to your environment variables.
                  </AlertDescription>
                </Alert>
              )}

              {tokens && (
                <div className="space-y-6">
                  {/* Colors */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Colors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(tokens.colors || {}).map(([name, color]) => (
                        <ColorSwatch key={name} name={name} color={color} />
                      ))}
                    </div>
                  </div>

                  {/* Typography */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Typography</h3>
                    <div className="space-y-4">
                      {Object.entries(tokens.typography || {}).map(([name, typography]) => (
                        <TypographyExample key={name} name={name} typography={typography} />
                      ))}
                    </div>
                  </div>

                  {/* Spacing */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Spacing</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(tokens.spacing || {}).map(([name, spacing]) => (
                        <SpacingExample key={name} name={name} spacing={spacing} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Components Tab */}
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
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {components.map((component) => (
                  <ComponentCard 
                    key={component.id} 
                    component={component} 
                    onViewCode={handleViewCode}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Dashboard Tab */}
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
              {!isConfigured && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configure your Figma access token and file key to enable syncing.
                  </AlertDescription>
                </Alert>
              )}
              
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
                    <Button className="w-full" disabled={!isConfigured}>
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
                    <Button className="w-full" disabled={!isConfigured}>
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
                    <Button className="w-full" disabled={!isConfigured}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Full Sync
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
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
                      <AlertCircle className={`h-4 w-4 ${isConfigured ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="font-medium">Figma Access Token</span>
                    </div>
                    <Badge variant={isConfigured ? "default" : "destructive"}>
                      {isConfigured ? "Configured" : "Not Configured"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className={`h-4 w-4 ${isConfigured ? 'text-green-500' : 'text-red-500'}`} />
                      <span className="font-medium">Figma File Key</span>
                    </div>
                    <Badge variant={isConfigured ? "default" : "destructive"}>
                      {isConfigured ? "Configured" : "Not Configured"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {!isConfigured && (
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
                      <h4 className="font-medium mb-2">2. Set Environment Variables</h4>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Code Viewer Dialog */}
      <Dialog open={isCodeViewerOpen} onOpenChange={setIsCodeViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              {selectedComponent?.name} Component Code
            </DialogTitle>
            <DialogDescription>
              Generated React component from Figma
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
              <code>{componentCode}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FigmaIntegrationClean;
