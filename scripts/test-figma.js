#!/usr/bin/env node

const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config({ path: '.env.local' });

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;

async function testFigmaConnection() {
  console.log('🔍 Testing Figma Connection...\n');

  // Check if credentials are provided
  if (!FIGMA_ACCESS_TOKEN) {
    console.error('❌ FIGMA_ACCESS_TOKEN is missing from .env.local');
    return false;
  }

  if (!FIGMA_FILE_KEY) {
    console.error('❌ FIGMA_FILE_KEY is missing from .env.local');
    return false;
  }

  console.log('✅ Environment variables found');
  console.log(`📄 File Key: ${FIGMA_FILE_KEY}`);
  console.log(`🔑 Token: ${FIGMA_ACCESS_TOKEN.substring(0, 10)}...`);
  console.log('');

  // Test API connection
  try {
    console.log('🌐 Testing API connection...');
    
    const response = await axios.get(`https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
      timeout: 10000, // 10 second timeout
    });

    console.log('✅ Successfully connected to Figma API!');
    console.log(`📋 File Name: "${response.data.name}"`);
    console.log(`👤 Last Modified: ${new Date(response.data.lastModified).toLocaleString()}`);
    console.log(`🎨 Version: ${response.data.version}`);
    
    // Check for styles
    const styles = response.data.styles || {};
    const styleCount = Object.keys(styles).length;
    console.log(`🎭 Styles found: ${styleCount}`);
    
    if (styleCount > 0) {
      console.log('   Style types:');
      const styleTypes = {};
      Object.values(styles).forEach(style => {
        styleTypes[style.styleType] = (styleTypes[style.styleType] || 0) + 1;
      });
      Object.entries(styleTypes).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
    }

    // Check for components
    const components = response.data.components || {};
    const componentCount = Object.keys(components).length;
    console.log(`🧩 Components found: ${componentCount}`);

    console.log('\n🎉 Your Figma integration is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run figma:tokens');
    console.log('2. Visit: http://localhost:3000/figma');
    
    return true;

  } catch (error) {
    console.error('❌ Failed to connect to Figma API');
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.err || error.response.data?.message || 'Unknown error';
      
      switch (status) {
        case 401:
          console.error('🔐 Authentication failed - check your access token');
          console.error('   Make sure your token is valid and not expired');
          break;
        case 403:
          console.error('🚫 Access denied - check file permissions');
          console.error('   Make sure the file is accessible with your token');
          break;
        case 404:
          console.error('📄 File not found - check your file key');
          console.error('   Make sure the file key is correct and the file exists');
          break;
        default:
          console.error(`🌐 HTTP ${status}: ${message}`);
      }
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network error - check your internet connection');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏱️  Request timeout - Figma API might be slow');
    } else {
      console.error(`🔧 Error: ${error.message}`);
    }
    
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify your access token at: https://www.figma.com/developers/api#access-tokens');
    console.error('2. Check the file URL format: https://www.figma.com/file/FILE_KEY/...');
    console.error('3. Ensure the file is not private or restricted');
    
    return false;
  }
}

// Helper function to validate file key format
function validateFileKey(fileKey) {
  // Figma file keys are typically alphanumeric with some special characters
  const fileKeyPattern = /^[a-zA-Z0-9]+$/;
  return fileKeyPattern.test(fileKey.replace(/[\/\-]/g, ''));
}

// Helper function to validate token format
function validateToken(token) {
  // Figma tokens are typically 40+ characters
  return token && token.length >= 40;
}

async function main() {
  console.log('🎨 Figma Connection Tester\n');
  
  // Basic validation
  if (FIGMA_ACCESS_TOKEN && !validateToken(FIGMA_ACCESS_TOKEN)) {
    console.warn('⚠️  Warning: Token format looks unusual (should be 40+ characters)');
  }
  
  if (FIGMA_FILE_KEY && !validateFileKey(FIGMA_FILE_KEY)) {
    console.warn('⚠️  Warning: File key format looks unusual');
  }
  
  const success = await testFigmaConnection();
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('💥 Unexpected error:', error.message);
  process.exit(1);
});
