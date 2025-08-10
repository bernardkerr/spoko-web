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
    
    // Extract design tokens from the file
    const tokens = extractTokensFromFigmaFile(data);
    
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Token fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tokens from Figma',
      details: error.message 
    }, { status: 500 });
  }
}

function extractTokensFromFigmaFile(figmaData) {
  // Basic token extraction - this would be more sophisticated in a real implementation
  const tokens = {
    colors: {},
    typography: {},
    spacing: {},
    effects: {}
  };

  // Look for styles in the file
  if (figmaData.styles) {
    Object.values(figmaData.styles).forEach(style => {
      if (style.styleType === 'FILL') {
        // Extract color tokens
        const name = style.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        tokens.colors[name] = extractColorFromStyle(style);
      } else if (style.styleType === 'TEXT') {
        // Extract typography tokens
        const name = style.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        tokens.typography[name] = extractTypographyFromStyle(style);
      }
    });
  }

  // If no styles found, return sample tokens
  if (Object.keys(tokens.colors).length === 0) {
    tokens.colors = {
      'primary': '#3b82f6',
      'secondary': '#64748b',
      'accent': '#8b5cf6',
      'success': '#10b981',
      'warning': '#f59e0b',
      'error': '#ef4444',
    };
  }

  if (Object.keys(tokens.typography).length === 0) {
    tokens.typography = {
      'heading-1': { fontSize: '48px', fontWeight: '700', lineHeight: '1.2' },
      'heading-2': { fontSize: '36px', fontWeight: '600', lineHeight: '1.3' },
      'body': { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
    };
  }

  tokens.spacing = {
    'xs': '4px',
    'sm': '8px',
    'md': '16px',
    'lg': '24px',
    'xl': '32px',
  };

  return tokens;
}

function extractColorFromStyle(style) {
  // Simplified color extraction
  return '#3b82f6'; // Default blue
}

function extractTypographyFromStyle(style) {
  // Simplified typography extraction
  return { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' };
}
