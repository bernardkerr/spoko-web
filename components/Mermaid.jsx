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



export default function Mermaid({ code, className }) {
  const ref = useRef(null)
  const [error, setError] = useState(null)
  const isClient = useIsClient()

  useEffect(() => {
    if (!isClient || !code) return

    const renderDiagram = async () => {
      try {
        setError(null)
        
        // Dynamic import to avoid SSR issues
        const mermaid = (await import('mermaid')).default
        
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
            // Read CSS custom properties for theming
            primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-hex').trim() || '#3b82f6',
            primaryTextColor: getComputedStyle(document.documentElement).getPropertyValue('--fg-hex').trim() || '#1f2937',
            primaryBorderColor: getComputedStyle(document.documentElement).getPropertyValue('--brand-hex').trim() || '#3b82f6',
            lineColor: getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground-hex').trim() || '#6b7280',
            sectionBkgColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-hex').trim() || '#ffffff',
            altSectionBkgColor: getComputedStyle(document.documentElement).getPropertyValue('--muted-hex').trim() || '#f9fafb',
            gridColor: getComputedStyle(document.documentElement).getPropertyValue('--border-hex').trim() || '#e5e7eb',
            secondaryColor: getComputedStyle(document.documentElement).getPropertyValue('--muted-hex').trim() || '#f3f4f6',
            tertiaryColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-hex').trim() || '#ffffff',
            background: getComputedStyle(document.documentElement).getPropertyValue('--bg-hex').trim() || '#ffffff',
            mainBkg: getComputedStyle(document.documentElement).getPropertyValue('--bg-hex').trim() || '#ffffff',
            secondBkg: getComputedStyle(document.documentElement).getPropertyValue('--muted-hex').trim() || '#f9fafb',
            tertiaryBkg: getComputedStyle(document.documentElement).getPropertyValue('--bg-hex').trim() || '#ffffff'
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
  }, [code, isClient])

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
