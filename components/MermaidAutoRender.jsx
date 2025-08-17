'use client'

import { useEffect } from 'react'

// Minimal client-only auto-renderer for Mermaid code blocks inside docs content.
// Scans the document for <pre><code class="language-mermaid">...</code></pre>
// and replaces each with an inline SVG rendered by Mermaid.
export default function MermaidAutoRender() {
  useEffect(() => {
    let cancelled = false

    const readTheme = () => {
      const themeRoot = document.documentElement
      const cs = getComputedStyle(themeRoot)
      const pick = (...vars) => {
        for (const v of vars) {
          const val = cs.getPropertyValue(v).trim()
          if (val) return val
        }
        return ''
      }
      const fallback = (val, fb) => (val && val.length ? val : fb)
      const background = fallback(pick('--theme-tokens-colors-surface', '--theme-colors-default-white'), '#ffffff')
      const foreground = fallback(pick('--theme-colors-neutral-neutral-12'), '#111111')
      const muted = fallback(pick('--theme-colors-neutral-neutral-9'), '#64748b')
      const border = fallback(pick('--theme-colors-neutral-neutral-6'), '#e2e8f0')
      const primary = fallback(pick('--theme-colors-accent-accent-9'), '#3b82f6')
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

          // Inject minimal CSS aligned with --theme variables (resolved to concrete values)
          const scopedCss = `\n<style>\nsvg{color: ${theme.foreground};}\ntext,tspan{fill: currentColor;}\n.actor rect{fill: ${theme.background}; stroke: ${theme.border};}\n.actor-line,.messageLine0,.messageLine1,.loopLine,.signal,.relation{stroke: currentColor;}\n.note{fill: ${theme.muted}; stroke: ${theme.border}; color: currentColor;}\n.marker path{fill: currentColor; stroke: none;}\n</style>`
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
