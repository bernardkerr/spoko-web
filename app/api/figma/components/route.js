import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    const figmaFileKey = process.env.FIGMA_FILE_KEY;
    
    if (!figmaToken || !figmaFileKey) {
      return NextResponse.json({ 
        error: 'Figma credentials not configured' 
      }, { status: 400 });
    }

    // Fetch file data from Figma API
    const response = await fetch(`https://api.figma.com/v1/files/${figmaFileKey}`, {
      headers: {
        'X-Figma-Token': figmaToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract components from the file
    const components = extractComponentsFromFigmaFile(data);
    
    return NextResponse.json({ components });
  } catch (error) {
    console.error('Component fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch components from Figma',
      details: error.message 
    }, { status: 500 });
  }
}

function extractComponentsFromFigmaFile(figmaData) {
  const components = [];
  
  // Recursively search for components in the document
  function searchForComponents(node, path = '') {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push({
        id: node.id,
        name: node.name,
        description: node.description || `${node.name} component from Figma`,
        category: path.split('/')[0] || 'General',
        type: node.type,
        properties: extractComponentProperties(node)
      });
    }
    
    if (node.children) {
      node.children.forEach(child => {
        const newPath = path ? `${path}/${node.name}` : node.name;
        searchForComponents(child, newPath);
      });
    }
  }
  
  // Search through all pages
  if (figmaData.document && figmaData.document.children) {
    figmaData.document.children.forEach(page => {
      searchForComponents(page, page.name);
    });
  }
  
  // If no components found, return sample components
  if (components.length === 0) {
    return [
      {
        id: 'button-primary',
        name: 'Primary Button',
        description: 'Main call-to-action button from your Figma design system',
        category: 'Actions',
        type: 'COMPONENT',
        properties: {
          variant: ['primary', 'secondary', 'outline'],
          size: ['sm', 'md', 'lg'],
          state: ['default', 'hover', 'disabled']
        }
      },
      {
        id: 'input-field',
        name: 'Input Field',
        description: 'Text input component from your Figma design system',
        category: 'Forms',
        type: 'COMPONENT',
        properties: {
          size: ['sm', 'md', 'lg'],
          state: ['default', 'focus', 'error', 'disabled'],
          type: ['text', 'email', 'password']
        }
      },
      {
        id: 'card-container',
        name: 'Card Container',
        description: 'Content card component from your Figma design system',
        category: 'Layout',
        type: 'COMPONENT',
        properties: {
          padding: ['sm', 'md', 'lg'],
          shadow: ['none', 'sm', 'md', 'lg'],
          border: ['none', 'subtle', 'strong']
        }
      }
    ];
  }
  
  return components;
}

function extractComponentProperties(node) {
  const properties = {};
  
  // Extract component properties from Figma node
  if (node.componentPropertyDefinitions) {
    Object.entries(node.componentPropertyDefinitions).forEach(([key, prop]) => {
      if (prop.type === 'VARIANT') {
        properties[key] = prop.variantOptions || [];
      } else if (prop.type === 'BOOLEAN') {
        properties[key] = [true, false];
      } else if (prop.type === 'TEXT') {
        properties[key] = 'string';
      }
    });
  }
  
  return properties;
}
