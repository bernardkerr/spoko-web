'use client'

import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { Box, Button } from '@radix-ui/themes'
import { Download, Play } from 'lucide-react'
import { CodeEditor } from '@/components/common/CodeEditor'
import { useLastGoodCode } from '@/components/common/hooks/useLastGoodCode'
// Docs helper: use shared panel + common table
import { DocsPanel } from '@/components/common/DocsPanel'
import { DocsTable as CommonDocsTable } from '@/components/common/DocsTable'
import { getAssetPath } from '@/lib/paths'
import { downloadText } from '@/lib/downloads'
import { useWorkbenchInterface } from '@/components/common/hooks/useWorkbenchInterface'
import Workbench from '@/components/common/workbench/Workbench'

export const SVGWorkbench = forwardRef(function SVGWorkbench(
  {
    id = 'svgwb',
    initialCode = `// SVG.js quickstart\n// You can use SVG() from svg.js here.\n// 'el' is your container, width/height are provided.\n// Theme vars available: var(--accent-9), var(--gray-11), etc.\nconst draw = SVG().addTo(el).size('100%', '100%').viewbox(0,0,width,height)\n\n// Background panel\ndraw.rect(width, height).fill('var(--color-panel-solid)').stroke({ width: 1, color: 'var(--gray-a6)' })\n\n// Bars animation\nconst data = [4, 8, 15, 16, 23, 42]\nconst pad = 20\nconst w = (width - pad*2) / data.length\nconst max = Math.max(...data)\n
const g = draw.group()\n
for (let i = 0; i < data.length; i++) {\n  const h = (height - pad*2) * (data[i] / max)\n  const x = pad + i * w + 4\n  const y = height - pad - h\n  const r = g.rect(w - 8, 0).move(x, height - pad).fill('var(--accent-9)')\n  r.animate(900, 0, 'now').size(w - 8, h).move(x, y)\n}\n`,
    autoRun = true,
    showEditorDefault = true,
    ui,
    onStatus,
    onError,
  },
  ref
) {
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [libsReady, setLibsReady] = useState(false)
  const [bgMode, setBgMode] = useState('auto') // auto | white | black | light | dark

  const bgColor = useMemo(() => {
    switch (bgMode) {
      case 'white': return '#ffffff'
      case 'black': return '#000000'
      case 'light': return '#f8fafc'
      case 'dark': return '#0f172a'
      default: return null
    }
  }, [bgMode])

  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const cleanupRef = useRef(null)
  const libsRef = useRef({ SVG: null, ELK: null })

  const { read, writeCode, writeLastGood, resolveSource } = useLastGoodCode('svg', id, initialCode || '')
  const initialValuesRef = useRef(null)
  useEffect(() => {
    initialValuesRef.current = read()
  }, [read])

  const handleEditorChange = (val) => { writeCode(val) }

  // Load svg.js and elk.js dynamically on client
  useEffect(() => {
    let cancelled = false
    async function loadLibs() {
      try {
        const [{ SVG }, { default: ELK }] = await Promise.all([
          import('@svgdotjs/svg.js'),
          import('elkjs/lib/elk.bundled.js'),
        ])
        if (!cancelled) {
          libsRef.current = { SVG, ELK }
          setLibsReady(true)
        }
      } catch (e) {
        if (!cancelled) {
          setError(`Failed to load libraries: ${e?.message || e}`)
          onError?.(String(e))
        }
      }
    }
    loadLibs()
    return () => { cancelled = true }
  }, [onError])

  async function doRun() {
    if (!containerRef.current) return
    const { SVG, ELK } = libsRef.current
    if (!SVG || !ELK) {
      setStatus('Loading libs…')
      return
    }
    setBusy(true)
    setError(null)
    setStatus('Running…')
    onStatus?.('Running…')

    // Cleanup previous run
    try { if (typeof cleanupRef.current === 'function') cleanupRef.current() } catch {}
    cleanupRef.current = null

    // Prepare container
    const el = containerRef.current
    el.innerHTML = ''
    // Ensure layout is flushed before running user code (helps animations start reliably)
    await new Promise(requestAnimationFrame)
    await new Promise(requestAnimationFrame)
    const rect = el.getBoundingClientRect()
    const width = Math.max(100, Math.floor(rect.width))
    const height = Math.max(100, Math.floor(rect.height))

    try {
      const src = resolveSource(() => editorRef.current?.getValue?.()) || ''
      const wrapped = '"use strict"; return (async (el, SVG, ELK, elk, width, height) => {\nawait new Promise(requestAnimationFrame)\n' + src + '\n})'
      const factory = new Function(wrapped)()
      const elk = new ELK()
      const result = await factory(el, SVG, ELK, elk, width, height)
      if (typeof result === 'function') {
        cleanupRef.current = result
      }
      writeLastGood(src)
      setStatus('Done')
      onStatus?.('Done')
    } catch (e) {
      const msg = e?.stack || e?.message || String(e)
      setError(msg)
      setStatus('Error')
      onError?.(msg)
    } finally {
      setBusy(false)
    }
  }

  // Auto-run only when libraries are ready

  useEffect(() => {
    if (autoRun && libsReady) { doRun() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libsReady])

  useWorkbenchInterface(ref, { run: doRun })

  const resetEditorToOriginal = () => {
    const def = initialCode ?? ''
    editorRef.current?.setValue?.(def)
    writeCode(def)
    writeLastGood(def)
  }
  const resetEditorToLastRunning = () => {
    const last = initialValuesRef.current?.lastGood ?? ''
    if (last) {
      editorRef.current?.setValue?.(last)
      writeCode(last)
    }
  }

  const doDownloadSVG = () => {
    const el = containerRef.current
    if (!el) return
    const svg = el.querySelector('svg')
    if (!svg) return
    const base = (ui?.exportName || ui?.name || id || 'svg')
      .toString().trim().replace(/\s+/g, '-').replace(/[^\w.-]+/g, '_') || 'svg'
    downloadText(`${base}.svg`, svg.outerHTML, 'image/svg+xml')
  }

  return (
    <Workbench
      toolbarPosition="bottom"
      // Height behavior: fixed if ui.viewerHeight is provided; otherwise 420 when visible, 520 when hidden
      viewerHeight={ui?.viewerHeight ? Number(ui.viewerHeight) : undefined}
      // Visibility persistence per-workbench
      defaultWorkbenchVisible={!!ui?.workbench}
      persistVisibilityKey={`svg:${id}:wb`}
      status={status}
      error={error}
      // Viewer content
      viewer={(
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div
            ref={containerRef}
            className="wb-svg-container"
            style={{ width: '100%', height: '100%', padding: 0, boxSizing: 'border-box', ...(bgColor ? { backgroundColor: bgColor } : {}) }}
          />
        </div>
      )}
      // Overlay controls rendered only when workbench is visible
      overlayTopLeft={(
        <Box style={{ display: 'flex', gap: 6 }}>
          <Button
            size="1"
            variant="surface"
            onClick={() => {
              const order = ['auto','white','black','light','dark']
              const i = order.indexOf(bgMode)
              setBgMode(order[(i >= 0 ? i + 1 : 0) % order.length])
            }}
            title={`Background: ${bgMode}`}
          >
            BG: {bgMode}
          </Button>
        </Box>
      )}
      // Custom toolbar actions
      toolbar={(
        <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button onClick={doRun} disabled={busy || !libsReady}>
            <Play width={18} height={18} style={{ marginRight: 6 }} />
            {busy ? 'Working…' : 'Run'}
          </Button>
          <Button variant="soft" onClick={doDownloadSVG}>
            <Download width={18} height={18} style={{ marginRight: 6 }} />
            Export SVG
          </Button>
        </Box>
      )}
      // Editor content
      editor={(
        <CodeEditor
          ref={editorRef}
          initialCode={initialValuesRef.current?.code ?? initialCode ?? ''}
          storageKey={`svg:${id}:code`}
          height={360}
          language="javascript"
          onChange={handleEditorChange}
        />
      )}
      editorTitle="Editor"
      editorSubtext="Write SVG.js + ELKJS code and click RUN."
      showDefaultEditorActions
      onRun={doRun}
      runDisabled={!libsReady}
      running={busy}
      runLabel={busy ? 'Working…' : 'Run'}
      defaultEditorOpen={!!showEditorDefault}
      // Docs helper managed by Workbench (open state persisted automatically)
      docsAside={(
        <DocsPanel title="SVG.js Docs" source="svg-apis.md" height={360}>
          <CommonDocsTable markdownUrl={getAssetPath('/test/svg-doc/svg-apis.md')} />
        </DocsPanel>
      )}
      docsHelperLabelClosed="SVG Doc"
      docsHelperLabelOpen="Hide SVG Doc"
      // Error boundary for editor
      wrapEditorWithErrorBoundary
      // Resets: use our handlers
      onResetToLast={resetEditorToLastRunning}
      onResetToOriginal={resetEditorToOriginal}
    />
  )
})
