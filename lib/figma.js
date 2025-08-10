import axios from 'axios';

class FigmaAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseURL = 'https://api.figma.com/v1';
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-Figma-Token': accessToken,
      },
    });
  }

  /**
   * Get file information and nodes
   */
  async getFile(fileKey) {
    try {
      const response = await this.client.get(`/files/${fileKey}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching Figma file:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get specific nodes from a file
   */
  async getNodes(fileKey, nodeIds) {
    try {
      const response = await this.client.get(`/files/${fileKey}/nodes`, {
        params: {
          ids: Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Figma nodes:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Export images from Figma
   */
  async exportImages(fileKey, nodeIds, options = {}) {
    const defaultOptions = {
      format: 'png',
      scale: 2,
      ...options,
    };

    try {
      const response = await this.client.get(`/images/${fileKey}`, {
        params: {
          ids: Array.isArray(nodeIds) ? nodeIds.join(',') : nodeIds,
          ...defaultOptions,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting Figma images:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Extract design tokens from Figma styles
   */
  async extractDesignTokens(fileKey) {
    try {
      const file = await this.getFile(fileKey);
      const tokens = {
        colors: {},
        typography: {},
        spacing: {},
        effects: {},
      };

      // Extract color styles
      if (file.styles) {
        Object.values(file.styles).forEach(style => {
          if (style.styleType === 'FILL') {
            tokens.colors[style.name] = this.extractColorFromStyle(style);
          } else if (style.styleType === 'TEXT') {
            tokens.typography[style.name] = this.extractTypographyFromStyle(style);
          } else if (style.styleType === 'EFFECT') {
            tokens.effects[style.name] = this.extractEffectFromStyle(style);
          }
        });
      }

      return tokens;
    } catch (error) {
      console.error('Error extracting design tokens:', error);
      throw error;
    }
  }

  /**
   * Helper methods for token extraction
   */
  extractColorFromStyle(style) {
    // Extract color from style - Figma styles don't contain the actual color values
    // We need to get them from the style nodes or use predefined mappings
    // For now, let's extract from common color names or return a default
    const colorName = style.name.toLowerCase();
    
    // Common color mappings based on typical design system colors
    const colorMappings = {
      'white': '#ffffff',
      'black': '#000000',
      'slate/50': '#f8fafc',
      'slate/100': '#f1f5f9',
      'slate/200': '#e2e8f0',
      'slate/300': '#cbd5e1',
      'slate/400': '#94a3b8',
      'slate/500': '#64748b',
      'slate/600': '#475569',
      'slate/700': '#334155',
      'slate/800': '#1e293b',
      'slate/900': '#0f172a',
      'gray/50': '#f9fafb',
      'gray/100': '#f3f4f6',
      'gray/200': '#e5e7eb',
      'gray/300': '#d1d5db',
      'gray/400': '#9ca3af',
      'gray/500': '#6b7280',
      'gray/600': '#4b5563',
      'gray/700': '#374151',
      'gray/800': '#1f2937',
      'gray/900': '#111827',
    };
    
    return colorMappings[colorName] || `hsl(var(--${style.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}))`;
  }

  extractTypographyFromStyle(style) {
    return {
      name: style.name,
      type: 'typography',
      // Add actual typography extraction logic here
    };
  }

  extractEffectFromStyle(style) {
    return {
      name: style.name,
      type: 'effect',
      // Add actual effect extraction logic here
    };
  }

  /**
   * Convert Figma components to React components
   */
  async generateReactComponents(fileKey, componentIds) {
    try {
      const nodes = await this.getNodes(fileKey, componentIds);
      const components = [];

      Object.entries(nodes.nodes).forEach(([nodeId, node]) => {
        if (node.document) {
          const component = this.convertNodeToReactComponent(node.document);
          components.push(component);
        }
      });

      return components;
    } catch (error) {
      console.error('Error generating React components:', error);
      throw error;
    }
  }

  convertNodeToReactComponent(node) {
    // Basic component structure
    const componentName = node.name.replace(/[^a-zA-Z0-9]/g, '');
    
    return {
      name: componentName,
      props: this.extractPropsFromNode(node),
      jsx: this.generateJSXFromNode(node),
      styles: this.extractStylesFromNode(node),
    };
  }

  extractPropsFromNode(node) {
    // Extract potential props from component variants and properties
    const props = [];
    
    if (node.componentPropertyDefinitions) {
      Object.entries(node.componentPropertyDefinitions).forEach(([key, prop]) => {
        props.push({
          name: key,
          type: prop.type,
          defaultValue: prop.defaultValue,
        });
      });
    }

    return props;
  }

  generateJSXFromNode(node) {
    // Generate basic JSX structure
    const tagName = this.getHTMLTagFromNode(node);
    const className = this.generateClassNameFromNode(node);
    
    return `<${tagName} className="${className}">
  {/* Generated from Figma */}
  {children}
</${tagName}>`;
  }

  extractStylesFromNode(node) {
    // Extract CSS styles from Figma node
    const styles = {};
    
    if (node.fills && node.fills.length > 0) {
      styles.backgroundColor = this.convertFillToCSS(node.fills[0]);
    }
    
    if (node.strokes && node.strokes.length > 0) {
      styles.border = this.convertStrokeToCSS(node.strokes[0]);
    }
    
    if (node.cornerRadius) {
      styles.borderRadius = `${node.cornerRadius}px`;
    }

    return styles;
  }

  getHTMLTagFromNode(node) {
    // Determine appropriate HTML tag based on node type
    switch (node.type) {
      case 'TEXT':
        return 'p';
      case 'RECTANGLE':
      case 'ELLIPSE':
        return 'div';
      case 'FRAME':
        return 'section';
      default:
        return 'div';
    }
  }

  generateClassNameFromNode(node) {
    // Generate Tailwind classes based on Figma properties
    const classes = [];
    
    // Add layout classes
    if (node.layoutMode === 'HORIZONTAL') {
      classes.push('flex', 'flex-row');
    } else if (node.layoutMode === 'VERTICAL') {
      classes.push('flex', 'flex-col');
    }
    
    // Add spacing classes
    if (node.paddingLeft || node.paddingTop) {
      classes.push('p-4'); // Simplified for now
    }
    
    return classes.join(' ');
  }

  convertFillToCSS(fill) {
    if (!fill || !fill.type) {
      return 'transparent';
    }
    
    if (fill.type === 'SOLID') {
      const { r, g, b, a = 1 } = fill.color || {};
      return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }
    return 'transparent';
  }

  convertStrokeToCSS(stroke) {
    // Convert Figma stroke to CSS border
    return '1px solid #000'; // Simplified for now
  }
}

export default FigmaAPI;
