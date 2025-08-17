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



export function Mermaid({ code, className }) {
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
    const muted = pick('--theme-colors-neutral-neutral-9') || '#64748b'
    const border = pick('--theme-colors-neutral-neutral-6') || '#e2e8f0'
    const primary = pick('--theme-colors-accent-accent-9') || '#3b82f6'

    return { background, foreground, muted, border, primary }
  }

  useEffect(() => {
    if (!isClient || !code) return

    const renderDiagram = async () => {
      try {
        setError(null)
        
        // Dynamic import to avoid SSR issues
        const mermaid = (await import('mermaid')).default
        const theme = readTheme()
        
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
            // Colors aligned to --theme variables
            primaryColor: theme.primary,
            primaryTextColor: theme.foreground,
            primaryBorderColor: theme.primary,
            lineColor: theme.muted,
            sectionBkgColor: theme.background,
            altSectionBkgColor: theme.background,
            gridColor: theme.border,
            secondaryColor: theme.muted,
            tertiaryColor: theme.background,
            background: theme.background,
            mainBkg: theme.background,
            secondBkg: theme.muted,
            tertiaryBkg: theme.background
          }
        })
        
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
  }, [code, isClient, themeVersion])

  // Re-render on custom theme change events from Radix provider
  useEffect(() => {
    const onThemeChange = () => setThemeVersion((v) => v + 1)
    window.addEventListener('theme-change', onThemeChange)
    return () => window.removeEventListener('theme-change', onThemeChange)
  }, [])

  if (!isClient) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, color: 'var(--theme-colors-neutral-neutral-9)' }}>
        <span>Initializing...</span>
      </div>
    )
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
