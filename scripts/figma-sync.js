#!/usr/bin/env node

import dotenv from 'dotenv';
import FigmaTokenGenerator from '../lib/figma-tokens.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Missing Figma configuration. Please set FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY in .env.local');
  console.error('📖 See .env.example for setup instructions');
  process.exit(1);
}

async function main() {
  const generator = new FigmaTokenGenerator(FIGMA_ACCESS_TOKEN);
  
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'tokens':
        console.log('🎨 Syncing design tokens from Figma...');
        await generator.generateTailwindConfig(FIGMA_FILE_KEY);
        await generator.generateCSSVariables(FIGMA_FILE_KEY);
        console.log('✅ Design tokens synced successfully!');
        break;
        
      case 'components':
        console.log('🧩 Syncing components from Figma...');
        const componentIds = process.argv.slice(3);
        if (componentIds.length === 0) {
          console.error('❌ Please provide component IDs: npm run figma:components <id1> <id2> ...');
          process.exit(1);
        }
        await generator.generateComponents(FIGMA_FILE_KEY, componentIds);
        console.log('✅ Components synced successfully!');
        break;
        
      case 'content':
        console.log('📝 Syncing content from Figma...');
        const textNodeIds = process.argv.slice(3);
        if (textNodeIds.length === 0) {
          console.error('❌ Please provide text node IDs: npm run figma:content <id1> <id2> ...');
          process.exit(1);
        }
        await generator.generateContent(FIGMA_FILE_KEY, textNodeIds);
        console.log('✅ Content synced successfully!');
        break;
        
      case 'all':
        console.log('🚀 Full sync from Figma...');
        await generator.syncAll(FIGMA_FILE_KEY, {
          generateTokens: true,
          generateComponents: false, // Requires component IDs
          generateContent: false,    // Requires text node IDs
        });
        console.log('✅ Full sync completed!');
        break;
        
      default:
        console.log(`
🎨 Figma Sync Tool

Usage:
  npm run figma:tokens     - Sync design tokens (colors, typography, etc.)
  npm run figma:components <id1> <id2> ... - Sync specific components
  npm run figma:content <id1> <id2> ...    - Sync text content
  npm run figma:all        - Sync tokens only (components need IDs)

Examples:
  npm run figma:tokens
  npm run figma:components 123:456 789:012
  npm run figma:content 345:678
  npm run figma:all

Setup:
  1. Copy .env.example to .env.local
  2. Add your Figma access token and file key
  3. Run any of the commands above
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
