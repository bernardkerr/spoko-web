'use client'

import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { CodeEditor } from '@/components/common/CodeEditor'
import { useLastGoodCode } from '@/components/common/hooks/useLastGoodCode'
import { DocsPanel } from '@/components/common/DocsPanel'
import { DocsTable as CommonDocsTable } from '@/components/common/DocsTable'
import { getAssetPath } from '@/lib/paths'
import { useWorkbenchInterface } from '@/components/common/hooks/useWorkbenchInterface'
import Workbench from '@/components/common/workbench/Workbench'

export const ProcessingWorkbench = forwardRef(function ProcessingWorkbench(
  {
    id = 'processingwb',
    initialCode = `// Processing.js quickstart (JS mode)
// You can use the Processing.js API with a sketch function.
// We'll create a canvas sized to the viewer and run: new Processing(canvas, sketch)
// Theme vars available: var(--accent-9), var(--gray-11), etc.

function sketch(p) {
  p.setup = function() {
    p.size(width, height)
    p.background(255)
    p.noStroke()
  }
  p.draw = function() {
    p.fill(0, 0, 0, 10)
    p.rect(0, 0, width, height)
    const r = Math.min(width, height) * 0.35
    const cx = width/2, cy = height/2
    const t = p.frameCount * 0.02
    const x = cx + Math.cos(t) * r
    const y = cy + Math.sin(t) * r
    p.fill(30, 144, 255) // dodger blue
    p.ellipse(x, y, 24, 24)
  }
}

// Return the sketch function so the workbench can run it.
return sketch
`,
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
  const canvasRef = useRef(null)
  const editorRef = useRef(null)
  const cleanupRef = useRef(null)
  const processingRef = useRef(null)

  const { read, writeCode, writeLastGood, resolveSource } = useLastGoodCode('processing', id, initialCode || '')
  const initialValuesRef = useRef(null)
  useEffect(() => { initialValuesRef.current = read() }, [read])

  const handleEditorChange = (val) => { writeCode(val) }

  // Load Processing.js dynamically on client (from CDN) if not already present
  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false
    async function ensureProcessing() {
      try {
        if (window.Processing) { setLibsReady(true); return }
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/processing-js@1.6.6/processing.min.js'
        script.async = true
        script.onload = () => { if (!cancelled) setLibsReady(!!window.Processing) }
        script.onerror = () => { if (!cancelled) { setLibsReady(false); setError('Failed to load Processing.js'); onError?.('Failed to load Processing.js') } }
        document.head.appendChild(script)
      } catch (e) {
        if (!cancelled) { setError(String(e)); onError?.(String(e)) }
      }
    }
    ensureProcessing()
    return () => { cancelled = true }
  }, [onError])

  async function doRun() {
    if (!containerRef.current) return
    if (!window.Processing) {
      setStatus('Loading Processing.js…')
      return
    }
    setBusy(true)
    setError(null)
    setStatus('Running…')
    onStatus?.('Running…')

    // Cleanup previous run
    try {
      if (typeof cleanupRef.current === 'function') cleanupRef.current()
    } catch {}
    cleanupRef.current = null

    // Dispose prior Processing instance
    try {
      if (processingRef.current && processingRef.current.exit) {
        processingRef.current.exit()
      }
    } catch {}
    processingRef.current = null

    // Prepare container and canvas
    const el = containerRef.current
    el.innerHTML = ''
    // force layout before measuring
    await new Promise(requestAnimationFrame)
    const rect = el.getBoundingClientRect()
    const width = Math.max(100, Math.floor(rect.width))
    const height = Math.max(100, Math.floor(rect.height))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    el.appendChild(canvas)
    canvasRef.current = canvas

    try {
      const src = resolveSource(() => editorRef.current?.getValue?.()) || ''
      // Build an async factory returning a sketch function (p => { ... }) or a function that returns one
      const wrapped = `"use strict"; return (async (el, Processing, width, height) => {\n${src}\n})`
      const factory = new Function(wrapped)()
      const result = await factory(el, window.Processing, width, height)
      const sketch = (typeof result === 'function') ? result : null
      if (!sketch) throw new Error('Sketch function not returned. Return a function sketch(p) { … } from your code.')
      const instance = new window.Processing(canvas, sketch)
      processingRef.current = instance
      // Allow cleanup on next run
      cleanupRef.current = () => {
        try { instance.exit?.() } catch {}
        try { if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas) } catch {}
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

  // Auto-run when ready
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

  return (
    <Workbench
      toolbarPosition="bottom"
      viewerHeight={ui?.viewerHeight ? Number(ui.viewerHeight) : undefined}
      defaultWorkbenchVisible={!!ui?.workbench}
      persistVisibilityKey={`processing:${id}:wb`}
      status={status}
      error={error}
      viewer={(
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div
            ref={containerRef}
            className="wb-processing-container"
            style={{ width: '100%', height: '100%', padding: 0, boxSizing: 'border-box', ...(bgColor ? { backgroundColor: bgColor } : {}) }}
          />
        </div>
      )}
      editor={(
        <CodeEditor
          ref={editorRef}
          initialCode={initialValuesRef.current?.code ?? initialCode ?? ''}
          storageKey={`processing:${id}:code`}
          height={360}
          language="javascript"
          onChange={handleEditorChange}
        />
      )}
      editorTitle="Editor"
      editorSubtext="Write Processing.js sketch code. Return a function sketch(p) { … } that defines setup()/draw()."
      showDefaultEditorActions
      onRun={doRun}
      runDisabled={!libsReady}
      running={busy}
      runLabel={busy ? 'Working…' : 'Run'}
      defaultEditorOpen={!!showEditorDefault}
      docsAside={(
        <DocsPanel title="Processing.js Docs" source="processing-apis.md" height={360}>
          <CommonDocsTable markdownUrl={getAssetPath('/test/processing-doc/processing-apis.md')} />
        </DocsPanel>
      )}
      docsHelperLabelClosed="Processing Doc"
      docsHelperLabelOpen="Hide Processing Doc"
      wrapEditorWithErrorBoundary
      onResetToLast={resetEditorToLastRunning}
      onResetToOriginal={resetEditorToOriginal}
    />
  )
})
