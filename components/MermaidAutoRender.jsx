'use client'

import { useEffect } from 'react'

// Minimal client-only auto-renderer for Mermaid code blocks inside docs content.
// Scans the document for <pre><code class="language-mermaid">...</code></pre>
// and replaces each with an inline SVG rendered by Mermaid.
export default function MermaidAutoRender() {
  useEffect(() => {
    let cancelled = false

    const readTheme = () => {
      const themeRoot = document.querySelector('.rt-Theme') || document.documentElement
      const cs = getComputedStyle(themeRoot)
      const pick = (...vars) => {
        for (const v of vars) {
          const val = cs.getPropertyValue(v).trim()
          if (val) return val
        }
        return ''
      }
      const toCss = (raw, fallback) => {
        if (!raw) return fallback
        const s = raw.replace(/^hsl\(|\)$/g, '').trim()
        if (/^\d/.test(s) && s.includes('%')) return `hsl(${s})`
        return raw || fallback
      }
      const background = toCss(pick('--color-panel', '--color-surface', '--background', '--gray-1', '--bg'), '#ffffff')
      const foreground = toCss(pick('--foreground', '--gray-12', '--fg'), '#111111')
      const muted = toCss(pick('--gray-6', '--muted', '--gray-7'), 'hsl(215 16.3% 46.9%)')
      const border = toCss(pick('--gray-6', '--border', '--gray-a6'), 'hsl(214 32% 91%)')
      const primary = toCss(pick('--accent-9', '--iris-9', '--indigo-9', '--accent', '--brand'), '#3b82f6')
      return { background, foreground, muted, border, primary }
    }

    const renderAll = async () => {
      const blocks = Array.from(document.querySelectorAll('article pre > code.language-mermaid'))
      if (!blocks.length) return

      const mermaid = (await import('mermaid')).default
      const theme = readTheme()

      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
        deterministicIds: true,
        themeVariables: {
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
          tertiaryBkg: theme.background,
        },
      })

      for (const codeEl of blocks) {
        if (cancelled) return
        const pre = codeEl.closest('pre')
        const code = codeEl.textContent || ''
        try {
          const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`
          const { svg } = await mermaid.render(id, code)
          if (cancelled) return

          // Inject minimal CSS to align with Radix theme
          const scopedCss = `\n<style>\nsvg{color: hsl(var(--foreground, 222.2 84% 4.9%));}\ntext,tspan{fill: currentColor;}\n.actor rect{fill: hsl(var(--color-panel, var(--background,0 0% 100%))); stroke: hsl(var(--gray-11,215 16.3% 46.9%));}\n.actor-line,.messageLine0,.messageLine1,.loopLine,.signal,.relation{stroke: currentColor;}\n.note{fill: hsl(var(--muted,210 40% 96%)); stroke: hsl(var(--gray-11,215 16.3% 46.9%)); color: currentColor;}\n.marker path{fill: currentColor; stroke: none;}\n</style>`
          const svgWithCss = svg.replace(/<svg([^>]*)>/i, `<svg$1>${scopedCss}`)

          const container = document.createElement('div')
          container.className = 'mermaid-figure'
          container.innerHTML = svgWithCss
          pre.replaceWith(container)
        } catch (err) {
          // leave the code block in place on failure
          // optionally annotate the pre element
          pre?.setAttribute('data-mermaid-error', String(err?.message || err))
        }
      }
    }

    renderAll()
    return () => { cancelled = true }
  }, [])

  return null
}
