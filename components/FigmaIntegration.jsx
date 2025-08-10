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
  Ruler, 
  Layers,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

// Helper Components
const ColorSwatch = ({ name, color }) => (
  <div className="space-y-2">
    <div 
      className="w-full h-16 rounded-lg border shadow-sm"
      style={{ backgroundColor: color }}
    />
    <div className="text-center">
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-muted-foreground">{color}</p>
    </div>
  </div>
);

const TypographyExample = ({ name, typography }) => (
  <div className="p-4 border rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <h4 className="text-sm font-medium">{name}</h4>
      <Badge variant="outline" className="text-xs">
        {typography.fontSize} / {typography.fontWeight}
      </Badge>
    </div>
    <p 
      style={{
        fontSize: typography.fontSize,
        fontWeight: typography.fontWeight,
        lineHeight: typography.lineHeight,
      }}
    >
      The quick brown fox jumps over the lazy dog
    </p>
  </div>
);

const SpacingExample = ({ name, spacing }) => (
  <div className="flex items-center gap-4 p-3 border rounded-lg">
    <div className="flex items-center gap-2">
      <div 
        className="bg-primary rounded"
        style={{ width: spacing, height: '16px' }}
      />
      <span className="text-sm font-medium">{name}</span>
    </div>
    <Badge variant="outline" className="text-xs">{spacing}</Badge>
  </div>
);

const ComponentCard = ({ component, onViewCode }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">{component.name}</CardTitle>
      <CardDescription className="text-sm">
        {component.description || 'Figma component'}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <Layers className="h-8 w-8 text-muted-foreground" />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={() => onViewCode(component)}>
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
 * FigmaIntegration - Comprehensive Figma integration with token browser, sync dashboard, and component library
 */
const FigmaIntegration = () => {
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



  const checkConfiguration = useCallback(async () => {
    try {
      // Check if we have the generated Figma files
      const hasGeneratedTokens = await checkForGeneratedFiles();
      setIsConfigured(hasGeneratedTokens);
    } catch (error) {
      console.error('Error checking configuration:', error);
      setIsConfigured(false);
    }
  }, []);

  const checkForGeneratedFiles = async () => {
    try {
      // Try to fetch the generated tailwind config to see if Figma is synced
      const response = await fetch('/tailwind.figma.js');
      return response.ok;
    } catch {
      return false;
    }
  };

  const loadTokens = useCallback(async () => {
    try {
      // Try to load from generated Tailwind config
      const response = await fetch('/tailwind.figma.js');
      if (response.ok) {
        const configText = await response.text();
        const tokens = parseTokensFromConfig(configText);
        setTokens(tokens);
        setLastSync(new Date().toISOString()); // Approximate
      } else {
        throw new Error('No generated config found');
      }
    } catch (error) {
      console.error('Error loading tokens:', error);
      setTokens(getSampleTokens());
    } finally {
      setLoading(false);
    }
  }, [parseTokensFromConfig]);

  const parseTokensFromConfig = useCallback((configText) => {
    try {
      // Extract the theme.extend object from the config text
      const themeMatch = configText.match(/"theme":\s*{\s*"extend":\s*({[\s\S]*?})\s*}/);
      if (themeMatch) {
        const themeExtend = JSON.parse(themeMatch[1]);
        return {
          colors: themeExtend.colors || {},
          typography: themeExtend.fontSize || {},
          spacing: themeExtend.spacing || {},
          effects: themeExtend.boxShadow || {},
        };
      }
    } catch (error) {
      console.error('Error parsing config:', error);
    }
    return getSampleTokens();
  }, []);

  const loadComponents = useCallback(async () => {
    try {
      // Try to load real synced components from static file
      const response = await fetch('/figma-components.json');
      if (response.ok) {
        const data = await response.json();
        if (data.components && data.components.length > 0) {
          setComponents(data.components);
          return;
        }
      }
    } catch (error) {
      console.log('No synced components found, using samples');
    }
    
    // Fallback to sample components if no real ones found
    setComponents(getSampleComponents());
  }, []);

  const handleSyncTokens = async () => {
    setSyncStatus('syncing');
    addToSyncLog('To sync tokens, run: npm run figma:tokens');
    addToSyncLog('This will generate tailwind.figma.js and styles/figma-tokens.css');
    addToSyncLog('Then refresh this page to see the updated tokens.');
    setSyncStatus('idle');
  };

  const handleSyncComponents = async () => {
    setSyncStatus('syncing');
    addToSyncLog('To sync components, run: npm run figma:components');
    addToSyncLog('This will extract components from your Figma file.');
    setSyncStatus('idle');
  };

  const handleSyncAll = async () => {
    setSyncStatus('syncing');
    addToSyncLog('To sync everything, run: npm run figma:sync');
    addToSyncLog('This will sync both tokens and components from Figma.');
    addToSyncLog('Then refresh this page to see the updates.');
    setSyncStatus('idle');
  };

  const loadComponentCode = async (component) => {
    try {
      const response = await fetch(`/figma/${component.name.toLowerCase()}.jsx`);
      if (response.ok) {
        const code = await response.text();
        setComponentCode(code);
        setSelectedComponent(component);
        setIsCodeViewerOpen(true);
      } else {
        // Fallback - show a sample code structure
        const sampleCode = `// ${component.name} Component\n// Generated from Figma\n\nimport React from 'react';\n\nconst ${component.name.charAt(0).toUpperCase() + component.name.slice(1)} = (props) => {\n  return (\n    <div className="figma-component">\n      {/* Component implementation */}\n    </div>\n  );\n};\n\nexport default ${component.name.charAt(0).toUpperCase() + component.name.slice(1)};`;
        setComponentCode(sampleCode);
        setSelectedComponent(component);
        setIsCodeViewerOpen(true);
      }
    } catch (error) {
      console.error('Error loading component code:', error);
    }
  };

  const addToSyncLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSyncLogs(prev => [...prev.slice(-9), { timestamp, message }]); // Keep last 10 entries
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
      'xs': '4px', 'sm': '8px', 'md': '16px', 'lg': '24px', 'xl': '32px',
    },
    effects: {
      'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      'shadow': '0 1px 3px 0 rgb(0 0 0 / 0.1)',
      'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
  });

  const getSampleComponents = () => [
    {
      id: 'button-primary',
      name: 'Primary Button',
      description: 'Main call-to-action button',
      category: 'Buttons',
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
        state: ['default', 'error', 'disabled'],
        placeholder: 'string'
      }
    }
  ];

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Syncing...';
      case 'success': return 'Sync Complete';
      case 'error': return 'Sync Failed';
      default: return lastSync ? `Last sync: ${new Date(lastSync).toLocaleString()}` : 'Never synced';
    }
  };

  // Initialize component data
  useEffect(() => {
    checkConfiguration();
    loadTokens();
    loadComponents();
  }, [checkConfiguration, loadTokens, loadComponents]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Sync Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Figma Design System</h1>
          <p className="text-muted-foreground">
            Live design tokens, components, and sync management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSyncTokens} 
              disabled={syncStatus === 'syncing'}
              variant="outline"
              size="sm"
            >
              <Palette className="h-4 w-4 mr-2" />
              Sync Tokens
            </Button>
            <Button 
              onClick={handleSyncComponents} 
              disabled={syncStatus === 'syncing'}
              variant="outline"
              size="sm"
            >
              <Layers className="h-4 w-4 mr-2" />
              Sync Components
            </Button>
            <Button 
              onClick={handleSyncAll} 
              disabled={syncStatus === 'syncing'}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
          </div>
        </div>
      </div>

      {/* Configuration Status */}
      {!isConfigured && (
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            No Figma tokens found. To sync from Figma:
            <br />1. Add FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY to your .env.local file
            <br />2. Run: npm run figma:tokens
            <br />3. Refresh this page
            <Button variant="link" className="p-0 h-auto ml-2" asChild>
              <a href="https://www.figma.com/developers/api#access-tokens" target="_blank" rel="noopener noreferrer">
                Get API Token <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="tokens" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="sync">Sync Dashboard</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Design Tokens Browser */}
        <TabsContent value="tokens" className="space-y-6">
          <div className="grid gap-6">
            {/* Colors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Color Palette
                </CardTitle>
                <CardDescription>
                  Colors from your Figma design system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {Object.entries(tokens?.colors || {}).map(([name, color]) => (
                    <ColorSwatch key={name} name={name} color={color} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Typography Scale
                </CardTitle>
                <CardDescription>
                  Text styles from your Figma design system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(tokens?.typography || {}).map(([name, typography]) => (
                    <TypographyExample key={name} name={name} typography={typography} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spacing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="h-5 w-5" />
                  Spacing System
                </CardTitle>
                <CardDescription>
                  Spacing tokens from your Figma design system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(tokens?.spacing || {}).map(([name, spacing]) => (
                    <SpacingExample key={name} name={name} spacing={spacing} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Component Library */}
        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Component Library
              </CardTitle>
              <CardDescription>
                Components synced from your Figma design system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {components.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {components.map((component, index) => (
                    <ComponentCard key={index} component={component} onViewCode={loadComponentCode} />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No components found.</p>
                  <p className="text-sm">Sync from Figma to see your component library.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync Dashboard */}
        <TabsContent value="sync" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sync Status</CardTitle>
                <CardDescription>
                  Monitor your Figma synchronization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Design Tokens</span>
                    <Badge variant={tokens ? "default" : "secondary"}>
                      {tokens ? "Synced" : "Not Synced"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>Components</span>
                    <Badge variant={components.length > 0 ? "default" : "secondary"}>
                      {components.length > 0 ? `${components.length} Components` : "Not Synced"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sync Log</CardTitle>
                <CardDescription>
                  Recent synchronization activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {syncLogs.length > 0 ? (
                    syncLogs.map((entry, index) => (
                      <div key={index} className="text-sm p-2 bg-muted rounded">
                        <span className="text-muted-foreground text-xs">{entry.timestamp}</span>
                        <div>{entry.message}</div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No sync activity yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Figma Configuration
              </CardTitle>
              <CardDescription>
                Manage your Figma integration settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Figma Integration</p>
                      <p className="text-sm text-muted-foreground">
                        {isConfigured ? "Tokens synced" : "No tokens found"}
                      </p>
                    </div>
                    <Badge variant={isConfigured ? "default" : "destructive"}>
                      {isConfigured ? "✓" : "✗"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-sm text-muted-foreground">
                        {isConfigured ? "Ready to use" : "Run sync commands"}
                      </p>
                    </div>
                    <Badge variant={isConfigured ? "default" : "secondary"}>
                      {isConfigured ? "Ready" : "Setup"}
                    </Badge>
                  </div>
                </div>
                
                <Alert>
                  <AlertDescription>
                    Add the following environment variables to your .env.local file:
                    <pre className="mt-2 p-2 bg-muted rounded text-xs">
{`FIGMA_ACCESS_TOKEN=your_figma_token_here
FIGMA_FILE_KEY=your_figma_file_key_here`}
                    </pre>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Code Viewer Dialog */}
      <Dialog open={isCodeViewerOpen} onOpenChange={setIsCodeViewerOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedComponent?.name} Component Code
            </DialogTitle>
            <DialogDescription>
              View the generated React component source code from Figma
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              <code>{componentCode}</code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};



export default FigmaIntegration;
