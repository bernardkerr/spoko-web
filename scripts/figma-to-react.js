#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import FigmaAPI from '../lib/figma.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Missing Figma configuration. Please set FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY in .env.local');
  process.exit(1);
}

class FigmaToReactGenerator {
  constructor(accessToken) {
    this.figmaAPI = new FigmaAPI(accessToken);
    this.generatedComponents = [];
  }

  async generateDesignPage(fileKey) {
    console.log('🎨 Fetching Figma design...');
    
    try {
      // Get the full file structure
      const fileData = await this.figmaAPI.getFile(fileKey);
      
      console.log(`📄 Found file: ${fileData.name}`);
      console.log(`📑 Pages: ${fileData.document.children.length}`);
      
      // Extract design structure
      const design = this.extractDesignStructure(fileData);
      
      // Generate React components for each frame
      await this.generateFrameComponents(design);
      
      // Generate the main design page
      await this.generateDesignPageComponent(design);
      
      console.log('✅ Design page generated successfully!');
      console.log(`📦 Generated ${this.generatedComponents.length} components`);
      
    } catch (error) {
      console.error('❌ Error generating design page:', error);
      throw error;
    }
  }

  extractDesignStructure(figmaData) {
    const design = {
      name: figmaData.name,
      pages: [],
      metadata: {
        lastModified: figmaData.lastModified,
        version: figmaData.version
      }
    };

    // Process each page in the Figma file
    figmaData.document.children.forEach(page => {
      if (page.type === 'CANVAS') {
        const pageData = {
          id: page.id,
          name: page.name,
          frames: [],
          backgroundColor: page.backgroundColor
        };

        // Process frames within the page
        page.children.forEach(child => {
          if (child.type === 'FRAME') {
            const frameData = this.extractFrameData(child);
            pageData.frames.push(frameData);
          }
        });

        design.pages.push(pageData);
      }
    });

    return design;
  }

  extractFrameData(frame) {
    return {
      id: frame.id,
      name: frame.name,
      type: frame.type,
      absoluteBoundingBox: frame.absoluteBoundingBox,
      backgroundColor: frame.backgroundColor,
      fills: frame.fills,
      strokes: frame.strokes,
      cornerRadius: frame.cornerRadius,
      layoutMode: frame.layoutMode,
      itemSpacing: frame.itemSpacing,
      paddingLeft: frame.paddingLeft,
      paddingRight: frame.paddingRight,
      paddingTop: frame.paddingTop,
      paddingBottom: frame.paddingBottom,
      children: frame.children ? frame.children.map(child => this.extractNodeData(child)) : []
    };
  }

  extractNodeData(node) {
    const baseData = {
      id: node.id,
      name: node.name,
      type: node.type,
      absoluteBoundingBox: node.absoluteBoundingBox,
      constraints: node.constraints
    };

    // Add type-specific properties
    switch (node.type) {
      case 'TEXT':
        return {
          ...baseData,
          characters: node.characters,
          style: node.style,
          fills: node.fills
        };
      
      case 'RECTANGLE':
      case 'ELLIPSE':
        return {
          ...baseData,
          fills: node.fills,
          strokes: node.strokes,
          cornerRadius: node.cornerRadius,
          effects: node.effects
        };
      
      case 'FRAME':
      case 'GROUP':
        return {
          ...baseData,
          backgroundColor: node.backgroundColor,
          fills: node.fills,
          children: node.children ? node.children.map(child => this.extractNodeData(child)) : []
        };
      
      default:
        return {
          ...baseData,
          fills: node.fills,
          children: node.children ? node.children.map(child => this.extractNodeData(child)) : []
        };
    }
  }

  async generateFrameComponents(design) {
    const componentsDir = path.join(process.cwd(), 'components', 'generated');
    await fs.mkdir(componentsDir, { recursive: true });

    for (const page of design.pages) {
      for (const frame of page.frames) {
        const componentName = this.sanitizeComponentName(frame.name);
        const componentCode = this.generateFrameComponent(frame, componentName);
        
        const componentPath = path.join(componentsDir, `${componentName}.jsx`);
        await fs.writeFile(componentPath, componentCode);
        
        this.generatedComponents.push({
          name: componentName,
          path: componentPath,
          frame: frame
        });
        
        console.log(`📦 Generated component: ${componentName}`);
      }
    }
  }

  sanitizeComponentName(name) {
    return name
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^\d/, 'Frame$&') // Prefix with 'Frame' if starts with number
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  }

  generateFrameComponent(frame, componentName) {
    const backgroundColor = this.getBackgroundColor(frame.backgroundColor || frame.fills);
    const borderRadius = frame.cornerRadius || 0;
    const padding = this.getPaddingObject(frame);
    
    const childrenElements = frame.children.map(child => this.generateElementJSX(child)).join('\n        ');

    const styleObject = {
      backgroundColor,
      borderRadius: `${borderRadius}px`,
      minHeight: `${frame.absoluteBoundingBox?.height || 200}px`,
      ...padding
    };

    return `import { Card, CardContent } from '@/components/ui/card';

export default function ${componentName}() {
  return (
    <Card 
      className="w-full"
      style={${JSON.stringify(styleObject, null, 8)}}
    >
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">${frame.name}</h3>
        ${childrenElements || '<p className="text-gray-500">Frame content</p>'}
      </CardContent>
    </Card>
  );
}`;
  }

  generateElementJSX(element) {
    switch (element.type) {
      case 'TEXT':
        return `<p className="text-sm">${element.characters || 'Text content'}</p>`;
      
      case 'RECTANGLE':
        const bgColor = this.getBackgroundColor(element.fills);
        const width = element.absoluteBoundingBox?.width || 100;
        const height = element.absoluteBoundingBox?.height || 40;
        
        // Check if it looks like a button (reasonable button dimensions)
        if (width > 60 && width < 300 && height > 20 && height < 80) {
          return `<div 
            className="inline-flex items-center justify-center px-4 py-2 mb-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 cursor-pointer"
            style={{
              backgroundColor: '${bgColor}',
              width: '${width}px',
              height: '${height}px'
            }}
          >
            ${element.name}
          </div>`;
        }
        
        return `<div 
          className="mb-2" 
          style={{
            backgroundColor: '${bgColor}',
            width: '${width}px',
            height: '${height}px',
            borderRadius: '${element.cornerRadius || 0}px'
          }}
        ></div>`;
      
      case 'FRAME':
      case 'GROUP':
        const childElements = element.children?.map(child => this.generateElementJSX(child)).join('\n        ') || '';
        return `<div className="mb-4">
        ${childElements}
        </div>`;
      
      default:
        return `<div className="mb-2 p-2 border border-gray-200 rounded text-xs text-gray-500">
          ${element.type}: ${element.name}
        </div>`;
    }
  }

  getBackgroundColor(fills) {
    if (!fills || !fills.length) return '#ffffff';
    
    const fill = fills[0];
    if (fill.type === 'SOLID' && fill.color) {
      const r = Math.round(fill.color.r * 255);
      const g = Math.round(fill.color.g * 255);
      const b = Math.round(fill.color.b * 255);
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    return '#ffffff';
  }

  getPaddingObject(frame) {
    const top = frame.paddingTop || 0;
    const right = frame.paddingRight || 0;
    const bottom = frame.paddingBottom || 0;
    const left = frame.paddingLeft || 0;
    
    const paddingObj = {};
    if (top) paddingObj.paddingTop = `${top}px`;
    if (right) paddingObj.paddingRight = `${right}px`;
    if (bottom) paddingObj.paddingBottom = `${bottom}px`;
    if (left) paddingObj.paddingLeft = `${left}px`;
    
    return paddingObj;
  }

  async generateDesignPageComponent(design) {
    // Remove duplicates and create unique component names
    const uniqueComponents = new Map();
    this.generatedComponents.forEach(comp => {
      const key = comp.name;
      if (!uniqueComponents.has(key)) {
        uniqueComponents.set(key, comp);
      }
    });
    
    const uniqueList = Array.from(uniqueComponents.values());
    
    const imports = uniqueList
      .map(comp => `import ${comp.name} from '@/components/generated/${comp.name}';`)
      .join('\n');

    const componentGrid = uniqueList
      .map(comp => `        <${comp.name} />`)
      .join('\n');

    const pageCode = `'use client';

import Link from 'next/link';
import { getAssetPath } from '@/lib/paths';
import { ArrowLeft, Figma } from 'lucide-react';
${imports}

export default function GeneratedDesignPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            href={getAssetPath('/')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          
          <Link 
            href={getAssetPath('/figma')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Figma className="h-4 w-4" />
            Figma Integration
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">${design.name}</h1>
          <p className="text-lg text-muted-foreground">
            Your Figma design converted to React components
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Generated from ${design.pages.length} page(s) • ${this.generatedComponents.length} component(s)
          </p>
        </div>

        {/* Generated Components Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
${componentGrid}
        </div>
      </div>
    </div>
  );
}`;

    const pagePath = path.join(process.cwd(), 'components', 'GeneratedDesignPage.jsx');
    await fs.writeFile(pagePath, pageCode);
    
    console.log('📄 Generated main design page component');
  }
}

async function main() {
  const generator = new FigmaToReactGenerator(FIGMA_ACCESS_TOKEN);
  await generator.generateDesignPage(FIGMA_FILE_KEY);
}

main().catch(console.error);
