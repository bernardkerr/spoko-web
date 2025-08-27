'use client'

import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { Box, Card, Heading, Text, Button, Callout } from '@radix-ui/themes'
import { Wrench, Eye, Download, Play } from 'lucide-react'
import { CodeEditor } from '@/components/common/CodeEditor'
import { useLastGoodCode } from '@/components/common/hooks/useLastGoodCode'
// Docs helper: use shared panel + common table
import { DocsPanel } from '@/components/common/DocsPanel'
import { DocsTable as CommonDocsTable } from '@/components/common/DocsTable'
import { getAssetPath } from '@/lib/paths'
import { downloadText } from '@/lib/downloads'
import { WorkbenchShell } from '@/components/common/WorkbenchShell'
import { useWorkbenchInterface } from '@/components/common/hooks/useWorkbenchInterface'

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
  const [workbenchVisible, setWorkbenchVisible] = useState(() => !!ui?.workbench)
  const [showEditor, setShowEditor] = useState(!!showEditorDefault)
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [showDocsHelper, setShowDocsHelper] = useState(false)
  const [libsReady, setLibsReady] = useState(false)

  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const cleanupRef = useRef(null)
  const libsRef = useRef({ d3: null, ELK: null })

  // Persistence like CAD workbench
  const { read, writeCode, writeLastGood, resolveSource } = useLastGoodCode('d3', id, initialCode || '')
  const initialValuesRef = useRef(null)
  useEffect(() => {
    initialValuesRef.current = read()
  }, [read])

  const handleEditorChange = (val) => {
    writeCode(val)
  }

  // Auto-close docs helper when editor closes
  useEffect(() => {
    if (!showEditor && showDocsHelper) setShowDocsHelper(false)
  }, [showEditor, showDocsHelper])

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

  const viewerHeight = useMemo(() => (ui?.viewerHeight ? Number(ui.viewerHeight) : (workbenchVisible ? 420 : 520)), [ui?.viewerHeight, workbenchVisible])

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
    <WorkbenchShell
      viewer={(
        <>
          {!workbenchVisible ? (
            <Button size="1" variant="ghost" onClick={() => setWorkbenchVisible(true)} style={{ position: 'absolute', top: 8, right: 8, opacity: 0.9, padding: 6, minWidth: 0, zIndex: 3 }} aria-label="Open workbench" title="Open workbench">
              <Wrench width={28} height={28} />
            </Button>
          ) : (
            <Button size="1" variant="ghost" onClick={() => setWorkbenchVisible(false)} style={{ position: 'absolute', top: 8, right: 8, opacity: 0.9, padding: 6, minWidth: 0, zIndex: 3 }} aria-label="Viewer only" title="Viewer only">
              <Eye width={28} height={28} />
            </Button>
          )}
          <div ref={containerRef} style={{ width: '100%', height: '100%', padding: 8, boxSizing: 'border-box' }} />
        </>
      )}
      toolbar={workbenchVisible ? (
        <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button onClick={doRun} disabled={busy}>
            <Play width={18} height={18} style={{ marginRight: 6 }} />
            {busy ? 'Working…' : 'Run'}
          </Button>
          <Button variant="soft" onClick={doDownloadSVG}>
            <Download width={18} height={18} style={{ marginRight: 6 }} />
            Export SVG
          </Button>
          {!showEditor && (
            <Button variant="solid" onClick={() => setShowEditor(true)}>Open Editor</Button>
          )}
        </Box>
      ) : null}
      status={workbenchVisible ? (<Text size="2" color={error ? 'red' : 'gray'}>Status: {status}</Text>) : null}
      error={workbenchVisible && error ? (<pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>) : null}
      editor={workbenchVisible && showEditor ? (
        <Card>
          <Box p="4">
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Heading size="6">Editor</Heading>
              <Button variant="ghost" onClick={() => setShowEditor(false)}>Close</Button>
            </Box>
            <Text as="p" color="gray" size="2">Write D3 + ELKJS code and click RUN.</Text>
            <Box mt="3">
              <CodeEditor
                ref={editorRef}
                initialCode={initialValuesRef.current?.code ?? initialCode ?? ''}
                storageKey={`d3:${id}:code`}
                height={360}
                language="javascript"
                onChange={handleEditorChange}
              />
            </Box>
            <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button onClick={doRun} disabled={busy}>{busy ? 'Working…' : 'Run'}</Button>
              <Button variant="soft" onClick={resetEditorToLastRunning}>Reset to Last Running</Button>
              <Button variant="soft" onClick={resetEditorToOriginal}>Reset to Original</Button>
              <Button variant="surface" onClick={() => setShowDocsHelper(v => !v)}>{showDocsHelper ? 'Hide D3 Doc' : 'D3 Doc'}</Button>
            </Box>
          </Box>
        </Card>
      ) : null}
      docs={workbenchVisible && showDocsHelper ? (
        <DocsPanel title="D3 Docs" source="d3-apis.md" height={360} onClose={() => setShowDocsHelper(false)}>
          <CommonDocsTable markdownUrl={getAssetPath('/test/d3-doc/d3-apis.md')} />
        </DocsPanel>
      ) : null}
      viewerHeight={viewerHeight}
    />
  )
})
