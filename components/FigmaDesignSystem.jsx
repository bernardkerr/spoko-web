'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

/**
 * FigmaDesignSystem - A component to showcase and manage Figma design tokens
 */
export const FigmaDesignSystem = ({ tokens = {}, onSync }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      if (onSync) {
        await onSync();
        setLastSync(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Figma Design System</h1>
          <p className="text-muted-foreground">
            Manage and sync your design tokens from Figma
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastSync && (
            <Badge variant="secondary">
              Last sync: {lastSync}
            </Badge>
          )}
          <Button onClick={handleSync} disabled={isLoading}>
            {isLoading ? 'Syncing...' : 'Sync from Figma'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Palette</CardTitle>
              <CardDescription>
                Colors synced from your Figma design system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(tokens.colors || {}).map(([name, color]) => (
                  <ColorSwatch key={name} name={name} color={color} />
                ))}
                {Object.keys(tokens.colors || {}).length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    No colors found. Sync from Figma to see your color palette.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography Scale</CardTitle>
              <CardDescription>
                Text styles from your Figma design system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(tokens.typography || {}).map(([name, typography]) => (
                  <TypographyExample key={name} name={name} typography={typography} />
                ))}
                {Object.keys(tokens.typography || {}).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No typography styles found. Sync from Figma to see your text styles.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spacing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spacing System</CardTitle>
              <CardDescription>
                Spacing tokens from your Figma design system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(tokens.spacing || {}).map(([name, spacing]) => (
                  <SpacingExample key={name} name={name} spacing={spacing} />
                ))}
                {Object.keys(tokens.spacing || {}).length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No spacing tokens found. Sync from Figma to see your spacing system.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Effects & Shadows</CardTitle>
              <CardDescription>
                Shadow and effect styles from your Figma design system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(tokens.effects || {}).map(([name, effect]) => (
                  <EffectExample key={name} name={name} effect={effect} />
                ))}
                {Object.keys(tokens.effects || {}).length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    No effects found. Sync from Figma to see your shadow and effect styles.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ColorSwatch = ({ name, color }) => {
  const colorValue = typeof color === 'string' ? color : color.value || '#000000';
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        className="w-16 h-16 rounded-lg border border-border shadow-sm"
        style={{ backgroundColor: colorValue }}
      />
      <div className="text-center">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted-foreground font-mono">{colorValue}</div>
      </div>
    </div>
  );
};

const TypographyExample = ({ name, typography }) => {
  const fontSize = typography.fontSize || '16px';
  const fontWeight = typography.fontWeight || '400';
  const lineHeight = typography.lineHeight || '1.5';
  
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div className="flex-1">
        <div className="text-sm font-medium text-muted-foreground mb-1">{name}</div>
        <div
          style={{
            fontSize,
            fontWeight,
            lineHeight,
          }}
        >
          The quick brown fox jumps over the lazy dog
        </div>
      </div>
      <div className="text-xs text-muted-foreground font-mono ml-4">
        {fontSize} / {fontWeight} / {lineHeight}
      </div>
    </div>
  );
};

const SpacingExample = ({ name, spacing }) => {
  const spacingValue = typeof spacing === 'string' ? spacing : spacing.value || '16px';
  
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium">{name}</div>
        <div
          className="bg-primary h-4 rounded"
          style={{ width: spacingValue }}
        />
      </div>
      <div className="text-xs text-muted-foreground font-mono">{spacingValue}</div>
    </div>
  );
};

const EffectExample = ({ name, effect }) => {
  const effectValue = typeof effect === 'string' ? effect : effect.value || '0 2px 4px rgba(0,0,0,0.1)';
  
  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="text-sm font-medium mb-3">{name}</div>
      <div
        className="w-full h-16 bg-background rounded border"
        style={{ boxShadow: effectValue }}
      />
      <div className="text-xs text-muted-foreground font-mono mt-2">{effectValue}</div>
    </div>
  );
};

export default FigmaDesignSystem;
