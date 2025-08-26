'use client'

import React, { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { Box, Card, Heading, Text, Button, Callout, Flex, TextField, Switch } from '@radix-ui/themes'
import { Wrench, Eye, Download, Play } from 'lucide-react'
import { CodeEditor } from '@/components/cad/CodeEditor'
import { D2 } from '@terrastruct/d2'

// Simple helper to download text as a file
function downloadText(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Try to turn D2 compile/render errors (which can be JSON arrays) into readable text
function formatD2ErrorMessage(msg) {
  try {
    const parsed = JSON.parse(msg)
    if (Array.isArray(parsed)) {
      return parsed
        .map((e, i) => (e?.errmsg ? `• ${e.errmsg}` : `• ${String(e)}`))
        .join('\n')
    }
  } catch (_) {
    // ignore JSON parse failure and return raw
  }
  return msg
}

export const D2Workbench = forwardRef(function D2Workbench(
  {
    id = 'd2wb',
    initialCode = 'x: Start\ny: Process\nz: End\n\nx -> y: next\ny -> z: finish',
    autoRun = true,
    showEditorDefault = true,
    ui,
    onStatus,
    onError,
  },
  ref
) {
  const [workbenchVisible, setWorkbenchVisible] = useState(!!ui?.workbench ?? true)
  const [showEditor, setShowEditor] = useState(!!showEditorDefault)
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const [sketch, setSketch] = useState(!!ui?.sketch)
  const [pad, setPad] = useState(ui?.pad ?? 48)
  const [scale, setScale] = useState(ui?.scale ?? 1)
  const [themeID, setThemeID] = useState(ui?.themeID ?? 0) // default D2 theme
  const [darkThemeID, setDarkThemeID] = useState(ui?.darkThemeID ?? undefined)

  const editorRef = useRef(null)
  const svgContainerRef = useRef(null)
  const compiledDiagramRef = useRef(null)
  const d2Ref = useRef(null)
  const lastSVGRef = useRef('')

  // Create D2 instance once (client only)
  useEffect(() => {
    d2Ref.current = new D2()
    return () => { d2Ref.current = null }
  }, [])

  const renderOpts = useMemo(() => ({
    sketch,
    themeID: Number(themeID) || 0,
    ...(darkThemeID !== undefined && darkThemeID !== '' ? { darkThemeID: Number(darkThemeID) } : {}),
    center: true,
    pad: Number(pad) || 0,
    scale: Number(scale) || 1,
    noXMLTag: true,
  }), [sketch, themeID, darkThemeID, pad, scale])

  const doRender = async () => {
    if (!compiledDiagramRef.current || !d2Ref.current) return
    setBusy(true)
    setStatus('Rendering…')
    onStatus?.('Rendering…')
    try {
      const svg = await d2Ref.current.render(compiledDiagramRef.current, renderOpts)
      lastSVGRef.current = svg || ''
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = svg || ''
        const svgEl = svgContainerRef.current.querySelector('svg')
        if (svgEl) {
          // Make SVG responsive to container, avoid overflow scrollbars
          svgEl.removeAttribute('width')
          svgEl.removeAttribute('height')
          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
          svgEl.style.width = '100%'
          svgEl.style.height = '100%'
          svgEl.style.maxWidth = '100%'
          svgEl.style.maxHeight = '100%'
          svgEl.style.display = 'block'
        }
      }
      setStatus('Done')
      onStatus?.('Done')
    } catch (e) {
      const raw = e?.message || String(e)
      const pretty = formatD2ErrorMessage(raw)
      // Fallback: some theme combos can throw in render path as well
      if (/Invalid color format/i.test(pretty) && darkThemeID !== undefined && darkThemeID !== '') {
        try {
          const altOpts = {
            ...renderOpts,
            darkThemeID: undefined,
          }
          const svg = await d2Ref.current.render(compiledDiagramRef.current, altOpts)
          lastSVGRef.current = svg || ''
          if (svgContainerRef.current) {
            svgContainerRef.current.innerHTML = svg || ''
            const svgEl = svgContainerRef.current.querySelector('svg')
            if (svgEl) {
              svgEl.removeAttribute('width')
              svgEl.removeAttribute('height')
              svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet')
              svgEl.style.width = '100%'
              svgEl.style.height = '100%'
              svgEl.style.maxWidth = '100%'
              svgEl.style.maxHeight = '100%'
              svgEl.style.display = 'block'
            }
          }
          setStatus('Done')
          onStatus?.('Done')
          setError(null)
          onError?.(null)
          return
        } catch (_) {
          // fall through
        }
      }
      const detailed = `${pretty}${e?.stack ? `\n${e.stack}` : ''}`
      setError(detailed)
      setStatus('Error')
      onError?.(detailed)
    } finally {
      setBusy(false)
    }
  }

  const doCompile = async () => {
    if (!d2Ref.current) return
    setBusy(true)
    setError(null)
    let phase = 'Compiling…'
    setStatus(phase)
    onStatus?.(phase)
    try {
      const src = editorRef.current?.getValue?.() ?? initialCode ?? ''
      const result = await d2Ref.current.compile(src, {
        // CompileOptions (RenderOptions + layout/fonts)
        layout: 'dagre',
        sketch: !!sketch,
        themeID: Number(themeID) || 0,
        ...(darkThemeID !== undefined && darkThemeID !== '' ? { darkThemeID: Number(darkThemeID) } : {}),
        center: true,
        pad: Number(pad) || 0,
        scale: Number(scale) || 1,
        noXMLTag: true,
      })
      compiledDiagramRef.current = result.diagram
      setStatus('Rendering…')
      await doRender()
    } catch (e) {
      const raw = e?.message || String(e)
      const pretty = formatD2ErrorMessage(raw)
      // Fallback: Some theme combinations may trigger 'Invalid color format'. If darkThemeID is set,
      // try again without it to avoid a hard failure.
      if (/Invalid color format/i.test(pretty) && darkThemeID !== undefined && darkThemeID !== '') {
        try {
          const src = editorRef.current?.getValue?.() ?? initialCode ?? ''
          const result = await d2Ref.current.compile(src, {
            layout: 'dagre',
            sketch: !!sketch,
            themeID: Number(themeID) || 0,
            // omit darkThemeID
            center: true,
            pad: Number(pad) || 0,
            scale: Number(scale) || 1,
            noXMLTag: true,
          })
          compiledDiagramRef.current = result.diagram
          setStatus('Rendering…')
          await doRender()
          setError(null)
          onError?.(null)
          return
        } catch (_) {
          // fall through to normal error reporting below
        }
      }
      const detailed = `${pretty}${phase ? `\nPhase: ${phase}` : ''}${e?.stack ? `\n${e.stack}` : ''}`
      setError(detailed)
      setStatus('Error')
      onError?.(detailed)
    } finally {
      setBusy(false)
    }
  }

  // Auto run once when ready
  useEffect(() => {
    if (!autoRun) return
    const t = setTimeout(() => { doCompile() }, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-render on theme-change without recompiling
  useEffect(() => {
    const onThemeChange = () => {
      // Re-render using current compiled diagram and options
      doRender()
    }
    window.addEventListener('theme-change', onThemeChange)
    return () => window.removeEventListener('theme-change', onThemeChange)
  }, [doRender])

  // Expose controls
  useImperativeHandle(ref, () => ({
    run: doCompile,
    rerender: doRender,
    getSVG: () => lastSVGRef.current || '',
  }))

  const doDownloadSVG = () => {
    const svg = lastSVGRef.current || ''
    const base = (ui?.exportName || ui?.name || id || 'diagram')
      .toString().trim().replace(/\s+/g, '-').replace(/[^\w.-]+/g, '_') || 'diagram'
    downloadText(`${base}.svg`, svg, 'image/svg+xml')
  }

  const handleNumeric = (setter) => (e) => setter(e?.target?.value)

  return (
    <Card variant="ghost">
      <Box p="4" style={{ position: 'relative' }}>

        {/* Viewer */}
        <Box className="viewer-shell" style={{ position: 'relative', width: '100%', height: (ui?.viewerHeight ? Number(ui.viewerHeight) : (workbenchVisible ? 420 : 520)), minHeight: 280, borderRadius: 8, border: '1px solid var(--gray-a6)', overflow: 'hidden', background: 'var(--color-panel-solid)' }}>
          {/* Toggle inside the viewer so it appears within the bordered box */}
          {!workbenchVisible ? (
            <Button
              size="1"
              variant="ghost"
              onClick={() => setWorkbenchVisible(true)}
              style={{ position: 'absolute', top: 8, right: 8, opacity: 0.9, padding: 6, minWidth: 0, zIndex: 3 }}
              aria-label="Open workbench"
              title="Open workbench"
            >
              <Wrench width={28} height={28} strokeWidth={2} />
            </Button>
          ) : (
            <Button
              size="1"
              variant="ghost"
              onClick={() => setWorkbenchVisible(false)}
              style={{ position: 'absolute', top: 8, right: 8, opacity: 0.9, padding: 6, minWidth: 0, zIndex: 3 }}
              aria-label="Viewer only"
              title="Viewer only"
            >
              <Eye width={28} height={28} strokeWidth={2} />
            </Button>
          )}
          <div ref={svgContainerRef} style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', padding: 8, boxSizing: 'border-box' }} />
        </Box>

        {workbenchVisible && (
          <>
            {/* Toolbar */}
            <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button onClick={doCompile} disabled={busy}>
                <Play width={18} height={18} style={{ marginRight: 6 }} />
                {busy ? 'Working…' : 'Run'}
              </Button>
              <Button variant="soft" onClick={doDownloadSVG} disabled={!lastSVGRef.current}>
                <Download width={18} height={18} style={{ marginRight: 6 }} />
                Export SVG
              </Button>
              <Flex align="center" gap="2">
                <Text size="2">Sketch</Text>
                <Switch checked={!!sketch} onCheckedChange={setSketch} onClick={() => setTimeout(doRender, 0)} />
              </Flex>
              <Flex align="center" gap="2">
                <Text size="2">Pad</Text>
                <TextField.Root size="1" type="number" value={pad} onChange={handleNumeric(setPad)} onBlur={doRender} style={{ width: 80 }} />
              </Flex>
              <Flex align="center" gap="2">
                <Text size="2">Scale</Text>
                <TextField.Root size="1" type="number" step="0.1" value={scale} onChange={handleNumeric(setScale)} onBlur={doRender} style={{ width: 90 }} />
              </Flex>
              <Flex align="center" gap="2">
                <Text size="2">Theme</Text>
                <TextField.Root size="1" type="number" value={themeID} onChange={handleNumeric(setThemeID)} onBlur={doRender} style={{ width: 90 }} />
              </Flex>
              <Flex align="center" gap="2">
                <Text size="2">Dark Theme</Text>
                <TextField.Root size="1" type="number" placeholder="(auto)" value={darkThemeID ?? ''} onChange={handleNumeric(setDarkThemeID)} onBlur={doRender} style={{ width: 100 }} />
              </Flex>
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
                    <Text as="p" color="gray" size="2">Edit the D2 source and click RUN to re-render.</Text>
                    <Box mt="3">
                      <CodeEditor
                        ref={editorRef}
                        initialCode={initialCode}
                        storageKey={`d2:${id}:code`}
                        height={360}
                        onChange={() => { /* keep persisted via CodeEditor */ }}
                      />
                    </Box>
                    <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button onClick={doCompile} disabled={busy}>{busy ? 'Working…' : 'Run'}</Button>
                    </Box>
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
