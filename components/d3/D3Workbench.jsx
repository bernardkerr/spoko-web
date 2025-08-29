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

export const D3Workbench = forwardRef(function D3Workbench(
  {
    id = 'd3wb',
    initialCode = `// D3 + ELK quickstart\n// You can use d3 and elk here.\n// 'el' is your container, width/height are provided.\nconst svg = d3.select(el).append('svg')\n  .attr('viewBox', [0,0,width,height])\n  .style('display','block')\n  .style('width','100%')\n  .style('height','100%');\n\nconst data = [4, 8, 15, 16, 23, 42];\nconst x = d3.scaleBand().domain(d3.range(data.length)).range([40, width-20]).padding(0.2);\nconst y = d3.scaleLinear().domain([0, d3.max(data)]).nice().range([height-40, 20]);\n\nconst bars = svg.selectAll('rect').data(data).join('rect')\n  .attr('x', (_, i) => x(i))\n  .attr('width', x.bandwidth())\n  .attr('y', height-40)\n  .attr('height', 0)\n  .attr('fill', 'var(--accent-9)');\n\nbars.transition().duration(900)\n  .attr('y', d => y(d))\n  .attr('height', d => (height-40) - y(d));\n`,
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

  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const cleanupRef = useRef(null)
  const libsRef = useRef({ d3: null, ELK: null })

  const bgColor = useMemo(() => {
    switch (bgMode) {
      case 'white': return '#ffffff'
      case 'black': return '#000000'
      case 'light': return '#f8fafc'
      case 'dark': return '#0f172a'
      default: return null
    }
  }, [bgMode])

  // Persistence like CAD workbench
  const { read, writeCode, writeLastGood, resolveSource } = useLastGoodCode('d3', id, initialCode || '')
  const initialValuesRef = useRef(null)
  useEffect(() => {
    initialValuesRef.current = read()
  }, [read])

  const handleEditorChange = (val) => {
    writeCode(val)
  }

  // Load d3 and elk dynamically on client
  useEffect(() => {
    let cancelled = false
    async function loadLibs() {
      try {
        const [d3, { default: ELK }] = await Promise.all([
          import('d3'),
          import('elkjs/lib/elk.bundled.js'),
        ])
        if (!cancelled) {
          libsRef.current = { d3, ELK }
          setLibsReady(true)
        }
      } catch (e) {
        if (!cancelled) {
          setError(`Failed to load libs: ${e?.message || e}`)
          onError?.(String(e))
        }
      }
    }
    loadLibs()
    return () => { cancelled = true }
  }, [onError])

  async function doRun() {
    if (!containerRef.current) return
    const { d3, ELK } = libsRef.current
    if (!d3 || !ELK) {
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
    const rect = el.getBoundingClientRect()
    const width = Math.max(100, Math.floor(rect.width))
    const height = Math.max(100, Math.floor(rect.height))

    try {
      const src = resolveSource(() => editorRef.current?.getValue?.()) || ''
      // Build an async IIFE runner so user code can await elk.layout
      const wrapped = `"use strict"; return (async (el, d3, ELK, elk, width, height) => {\n${src}\n})`
      const factory = new Function(wrapped)()
      const elk = new ELK()
      const result = await factory(el, d3, ELK, elk, width, height)
      if (typeof result === 'function') {
        cleanupRef.current = result
      }
      // persist last good after a successful run
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

  useEffect(() => {
    if (!autoRun) return
    const t = setTimeout(() => { doRun() }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If initial auto-run happened before libs loaded, run once libs are ready
  useEffect(() => {
    if (autoRun && libsReady) {
      doRun()
    }
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
    const base = (ui?.exportName || ui?.name || id || 'diagram')
      .toString().trim().replace(/\s+/g, '-').replace(/[^\w.-]+/g, '_') || 'diagram'
    downloadText(`${base}.svg`, svg.outerHTML, 'image/svg+xml')
  }

  return (
    <Workbench
      toolbarPosition="bottom"
      // Height: rely on Workbench defaults unless explicitly provided via UI
      viewerHeight={ui?.viewerHeight ? Number(ui.viewerHeight) : undefined}
      // Visibility persistence per-workbench
      defaultWorkbenchVisible={!!ui?.workbench}
      persistVisibilityKey={`d3:${id}:wb`}
      status={status}
      error={error}
      // Viewer content
      viewer={(
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div ref={containerRef} style={{ width: '100%', height: '100%', padding: 8, boxSizing: 'border-box', ...(bgColor ? { backgroundColor: bgColor } : {}) }} />
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
          storageKey={`d3:${id}:code`}
          height={360}
          language="javascript"
          onChange={handleEditorChange}
        />
      )}
      editorTitle="Editor"
      editorSubtext="Write D3 + ELKJS code and click RUN."
      showDefaultEditorActions
      onRun={doRun}
      runDisabled={!libsReady}
      running={busy}
      runLabel={busy ? 'Working…' : 'Run'}
      defaultEditorOpen={!!showEditorDefault}
      // Docs helper managed by Workbench; we control open state for panel close
      docsAside={(
        <DocsPanel title="D3 Docs" source="d3-apis.md" height={360}>
          <CommonDocsTable markdownUrl={getAssetPath('/test/d3-doc/d3-apis.md')} />
        </DocsPanel>
      )}
      docsHelperLabelClosed="D3 Doc"
      docsHelperLabelOpen="Hide D3 Doc"
      // Error boundary for editor
      wrapEditorWithErrorBoundary
      // Resets: use our handlers
      onResetToLast={resetEditorToLastRunning}
      onResetToOriginal={resetEditorToOriginal}
    />
  )
  })
