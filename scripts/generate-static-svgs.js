#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Pre-built SVG diagrams with CSS variable theming
const staticSVGs = {
  flowchart: `<svg class="mermaid-diagram" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="var(--brand-hex, #3b82f6)" />
    </marker>
  </defs>
  
  <!-- Start -->
  <rect x="150" y="20" width="100" height="40" rx="20" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="200" y="45" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="14">Start</text>
  
  <!-- Decision -->
  <polygon points="200,80 250,110 200,140 150,110" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="200" y="110" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12">Is it working?</text>
  
  <!-- Great! -->
  <rect x="280" y="90" width="80" height="40" rx="20" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="320" y="115" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="14">Great!</text>
  
  <!-- Debug -->
  <rect x="40" y="90" width="80" height="40" rx="20" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="80" y="115" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="14">Debug</text>
  
  <!-- Arrows -->
  <line x1="200" y1="60" x2="200" y2="80" stroke="var(--brand-hex, #3b82f6)" stroke-width="2" marker-end="url(#arrowhead)"/>
  <line x1="250" y1="110" x2="280" y2="110" stroke="var(--brand-hex, #3b82f6)" stroke-width="2" marker-end="url(#arrowhead)"/>
  <line x1="150" y1="110" x2="120" y2="110" stroke="var(--brand-hex, #3b82f6)" stroke-width="2" marker-end="url(#arrowhead)"/>
  
  <!-- Labels -->
  <text x="265" y="105" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12">Yes</text>
  <text x="135" y="105" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12">No</text>
</svg>`,

  sequence: `<svg class="mermaid-diagram" viewBox="0 0 500 300" xmlns="http://www.w3.org/2000/svg">
  <!-- Participants -->
  <rect x="20" y="20" width="80" height="30" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="60" y="40" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12">User</text>
  
  <rect x="130" y="20" width="80" height="30" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="170" y="40" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12">Browser</text>
  
  <rect x="240" y="20" width="80" height="30" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="280" y="40" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12">Server</text>
  
  <!-- Lifelines -->
  <line x1="60" y1="50" x2="60" y2="280" stroke="var(--muted-foreground-hex, #6b7280)" stroke-width="2" stroke-dasharray="5,5"/>
  <line x1="170" y1="50" x2="170" y2="280" stroke="var(--muted-foreground-hex, #6b7280)" stroke-width="2" stroke-dasharray="5,5"/>
  <line x1="280" y1="50" x2="280" y2="280" stroke="var(--muted-foreground-hex, #6b7280)" stroke-width="2" stroke-dasharray="5,5"/>
</svg>`,

  class: `<svg class="mermaid-diagram" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg">
  <!-- User Class -->
  <rect x="50" y="50" width="100" height="80" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="100" y="70" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="14" font-weight="bold">User</text>
  <line x1="50" y1="80" x2="150" y2="80" stroke="var(--brand-hex, #3b82f6)" stroke-width="1"/>
  <text x="60" y="100" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12">+ id: int</text>
  <text x="60" y="115" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12">+ name: string</text>
  
  <!-- Post Class -->
  <rect x="250" y="50" width="100" height="80" fill="var(--bg-hex, #ffffff)" stroke="var(--brand-hex, #3b82f6)" stroke-width="2"/>
  <text x="300" y="70" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="14" font-weight="bold">Post</text>
</svg>`,

  gitgraph: `<svg class="mermaid-diagram" viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Main branch line -->
  <line x1="50" y1="100" x2="450" y2="100" stroke="var(--brand-hex, #3b82f6)" stroke-width="3"/>
  
  <!-- Commits -->
  <circle cx="50" cy="100" r="6" fill="var(--brand-hex, #3b82f6)"/>
  <text x="50" y="125" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="10">Initial</text>
  
  <circle cx="150" cy="100" r="6" fill="var(--brand-hex, #3b82f6)"/>
  <circle cx="300" cy="100" r="6" fill="var(--brand-hex, #3b82f6)"/>
  <text x="300" y="125" text-anchor="middle" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="10">Merge</text>
  
  <!-- Branch labels -->
  <text x="20" y="105" fill="var(--fg-hex, #1f2937)" font-family="sans-serif" font-size="12" font-weight="bold">main</text>
</svg>`
}

async function generateStaticSVGs() {
  console.log('🎨 Generating static SVG diagrams...')
  
  // Create output directory
  const outputDir = join(__dirname, '..', 'public', 'diagrams')
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }
  
  // Generate SVGs for each diagram
  const results = {}
  
  for (const [name, svgContent] of Object.entries(staticSVGs)) {
    try {
      console.log(`  📊 Generating ${name} diagram...`)
      
      // Save SVG file
      const svgPath = join(outputDir, `${name}.svg`)
      writeFileSync(svgPath, svgContent, 'utf8')
      
      results[name] = {
        path: `/diagrams/${name}.svg`,
        success: true
      }
      
      console.log(`  ✅ Generated ${name}.svg`)
    } catch (error) {
      console.error(`  ❌ Failed to generate ${name}:`, error.message)
      results[name] = {
        error: error.message,
        success: false
      }
    }
  }
  
  // Generate manifest file
  const manifestPath = join(outputDir, 'manifest.json')
  writeFileSync(manifestPath, JSON.stringify(results, null, 2), 'utf8')
  
  console.log('✅ Static SVG generation complete!')
  console.log(`📁 Generated files in: ${outputDir}`)
  
  return results
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateStaticSVGs()
}

export { generateStaticSVGs }
