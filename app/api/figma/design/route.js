import { NextResponse } from 'next/server';
import FigmaAPI from '@/lib/figma.js';

export async function GET(request) {
  try {
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    const figmaFileKey = process.env.FIGMA_FILE_KEY;
    
    if (!figmaToken || !figmaFileKey) {
      return NextResponse.json({ 
        error: 'Figma credentials not configured' 
      }, { status: 400 });
    }

    const figmaAPI = new FigmaAPI(figmaToken);
    
    // Get the full file structure
    const fileData = await figmaAPI.getFile(figmaFileKey);
    
    // Extract pages and frames from the design
    const design = extractDesignStructure(fileData);
    
    return NextResponse.json({ design });
  } catch (error) {
    console.error('Design fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch design from Figma',
      details: error.message 
    }, { status: 500 });
  }
}

function extractDesignStructure(figmaData) {
  const design = {
    name: figmaData.name,
    pages: [],
    metadata: {
      lastModified: figmaData.lastModified,
      version: figmaData.version,
      thumbnailUrl: figmaData.thumbnailUrl
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
          const frameData = extractFrameData(child);
          pageData.frames.push(frameData);
        }
      });

      design.pages.push(pageData);
    }
  });

  return design;
}

function extractFrameData(frame) {
  return {
    id: frame.id,
    name: frame.name,
    type: frame.type,
    absoluteBoundingBox: frame.absoluteBoundingBox,
    backgroundColor: frame.backgroundColor,
    fills: frame.fills,
    strokes: frame.strokes,
    strokeWeight: frame.strokeWeight,
    cornerRadius: frame.cornerRadius,
    effects: frame.effects,
    constraints: frame.constraints,
    layoutMode: frame.layoutMode,
    layoutGrow: frame.layoutGrow,
    layoutAlign: frame.layoutAlign,
    itemSpacing: frame.itemSpacing,
    paddingLeft: frame.paddingLeft,
    paddingRight: frame.paddingRight,
    paddingTop: frame.paddingTop,
    paddingBottom: frame.paddingBottom,
    children: frame.children ? frame.children.map(child => extractNodeData(child)) : []
  };
}

function extractNodeData(node) {
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
        characterStyleOverrides: node.characterStyleOverrides,
        styleOverrideTable: node.styleOverrideTable,
        fills: node.fills
      };
    
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'POLYGON':
    case 'STAR':
    case 'VECTOR':
      return {
        ...baseData,
        fills: node.fills,
        strokes: node.strokes,
        strokeWeight: node.strokeWeight,
        cornerRadius: node.cornerRadius,
        effects: node.effects
      };
    
    case 'FRAME':
    case 'GROUP':
      return {
        ...baseData,
        backgroundColor: node.backgroundColor,
        fills: node.fills,
        strokes: node.strokes,
        effects: node.effects,
        children: node.children ? node.children.map(child => extractNodeData(child)) : []
      };
    
    case 'INSTANCE':
    case 'COMPONENT':
      return {
        ...baseData,
        componentId: node.componentId,
        componentProperties: node.componentProperties,
        fills: node.fills,
        strokes: node.strokes,
        effects: node.effects,
        children: node.children ? node.children.map(child => extractNodeData(child)) : []
      };
    
    default:
      return {
        ...baseData,
        fills: node.fills,
        strokes: node.strokes,
        effects: node.effects,
        children: node.children ? node.children.map(child => extractNodeData(child)) : []
      };
  }
}
