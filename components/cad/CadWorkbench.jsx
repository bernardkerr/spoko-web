'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Box, Card, Heading, Text, Button, Callout } from '@radix-ui/themes'
import * as THREE from 'three'
import { ThreeCadViewer } from '@/components/cad/ThreeCadViewer'
import { Toolbar } from '@/components/cad/Toolbar'
import { CodeEditor } from '@/components/cad/CodeEditor'
// Worker-based pipeline: build+mesh off main thread
import { callOcWorker, isOcWorkerReady, waitForOcWorkerReady, onOcWorkerReady } from '@/components/cad/workers/ocWorkerClient'
import { exportSTEP, exportSTL, exportGLTF } from '@/components/cad/Exporters'
// import { useOcModuleCache } from '@/components/cad/hooks/useOcModuleCache'
import { useLastGoodCode } from '@/components/cad/hooks/useLastGoodCode'
import { useOcWarmupWorker } from '@/components/cad/hooks/useOcWarmupWorker'
import { DocsTable } from '@/components/cad/DocsTable'

export const CadWorkbench = forwardRef(function CadWorkbench(
  {
    id,
    initialCode,
    autoRun = true,
    showEditorDefault = false,
    initialViewer = { spinEnabled: true, frameMode: 'HIDE', shadingMode: 'GRAY', originVisible: false },
    ui,
    onStatus,
    onError,
  },
  ref
) {
  if (!id) throw new Error('CadWorkbench requires a unique id')

  const [spinEnabled, setSpinEnabled] = useState(!!initialViewer?.spinEnabled)
  const [frameMode, setFrameMode] = useState(initialViewer?.frameMode || 'HIDE')
  const [shadingMode, setShadingMode] = useState(initialViewer?.shadingMode || 'GRAY')
  const [originVisible, setOriginVisible] = useState(!!initialViewer?.originVisible)

  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [showEditor, setShowEditor] = useState(!!showEditorDefault)
  const [showDocsHelper, setShowDocsHelper] = useState(false)

  const viewerRef = useRef(null)
  const editorRef = useRef(null)
  const lastOcRef = useRef(null)
  const lastShapeRef = useRef(null)
  const lastGeometryRef = useRef(null)

  // Track OC worker readiness to adjust UI labels
  const [ocReady, setOcReady] = useState(() => isOcWorkerReady())
  useEffect(() => {
    if (isOcWorkerReady()) return
    const off = onOcWorkerReady(() => setOcReady(true))
    return () => off?.()
  }, [])

  // const { loadOc } = useOcModuleCache()
  const { read, writeCode, writeLastGood, resolveSource } = useLastGoodCode(id, initialCode || '')

  // Kick off a background warmup to fetch OC assets (JS + WASM) early.
  // This reduces the perceived latency of the first Run without moving
  // any build/meshing off the main thread.
  const warmupStatus = useOcWarmupWorker()
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log(`[CAD] warmup status: ${warmupStatus}`)
    }
  }, [warmupStatus])

  // initialize editor value if editor mounts later
  const initialValuesRef = useRef(null)
  useEffect(() => {
    initialValuesRef.current = read()
  }, [read])

  const runBuild = async () => {
    setBusy(true)
    setError(null)
    let phase = 'Building in worker…'
    setStatus(phase)
    onStatus?.(phase)
    try {
      const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
      console.groupCollapsed('[CAD] runBuild')
      console.time('[CAD] total')
      // If worker isn't ready yet, inform user and wait for readiness
      if (!isOcWorkerReady()) {
        phase = 'Initializing OpenCascade…'
        setStatus(phase)
        onStatus?.(phase)
        console.time('[CAD] wait worker ready')
        await waitForOcWorkerReady()
        console.timeEnd('[CAD] wait worker ready')
        phase = 'Building in worker…'
        setStatus(phase)
        onStatus?.(phase)
      }
      const src = resolveSource(() => editorRef.current?.getValue?.()) || ''
      if (typeof window !== 'undefined') {
        console.log('[CAD] sending source', { length: src.length, head: src.slice(0, 120) })
      }
      console.time('[CAD] worker build')
      const res = await callOcWorker('build', { source: src })
      console.timeEnd('[CAD] worker build')

      phase = 'Reconstructing geometry…'
      setStatus(phase)
      onStatus?.(phase)
      console.time('[CAD] reconstruct')
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(res.positions, 3))
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(res.normals, 3))
      geometry.setIndex(new THREE.Uint32BufferAttribute(res.indices, 1))
      geometry.computeBoundingSphere()
      geometry.computeBoundingBox()
      console.timeEnd('[CAD] reconstruct')
      lastGeometryRef.current = geometry
      phase = 'Rendering…'
      setStatus(phase)
      onStatus?.(phase)
      console.time('[CAD] render')
      viewerRef.current?.setGeometry?.(geometry)
      console.timeEnd('[CAD] render')
      // persist last good
      writeLastGood(src)
      setStatus('Done')
      onStatus?.('Done')
      console.timeEnd('[CAD] total')
      const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
      console.log(`[CAD] runBuild finished in ${Math.round(t1 - t0)}ms`)
      console.groupEnd()
    } catch (e) {
      console.error(e)
      const msg = e?.message || String(e)
      // Include phase and stack for easier debugging
      const detailed = `${msg}${phase ? `\nPhase: ${phase}` : ''}${e?.stack ? `\n${e.stack}` : ''}`
      setError(detailed)
      setStatus('Error')
      onError?.(detailed)
    } finally {
      setBusy(false)
    }
  }

  // write current code on editor changes
  const handleEditorChange = (val) => {
    writeCode(val)
  }

  // Auto-close docs helper when editor closes
  useEffect(() => {
    if (!showEditor && showDocsHelper) setShowDocsHelper(false)
  }, [showEditor, showDocsHelper])

  // auto run once: wait for worker ready to avoid long first-run wait perception
  useEffect(() => {
    if (!autoRun) return
    let cancelled = false
    const kick = async () => {
      try {
        if (!isOcWorkerReady()) {
          setStatus('Initializing OpenCascade…')
          onStatus?.('Initializing OpenCascade…')
          await waitForOcWorkerReady()
        }
        if (!cancelled) runBuild()
      } catch {}
    }
    const t = setTimeout(kick, 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // expose some methods
  useImperativeHandle(ref, () => ({
    run: runBuild,
    fitView: () => viewerRef.current?.fitView?.(),
    resetCamera: () => viewerRef.current?.reset?.(),
  }))

  const doExportSTEP = () => {
    // Disabled: shape lives in worker; wire via worker later
    setError('STEP export is not available in worker mode yet')
    setStatus('Error')
  }
  const doExportSTL = () => {
    try {
      exportSTL(lastGeometryRef.current, `${id}.stl`, true)
    } catch (e) {
      const msg = e?.message || String(e)
      const detailed = `${msg}\nPhase: Export STL${e?.stack ? `\n${e.stack}` : ''}`
      setError(detailed)
      setStatus('Error')
      onError?.(detailed)
    }
  }
  const doExportGLB = async () => {
    try {
      await exportGLTF(lastGeometryRef.current, `${id}.glb`, true)
    } catch (e) {
      const msg = e?.message || String(e)
      const detailed = `${msg}\nPhase: Export GLB${e?.stack ? `\n${e.stack}` : ''}`
      setError(detailed)
      setStatus('Error')
      onError?.(detailed)
    }
  }

  const resetEditorToOriginal = () => {
    // Use the page-supplied code (MDX cadjs block or getDefaultModelCode())
    const def = initialCode ?? ''
    editorRef.current?.setValue?.(def)
    // Persist as both current code and last-good so resolveSource() uses it "this time"
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
    <Card>
      <Box p="4">
        <Toolbar
          spinEnabled={spinEnabled}
          frameMode={frameMode}
          shadingMode={shadingMode}
          originVisible={originVisible}
          onToggleSpin={() => setSpinEnabled(v => !v)}
          onToggleFrame={() => setFrameMode(prev => prev === 'HIDE' ? 'LIGHT' : prev === 'LIGHT' ? 'DARK' : 'HIDE')}
          onToggleShading={() => setShadingMode(prev => prev === 'GRAY' ? 'BLACK' : prev === 'BLACK' ? 'OFF' : 'GRAY')}
          onToggleOrigin={() => setOriginVisible(v => !v)}
        />

        <Box mt="3" style={{ height: 480, width: '100%', borderRadius: 8, border: '1px solid var(--gray-a6)', overflow: 'hidden' }}>
          <ThreeCadViewer
            ref={viewerRef}
            spinEnabled={spinEnabled}
            frameMode={frameMode}
            shadingMode={shadingMode}
            originVisible={originVisible}
          />
        </Box>

        <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="surface" onClick={() => viewerRef.current?.fitView?.()}>Fit View</Button>
          <Button variant="surface" onClick={() => viewerRef.current?.reset?.()}>Reset</Button>
          <Button onClick={runBuild} disabled={busy}>{!ocReady ? 'Initializing…' : (busy ? 'Working…' : 'Run')}</Button>
          <Button variant="soft" onClick={doExportSTEP}>Export STEP</Button>
          <Button variant="soft" onClick={doExportSTL}>Export STL</Button>
          <Button variant="soft" onClick={doExportGLB}>Export GLB</Button>
          {!showEditor && (
            <Button variant="solid" onClick={() => setShowEditor(true)}>Open Editor</Button>
          )}
        </Box>

        <Box mt="3">
          <Text size="2" color={error ? 'red' : 'gray'}>Status: {status}</Text>
        </Box>
        {error && (
          <Box mt="2">
            <Callout.Root color="red">
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          </Box>
        )}

        {showEditor && (
          <Box mt="6">
            <Card>
              <Box p="4">
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Heading size="6">Editor</Heading>
                  <Button variant="ghost" onClick={() => setShowEditor(false)}>Close</Button>
                </Box>
                <Text as="p" color="gray" size="2">Edit the buildModel(oc) function and RUN to rebuild.</Text>
                <Box mt="3">
                  <CodeEditor
                    ref={editorRef}
                    initialCode={initialValuesRef.current?.code ?? initialCode ?? ''}
                    storageKey={`cad:${id}:code`}
                    height={360}
                    onChange={handleEditorChange}
                  />
                </Box>
                <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button onClick={runBuild} disabled={busy}>{!ocReady ? 'Initializing…' : (busy ? 'Working…' : 'Run')}</Button>
                  <Button variant="soft" onClick={resetEditorToLastRunning}>Reset to Last Running</Button>
                  <Button variant="soft" onClick={resetEditorToOriginal}>Reset to Original</Button>
                  <Button variant="surface" onClick={() => setShowDocsHelper(v => !v)}>{showDocsHelper ? 'Hide Docs Helper' : 'Docs Helper'}</Button>
                </Box>
                {showDocsHelper && (
                  <Box mt="3">
                    <DocsTable markdownUrl="/test/cad-doc/oc-apis.md" height={360} />
                    <Box mt="2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button variant="ghost" onClick={() => setShowDocsHelper(false)}>Close Docs Helper</Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Card>
  )
})
