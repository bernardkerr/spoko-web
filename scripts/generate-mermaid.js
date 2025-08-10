#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Diagram definitions - these would normally come from your content
const diagrams = {
  flowchart: `
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix Issues]
    E --> B
    C --> F[Deploy]
    F --> G[End]
`,
  
  sequence: `
sequenceDiagram
    participant User
    participant Browser
    participant Server
    participant Database
    
    User->>Browser: Enter URL
    Browser->>Server: HTTP Request
    Server->>Database: Query Data
    Database-->>Server: Return Data
    Server-->>Browser: HTTP Response
    Browser-->>User: Display Page
`,

  class: `
classDiagram
    class User
    class Post
    class Comment
    User --> Post
    Post --> Comment
`,

  gitgraph: `
gitgraph
    commit id: "Initial commit"
    branch develop
    checkout develop
    commit id: "Add feature A"
    commit id: "Add feature B"
    checkout main
    merge develop
    commit id: "Release v1.0"
    branch hotfix
    checkout hotfix
    commit id: "Fix critical bug"
    checkout main
    merge hotfix
    commit id: "Release v1.0.1"
`
}

async function generateMermaidSVGs() {
  console.log('🎨 Generating Mermaid SVGs at build time...')
  
  try {
    // Dynamic import for ES modules
    const { default: mermaid } = await import('mermaid')
    
    // Initialize Mermaid for Node.js environment
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      deterministicIds: true,
      gitGraph: {
        showBranches: true,
        showCommitLabel: true,
        mainBranchName: 'main',
        rotateCommitLabel: true,
        theme: 'base'
      },
      // Use neutral colors that can be themed with CSS
      themeVariables: {
        primaryColor: '#3b82f6',
        primaryTextColor: '#1f2937',
        primaryBorderColor: '#3b82f6',
        lineColor: '#6b7280',
        sectionBkgColor: '#ffffff',
        altSectionBkgColor: '#f9fafb',
        gridColor: '#e5e7eb',
        secondaryColor: '#f3f4f6',
        tertiaryColor: '#ffffff',
        background: '#ffffff',
        mainBkg: '#ffffff',
        secondBkg: '#f9fafb',
        tertiaryBkg: '#ffffff',
        classText: '#1f2937',
        cScale0: '#3b82f6',
        cScale1: '#ffffff',
        cScale2: '#3b82f6'
      }
    })
    
    // Create output directory
    const outputDir = join(__dirname, '..', 'public', 'diagrams')
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true })
    }
    
    // Generate SVGs for each diagram
    const results = {}
    
    for (const [name, code] of Object.entries(diagrams)) {
      try {
        console.log(`  📊 Generating ${name} diagram...`)
        
        const result = await mermaid.render(`mermaid-${name}`, code)
        
        if (result && result.svg) {
          // Add CSS classes for theming
          const themedSvg = result.svg
            .replace('<svg', '<svg class="mermaid-diagram"')
            .replace(/fill="#3b82f6"/g, 'fill="var(--brand-hex, #3b82f6)"')
            .replace(/stroke="#3b82f6"/g, 'stroke="var(--brand-hex, #3b82f6)"')
            .replace(/fill="#1f2937"/g, 'fill="var(--fg-hex, #1f2937)"')
            .replace(/stroke="#1f2937"/g, 'stroke="var(--fg-hex, #1f2937)"')
            .replace(/fill="#6b7280"/g, 'fill="var(--muted-foreground-hex, #6b7280)"')
            .replace(/stroke="#6b7280"/g, 'stroke="var(--muted-foreground-hex, #6b7280)"')
            .replace(/fill="#ffffff"/g, 'fill="var(--bg-hex, #ffffff)"')
            .replace(/fill="#f9fafb"/g, 'fill="var(--muted-hex, #f9fafb)"')
          
          // Save SVG file
          const svgPath = join(outputDir, `${name}.svg`)
          writeFileSync(svgPath, themedSvg, 'utf8')
          
          results[name] = {
            path: `/diagrams/${name}.svg`,
            success: true
          }
          
          console.log(`  ✅ Generated ${name}.svg`)
        } else {
          throw new Error('No SVG returned from mermaid.render')
        }
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
    
    console.log('✅ Mermaid SVG generation complete!')
    console.log(`📁 Generated files in: ${outputDir}`)
    
    return results
    
  } catch (error) {
    console.error('❌ Failed to generate Mermaid SVGs:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateMermaidSVGs()
}

export { generateMermaidSVGs, diagrams }
