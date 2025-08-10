#!/usr/bin/env node

import dotenv from 'dotenv';
import FigmaAPI from '../lib/figma.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_ACCESS_TOKEN || !FIGMA_FILE_KEY) {
  console.error('❌ Missing Figma configuration. Please set FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY in .env.local');
  process.exit(1);
}

async function listComponents() {
  try {
    console.log('🔍 Fetching components from Figma file...\n');
    
    const figma = new FigmaAPI(FIGMA_ACCESS_TOKEN);
    const fileData = await figma.getFile(FIGMA_FILE_KEY);
    
    const components = [];
    
    // Recursively find all components
    function findComponents(node, path = '') {
      if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
        components.push({
          id: node.id,
          name: node.name,
          type: node.type,
          path: path,
          description: node.description || 'No description'
        });
      }
      
      if (node.children) {
        const currentPath = path ? `${path} > ${node.name}` : node.name;
        node.children.forEach(child => findComponents(child, currentPath));
      }
    }
    
    // Search through all pages
    fileData.document.children.forEach(page => {
      findComponents(page, page.name);
    });
    
    if (components.length === 0) {
      console.log('❌ No components found in this Figma file.');
      console.log('💡 Make sure your file contains components (not just frames or groups).');
      return;
    }
    
    console.log(`✅ Found ${components.length} component(s):\n`);
    
    // Group by type
    const componentsByType = components.reduce((acc, comp) => {
      acc[comp.type] = acc[comp.type] || [];
      acc[comp.type].push(comp);
      return acc;
    }, {});
    
    Object.entries(componentsByType).forEach(([type, comps]) => {
      console.log(`📦 ${type}S (${comps.length}):`);
      comps.forEach(comp => {
        console.log(`   ID: ${comp.id}`);
        console.log(`   Name: ${comp.name}`);
        console.log(`   Path: ${comp.path}`);
        if (comp.description !== 'No description') {
          console.log(`   Description: ${comp.description}`);
        }
        console.log('');
      });
    });
    
    console.log('🚀 To sync specific components, run:');
    console.log(`   npm run figma:components ${components.slice(0, 3).map(c => c.id).join(' ')}`);
    console.log('\n💡 You can sync multiple components at once by listing their IDs.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listComponents();
