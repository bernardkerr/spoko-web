import FigmaAPI from './figma.js';
import fs from 'fs/promises';
import path from 'path';

class FigmaTokenGenerator {
  constructor(accessToken) {
    this.figma = new FigmaAPI(accessToken);
  }

  /**
   * Generate Tailwind config from Figma design tokens
   */
  async generateTailwindConfig(fileKey, outputPath = './tailwind.figma.js') {
    try {
      const tokens = await this.figma.extractDesignTokens(fileKey);
      const tailwindConfig = this.convertTokensToTailwind(tokens);
      
      const configContent = `// Generated from Figma design tokens
/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: ${JSON.stringify(tailwindConfig, null, 2)}
  }
};`;

      await fs.writeFile(outputPath, configContent);
      console.log(`Tailwind config generated at ${outputPath}`);
      return tailwindConfig;
    } catch (error) {
      console.error('Error generating Tailwind config:', error);
      throw error;
    }
  }

  /**
   * Convert Figma tokens to Tailwind format
   */
  convertTokensToTailwind(tokens) {
    const tailwindConfig = {
      colors: {},
      fontFamily: {},
      fontSize: {},
      spacing: {},
      boxShadow: {},
    };

    // Convert colors
    Object.entries(tokens.colors).forEach(([name, color]) => {
      const tailwindName = this.sanitizeName(name);
      tailwindConfig.colors[tailwindName] = color.value || color;
    });

    // Convert typography
    Object.entries(tokens.typography).forEach(([name, typography]) => {
      const tailwindName = this.sanitizeName(name);
      if (typography.fontFamily) {
        tailwindConfig.fontFamily[tailwindName] = typography.fontFamily;
      }
      if (typography.fontSize) {
        tailwindConfig.fontSize[tailwindName] = typography.fontSize;
      }
    });

    // Convert effects to box shadows
    Object.entries(tokens.effects).forEach(([name, effect]) => {
      const tailwindName = this.sanitizeName(name);
      tailwindConfig.boxShadow[tailwindName] = effect.value || effect;
    });

    return tailwindConfig;
  }

  /**
   * Generate CSS custom properties from Figma tokens
   */
  async generateCSSVariables(fileKey, outputPath = './styles/figma-tokens.css') {
    try {
      const tokens = await this.figma.extractDesignTokens(fileKey);
      const cssContent = this.convertTokensToCSS(tokens);
      
      await fs.writeFile(outputPath, cssContent);
      console.log(`CSS variables generated at ${outputPath}`);
      return cssContent;
    } catch (error) {
      console.error('Error generating CSS variables:', error);
      throw error;
    }
  }

  /**
   * Convert tokens to CSS custom properties
   */
  convertTokensToCSS(tokens) {
    let css = `:root {
  /* Generated from Figma design tokens */
`;

    // Add color variables
    Object.entries(tokens.colors).forEach(([name, color]) => {
      const cssName = this.sanitizeName(name, '--');
      // Handle different color formats
      let colorValue;
      if (typeof color === 'string') {
        colorValue = color;
      } else if (color.value) {
        colorValue = color.value;
      } else if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
        // Convert RGB values (0-1) to hex
        const r = Math.round(color.r * 255);
        const g = Math.round(color.g * 255);
        const b = Math.round(color.b * 255);
        colorValue = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      } else {
        // Skip invalid color values
        console.warn(`Skipping invalid color: ${name}`, color);
        return;
      }
      css += `  ${cssName}: ${colorValue};
`;
    });

    // Add typography variables
    Object.entries(tokens.typography).forEach(([name, typography]) => {
      const cssName = this.sanitizeName(name, '--');
      if (typography.fontSize) {
        css += `  ${cssName}-size: ${typography.fontSize};
`;
      }
      if (typography.lineHeight) {
        css += `  ${cssName}-line-height: ${typography.lineHeight};
`;
      }
      if (typography.fontWeight) {
        css += `  ${cssName}-weight: ${typography.fontWeight};
`;
      }
    });

    // Add spacing variables
    Object.entries(tokens.spacing).forEach(([name, spacing]) => {
      const cssName = this.sanitizeName(name, '--');
      css += `  ${cssName}: ${spacing.value || spacing};
`;
    });

    css += '}';
    return css;
  }

  /**
   * Generate React components from Figma components
   */
  async generateComponents(fileKey, componentIds, outputDir = './components/figma') {
    try {
      const components = await this.figma.generateReactComponents(fileKey, componentIds);
      
      // Ensure output directory exists
      await fs.mkdir(outputDir, { recursive: true });
      
      for (const component of components) {
        await this.writeReactComponent(component, outputDir);
      }
      
      console.log(`Generated ${components.length} components in ${outputDir}`);
      return components;
    } catch (error) {
      console.error('Error generating components:', error);
      throw error;
    }
  }

  /**
   * Write React component to file
   */
  async writeReactComponent(component, outputDir) {
    const fileName = `${component.name}.jsx`;
    const filePath = path.join(outputDir, fileName);
    
    const componentContent = `import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ${component.name} - Generated from Figma
 */
export const ${component.name} = ({ 
  ${component.props.map(prop => `${prop.name} = ${JSON.stringify(prop.defaultValue)}`).join(',\n  ')},
  className,
  children,
  ...props
}) => {
  return (
    ${component.jsx}
  );
};

export default ${component.name};
`;

    await fs.writeFile(filePath, componentContent);
    console.log(`Generated component: ${fileName}`);
  }

  /**
   * Generate content from Figma text layers
   */
  async generateContent(fileKey, textNodeIds, outputPath = './content/figma-content.json') {
    try {
      const nodes = await this.figma.getNodes(fileKey, textNodeIds);
      const content = {};
      
      Object.entries(nodes.nodes).forEach(([nodeId, node]) => {
        if (node.document && node.document.type === 'TEXT') {
          const key = this.sanitizeName(node.document.name);
          content[key] = {
            text: node.document.characters,
            style: node.document.style,
            name: node.document.name,
          };
        }
      });
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });
      
      await fs.writeFile(outputPath, JSON.stringify(content, null, 2));
      console.log(`Content generated at ${outputPath}`);
      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  /**
   * Sanitize names for CSS/JS usage
   */
  sanitizeName(name, prefix = '') {
    return prefix + name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Sync all design assets from Figma
   */
  async syncAll(fileKey, options = {}) {
    const {
      generateTokens = true,
      generateComponents = true,
      generateContent = true,
      componentIds = [],
      textNodeIds = [],
    } = options;

    const results = {};

    try {
      if (generateTokens) {
        console.log('Generating design tokens...');
        results.tokens = await this.generateTailwindConfig(fileKey);
        results.cssVariables = await this.generateCSSVariables(fileKey);
      }

      if (generateComponents && componentIds.length > 0) {
        console.log('Generating components...');
        results.components = await this.generateComponents(fileKey, componentIds);
      }

      if (generateContent && textNodeIds.length > 0) {
        console.log('Generating content...');
        results.content = await this.generateContent(fileKey, textNodeIds);
      }

      console.log('Figma sync completed successfully!');
      return results;
    } catch (error) {
      console.error('Error during Figma sync:', error);
      throw error;
    }
  }
}

export default FigmaTokenGenerator;
