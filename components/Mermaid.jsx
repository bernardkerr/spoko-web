'use client'

import { useState, useEffect, useRef } from 'react'

// Client-side detection to avoid SSR issues
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return isClient
}



export function Mermaid({ code, className, autoRender = false }) {
  const ref = useRef(null)
  const [error, setError] = useState(null)
  const isClient = useIsClient()
  const [themeVersion, setThemeVersion] = useState(0)

  // Read colors from --theme variables with sensible fallbacks
  const readTheme = () => {
    const cs = getComputedStyle(document.documentElement)

    const pick = (...vars) => {
      for (const v of vars) {
        const val = cs.getPropertyValue(v).trim()
        if (val) return val
      }
      return ''
    }

    const background = pick('--theme-tokens-colors-surface', '--theme-colors-default-white') || '#ffffff'
    const foreground = pick('--theme-colors-neutral-neutral-12') || '#1f2937'
    const border = pick('--theme-colors-neutral-neutral-7') || '#94a3b8'
    
    // Use mid-saturation colors for better visibility
    const accent5 = pick('--theme-colors-accent-accent-5') || '#93c5fd'
    const accent6 = pick('--theme-colors-accent-accent-6') || '#60a5fa'
    const accent9 = pick('--theme-colors-accent-accent-9') || '#3b82f6'
    
    const success5 = pick('--theme-colors-semantic-success-5') || '#86efac'
    const warning5 = pick('--theme-colors-semantic-warning-5') || '#fde047'
    const info5 = pick('--theme-colors-semantic-info-5') || '#7dd3fc'
    const error5 = pick('--theme-colors-semantic-error-5') || '#fca5a5'
    
    const neutral4 = pick('--theme-colors-neutral-neutral-4') || '#e2e8f0'
    const neutral5 = pick('--theme-colors-neutral-neutral-5') || '#cbd5e1'
    
    return { 
      background, 
      foreground, 
      border, 
      accent5, 
      accent6, 
      accent9,
      success5, 
      warning5, 
      info5, 
      error5,
      neutral4,
      neutral5
    }
  }

  const initializeMermaid = async () => {
    const mermaid = (await import('mermaid')).default
    const theme = readTheme()

    // Reset Mermaid to ensure re-initialization applies updated themeCSS/selectors
    if (typeof mermaid.reset === 'function') {
      mermaid.reset()
    }

    // Initialize Mermaid with theme configuration
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
      themeVariables: {
        // Core theme colors - these drive most other colors
        primaryColor: theme.accent5,
        primaryTextColor: theme.foreground,
        primaryBorderColor: theme.accent9,
        
        secondaryColor: theme.success5,
        secondaryTextColor: theme.foreground,
        secondaryBorderColor: theme.accent9,
        
        tertiaryColor: theme.info5,
        tertiaryTextColor: theme.foreground,
        tertiaryBorderColor: theme.accent9,
        
        // Base colors
        background: theme.background,
        textColor: theme.foreground,
        lineColor: theme.border,
        
        // Flowchart - ensure all shape types get colored fills
        mainBkg: theme.accent5,           // Main background for flowchart
        nodeBkg: theme.accent5,           // Node backgrounds (rectangles, etc.)
        nodeBorder: theme.accent9,        // Node borders
        nodeTextColor: theme.foreground,  // Node text
        clusterBkg: theme.neutral4,       // Cluster/subgraph backgrounds
        clusterBorder: theme.accent9,     // Cluster borders
        defaultLinkColor: theme.border,   // Arrow/edge colors
        
        // Sequence diagram
        actorBkg: theme.accent5,
        actorBorder: theme.accent9,
        actorTextColor: theme.foreground,
        actorLineColor: theme.border,
        signalColor: theme.foreground,
        signalTextColor: theme.foreground,
        labelBoxBkgColor: theme.accent5,
        labelBoxBorderColor: theme.accent9,
        labelTextColor: theme.foreground,
        activationBkgColor: theme.success5,
        activationBorderColor: theme.accent9,
        
        // Class diagram - ensure class boxes get filled
        classText: theme.foreground,
        
        // Git graph - multiple colors for different branches
        git0: theme.accent5,
        git1: theme.success5,
        git2: theme.warning5,
        git3: theme.info5,
        git4: theme.error5,
        git5: theme.neutral5,
        git6: theme.accent6,
        git7: theme.accent9,
        gitBranchLabel0: theme.foreground,
        gitBranchLabel1: theme.foreground,
        gitBranchLabel2: theme.foreground,
        gitBranchLabel3: theme.foreground,
        gitBranchLabel4: theme.foreground,
        gitBranchLabel5: theme.foreground,
        gitBranchLabel6: theme.foreground,
        gitBranchLabel7: theme.foreground,
        
        // Additional elements
        edgeLabelBackground: theme.background,
        relationColor: theme.border,
        relationLabelColor: theme.foreground,
        relationLabelBackground: theme.background,
        
        // Timeline/Gantt
        sectionBkgColor: theme.accent5,
        altSectionBkgColor: theme.success5,
        taskBkgColor: theme.info5,
        taskBorderColor: theme.accent9,
        taskTextColor: theme.foreground
      },
      // Minimal CSS overrides - let themeVariables do most of the work
      themeCSS: `
        /* Ensure text visibility */
        text { fill: ${theme.foreground}; }
        .label { color: ${theme.foreground}; }
        
        /* Clean up label backgrounds */
        .label > foreignObject div { 
          background: transparent !important; 
          box-shadow: none !important; 
          border: none !important;
          color: ${theme.foreground};
        }
      `
    })

    return mermaid
  }

  useEffect(() => {
    if (!isClient) return

    const renderDiagram = async () => {
      // Handle auto-render mode: scan for mermaid code blocks
      if (autoRender) {
        const blocks = Array.from(document.querySelectorAll('article pre > code.language-mermaid'))
        if (!blocks.length) return

        const mermaid = await initializeMermaid()

        // Render each code block
        for (const codeEl of blocks) {
          const pre = codeEl.closest('pre')
          const codeText = codeEl.textContent || ''
          try {
            const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
            const result = await mermaid.render(id, codeText)
            
            const container = document.createElement('div')
            container.className = 'mermaid-container'
            container.innerHTML = result.svg
            pre.replaceWith(container)
          } catch (err) {
            console.error('Mermaid auto-render error:', err)
            pre?.setAttribute('data-mermaid-error', String(err?.message || err))
          }
        }
        return
      }

      // Handle direct code prop mode
      if (!code) return
      try {
        setError(null)
        
        const mermaid = await initializeMermaid()
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        
        // Render the diagram
        const result = await mermaid.render(id, code)
        
        if (ref.current && result.svg) {
          ref.current.innerHTML = result.svg
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        setError(err.message)
      }
    }

    renderDiagram()
  }, [code, isClient, themeVersion, autoRender])

  // Re-render on custom theme change events from Radix provider
  useEffect(() => {
    const onThemeChange = () => setThemeVersion((v) => v + 1)
    window.addEventListener('theme-change', onThemeChange)
    return () => window.removeEventListener('theme-change', onThemeChange)
  }, [])

  if (!isClient) {
    return autoRender ? null : (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, color: 'var(--theme-colors-neutral-neutral-9)' }}>
        <span>Initializing...</span>
      </div>
    )
  }

  // Auto-render mode doesn't need a container - it replaces DOM elements directly
  if (autoRender) {
    return null
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={ref} className="mermaid-container" />
      {error && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)', backdropFilter: 'blur(2px)' }}>
          <div style={{ color: 'var(--theme-colors-semantic-error-9)', textAlign: 'center' }}>
            <span>Error rendering diagram: {error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
