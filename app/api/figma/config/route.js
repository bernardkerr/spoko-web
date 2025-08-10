import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const figmaToken = process.env.FIGMA_ACCESS_TOKEN;
    const figmaFileKey = process.env.FIGMA_FILE_KEY;
    
    const configured = !!(figmaToken && figmaFileKey);
    
    return NextResponse.json({
      configured,
      hasToken: !!figmaToken,
      hasFileKey: !!figmaFileKey,
      fileKey: configured ? figmaFileKey : null
    });
  } catch (error) {
    console.error('Config check error:', error);
    return NextResponse.json({ 
      configured: false, 
      error: 'Configuration check failed' 
    }, { status: 500 });
  }
}
