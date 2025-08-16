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

  // Read colors from the nearest Radix Theme root (.rt-Theme) with fallbacks
  const readTheme = () => {
    const el = ref.current || document.documentElement
    const themeRoot = el.closest?.('.rt-Theme') || document.querySelector('.rt-Theme') || document.documentElement
    const cs = getComputedStyle(themeRoot)

    const pick = (...vars) => {
      for (const v of vars) {
        const val = cs.getPropertyValue(v).trim()
        if (val) return val
      }
      return ''
    }

    // Convert Radix numeric HSL tokens like "240 6.9% 10.0%" to a valid CSS color string
    const toCss = (raw, fallback) => {
      if (!raw) return fallback
      const s = raw.replace(/^hsl\(|\)$/g, '').trim()
      if (/^\d/.test(s) && s.includes('%')) return `hsl(${s})`
      return raw
    }

    const background = toCss(
      pick('--color-panel', '--color-surface', '--background', '--gray-1', '--bg'),
      '#ffffff'
    )
    const foreground = toCss(pick('--foreground', '--gray-12', '--fg'), '#1f2937')
    const muted = toCss(pick('--gray-6', '--muted', '--gray-5'), 'hsl(215 16.3% 46.9%)')
    const border = toCss(pick('--gray-6', '--border', '--gray-a6'), 'hsl(214 32% 91%)')
    const primary = toCss(pick('--accent-9', '--iris-9', '--indigo-9', '--accent', '--brand'), '#3b82f6')

    return { themeRoot, background, foreground, muted, border, primary }
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
            // Colors aligned to Radix tokens (allow hsl() strings)
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
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <span>Initializing...</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <div 
        ref={ref}
        className="mermaid-container w-full overflow-auto min-h-[200px]"
      />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-destructive text-center">
            <span>Error rendering diagram: {error}</span>
          </div>
        </div>
      )}
    </div>
  )
}
