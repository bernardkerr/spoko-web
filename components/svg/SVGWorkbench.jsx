'use client'

import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Box, Card, Heading, Text, Button, Callout } from '@radix-ui/themes'
import { Wrench, Eye, Download, Play } from 'lucide-react'
import { CodeEditor } from '@/components/cad/CodeEditor'
import { useLastGoodCode } from '@/components/svg/hooks/useLastGoodCode'
import { DocsTable as SVGDocsTable } from '@/components/svg/DocsTable'
import { getAssetPath } from '@/lib/paths'

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
  const [workbenchVisible, setWorkbenchVisible] = useState(() => !!ui?.workbench)
  const [showEditor, setShowEditor] = useState(!!showEditorDefault)
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [libsReady, setLibsReady] = useState(false)
  const [showDocsHelper, setShowDocsHelper] = useState(false)

  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const cleanupRef = useRef(null)
  const libsRef = useRef({ SVG: null, ELK: null })

  const { read, writeCode, writeLastGood, resolveSource } = useLastGoodCode(id, initialCode || '')
  const initialValuesRef = useRef(null)
  useEffect(() => {
    initialValuesRef.current = read()
  }, [read])

  const handleEditorChange = (val) => { writeCode(val) }

  // Auto-close docs helper when editor closes
  useEffect(() => {
    if (!showEditor && showDocsHelper) setShowDocsHelper(false)
  }, [showEditor, showDocsHelper])

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

  const viewerHeight = useMemo(() => (ui?.viewerHeight ? Number(ui.viewerHeight) : (workbenchVisible ? 420 : 520)), [ui?.viewerHeight, workbenchVisible])

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
    const rect = el.getBoundingClientRect()
    const width = Math.max(100, Math.floor(rect.width))
    const height = Math.max(100, Math.floor(rect.height))

    try {
      const src = resolveSource(() => editorRef.current?.getValue?.()) || ''
      const wrapped = '"use strict"; return (async (el, SVG, ELK, elk, width, height) => {\n' + src + '\n})'
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

  useEffect(() => {
    if (!autoRun) return
    const t = setTimeout(() => { doRun() }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (autoRun && libsReady) { doRun() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libsReady])

  useImperativeHandle(ref, () => ({ run: doRun }))

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
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const base = (ui?.exportName || ui?.name || id || 'svg').toString().trim().replace(/\s+/g, '-').replace(/[^\w.-]+/g, '_') || 'svg'
    a.href = url
    a.download = `${base}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card variant="ghost">
      <Box p="4" style={{ position: 'relative' }}>
        {/* Viewer */}
        <Box className="viewer-shell" style={{ position: 'relative', width: '100%', height: viewerHeight, minHeight: 280, borderRadius: 8, border: '1px solid var(--gray-a6)', overflow: 'hidden', background: 'var(--color-panel-solid)' }}>
          {/* Toggle inside viewer */}
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
        </Box>

        {workbenchVisible && (
          <>
            {/* Toolbar */}
            <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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

            {/* Status + Error */}
            <Box mt="3">
              <Text size="2" color={error ? 'red' : 'gray'}>Status: {status}</Text>
            </Box>
            {error && (
              <Box mt="2">
                <Callout.Root color="red">
                  <Callout.Text>
                    <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>
                  </Callout.Text>
                </Callout.Root>
              </Box>
            )}

            {/* Editor */}
            {showEditor && (
              <Box mt="6">
                <Card>
                  <Box p="4">
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Heading size="6">Editor</Heading>
                      <Button variant="ghost" onClick={() => setShowEditor(false)}>Close</Button>
                    </Box>
                    <Text as="p" color="gray" size="2">Write SVG.js code and click RUN.</Text>
                    <Box mt="3">
                      <CodeEditor
                        ref={editorRef}
                        initialCode={initialValuesRef.current?.code ?? initialCode ?? ''}
                        storageKey={`svg:${id}:code`}
                        height={360}
                        language="javascript"
                        onChange={handleEditorChange}
                      />
                    </Box>
                    <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button onClick={doRun} disabled={busy}>{busy ? 'Working…' : 'Run'}</Button>
                      <Button variant="soft" onClick={resetEditorToLastRunning}>Reset to Last Running</Button>
                      <Button variant="soft" onClick={resetEditorToOriginal}>Reset to Original</Button>
                      <Button variant="surface" onClick={() => setShowDocsHelper(v => !v)}>{showDocsHelper ? 'Hide SVG Doc' : 'SVG Doc'}</Button>
                    </Box>
                    {showDocsHelper && (
                      <Box mt="3">
                        <SVGDocsTable markdownUrl={getAssetPath('/test/svg-doc/svg-apis.md')} height={360} />
                        <Box mt="2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button variant="ghost" onClick={() => setShowDocsHelper(false)}>Close SVG Doc</Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Card>
              </Box>
            )}
          </>
        )}
      </Box>
    </Card>
  )
})
