'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

// Initialize Mermaid once globally
let mermaidInitialized = false

export function Mermaid({ code, className = '' }) {
  const ref = useRef(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeMermaid = () => {
      if (mermaidInitialized) return
      
      try {
        // Get CSS variables for theming
        const root = document.documentElement
        const computedStyle = getComputedStyle(root)
        
        const brandColor = computedStyle.getPropertyValue('--brand').trim()
        const fgColor = computedStyle.getPropertyValue('--fg').trim()
        const bgColor = computedStyle.getPropertyValue('--bg').trim()
        
        // Convert HSL to hex for Mermaid
        const hslToHex = (hsl) => {
          if (!hsl) return '#000000'
          try {
            const [h, s, l] = hsl.split(' ').map(v => parseFloat(v.replace('%', '')))
            const hslColor = `hsl(${h}, ${s}%, ${l}%)`
            
            // Create a temporary element to get computed color
            const temp = document.createElement('div')
            temp.style.color = hslColor
            temp.style.visibility = 'hidden'
            document.body.appendChild(temp)
            const rgb = getComputedStyle(temp).color
            document.body.removeChild(temp)
            
            // Convert rgb to hex
            const rgbMatch = rgb.match(/\d+/g)
            if (rgbMatch) {
              const [r, g, b] = rgbMatch.map(Number)
              return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
            }
            return '#000000'
          } catch {
            return '#000000'
          }
        }

        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          securityLevel: 'loose',
          themeVariables: {
            primaryColor: hslToHex(brandColor) || '#3b82f6',
            primaryTextColor: hslToHex(fgColor) || '#000000',
            primaryBorderColor: hslToHex(brandColor) || '#3b82f6',
            lineColor: hslToHex(fgColor) || '#000000',
            sectionBkgColor: hslToHex(bgColor) || '#ffffff',
            altSectionBkgColor: hslToHex(bgColor) || '#ffffff',
            gridColor: hslToHex(fgColor) || '#000000',
            secondaryColor: hslToHex(bgColor) || '#ffffff',
            tertiaryColor: hslToHex(bgColor) || '#ffffff',
            background: hslToHex(bgColor) || '#ffffff',
            mainBkg: hslToHex(bgColor) || '#ffffff',
            secondBkg: hslToHex(bgColor) || '#ffffff',
            tertiaryBkg: hslToHex(bgColor) || '#ffffff',
            // Class diagram specific colors
            classText: hslToHex(fgColor) || '#000000',
            cScale0: hslToHex(brandColor) || '#3b82f6',
            cScale1: hslToHex(bgColor) || '#ffffff',
            cScale2: hslToHex(brandColor) || '#3b82f6'
          }
        })
        
        mermaidInitialized = true
      } catch (err) {
        console.error('Failed to initialize Mermaid:', err)
        setError('Failed to initialize diagram renderer')
      }
    }

    const renderDiagram = async () => {
      if (!ref.current || !code) {
        console.log('Mermaid: No ref or code', { ref: !!ref.current, code: !!code })
        return
      }
      
      console.log('Mermaid: Starting render', { code: code.substring(0, 50) + '...' })
      setIsLoading(true)
      setError(null)
      
      try {
        initializeMermaid()
        
        // Clear previous content
        ref.current.innerHTML = ''
        
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
        console.log('Mermaid: Rendering with ID', id)
        
        // Use the new Mermaid v10+ API
        const result = await mermaid.render(id, code)
        console.log('Mermaid: Render result', result)
        
        if (result && result.svg) {
          ref.current.innerHTML = result.svg
          console.log('Mermaid: Successfully rendered')
        } else {
          throw new Error('No SVG returned from mermaid.render')
        }
        
        setIsLoading(false)
      } catch (err) {
        console.error('Mermaid rendering error:', err)
        console.error('Diagram code:', code)
        
        // More specific error messages
        let errorMessage = err.message || 'Unknown error'
        if (errorMessage.includes('Syntax error')) {
          errorMessage = `Syntax error in diagram code. Please check the Mermaid syntax.`
        } else if (errorMessage.includes('Parse error')) {
          errorMessage = `Parse error: Invalid diagram syntax detected.`
        }
        
        setError(errorMessage)
        setIsLoading(false)
        
        // Fallback: show the raw code
        if (ref.current) {
          ref.current.innerHTML = `<pre class="text-sm text-muted-foreground border rounded p-4">${code}</pre>`
        }
      }
    }

    renderDiagram()
  }, [code])

  if (error) {
    return (
      <div className={`border border-destructive/50 rounded-lg p-4 ${className}`}>
        <div className="text-sm text-destructive font-medium mb-2">Diagram Error</div>
        <div className="text-sm text-muted-foreground">{error}</div>
        <details className="mt-2">
          <summary className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
            Show diagram code
          </summary>
          <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">{code}</pre>
        </details>
      </div>
    )
  }

  return (
    <div className={`mermaid not-prose overflow-x-auto ${className}`} ref={ref}>
      {isLoading && (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          <span className="ml-2">Loading diagram...</span>
        </div>
      )}
    </div>
  )
}
