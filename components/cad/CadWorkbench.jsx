'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Box, Card, Heading, Text, Button, Callout } from '@radix-ui/themes'
import { Wrench, Eye } from 'lucide-react'
import * as THREE from 'three'
import { ThreeCadViewer } from '@/components/cad/ThreeCadViewer'
import { Toolbar } from '@/components/cad/Toolbar'
import { CodeEditor } from '@/components/cad/CodeEditor'
// Worker-based pipeline: build+mesh off main thread
import { callOcWorker, isOcWorkerReady, waitForOcWorkerReady, onOcWorkerReady } from '@/components/cad/workers/ocWorkerClient'
import { exportSTL, exportGLTF, downloadBlob, saveBlobWithPicker } from '@/components/cad/Exporters'
// import { useOcModuleCache } from '@/components/cad/hooks/useOcModuleCache'
import { useLastGoodCode } from '@/components/cad/hooks/useLastGoodCode'
import { useOcWarmupWorker } from '@/components/cad/hooks/useOcWarmupWorker'
import { DocsTable } from '@/components/cad/DocsTable'
import { getAssetPath } from '@/lib/paths'

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

  // Workbench vs. viewer-only mode
  const modelPath = ui?.model && typeof ui.model === 'string' ? ui.model.trim() : ''
  const isModelMode = !!modelPath
  const [workbenchVisible, setWorkbenchVisible] = useState(() => isModelMode ? false : !!ui?.workbench)

  const [spinMode, setSpinMode] = useState(() => {
    const im = initialViewer?.spinMode
    if (im === 'on' || im === 'off' || im === 'auto') return im
    if (typeof initialViewer?.spinEnabled === 'boolean') return initialViewer.spinEnabled ? 'on' : 'off'
    return 'auto'
  })
  const [frameMode, setFrameMode] = useState(initialViewer?.frameMode || 'HIDE')
  const [shadingMode, setShadingMode] = useState(() => {
    const raw = (typeof ui?.shadingMode === 'string' ? ui.shadingMode : ui?.shading)
    const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
    if (s === 'GRAY' || s === 'WHITE' || s === 'BLACK' || s === 'OFF') return s
    return initialViewer?.shadingMode || 'GRAY'
  })
  const [originVisible, setOriginVisible] = useState(!!initialViewer?.originVisible)
  const [styleMode, setStyleMode] = useState('BASIC')
  const [outlineThreshold, setOutlineThreshold] = useState(45)
  const [outlineScale, setOutlineScale] = useState(1.02)
  // OFF - AUTO - DK GRAY - LGT GRAY - WHITE - BLACK
  const [edgesMode, setEdgesMode] = useState('AUTO')
  // Outline color can be AUTO (follow edges) or explicit; supports OFF to hide
  const [outlineColorMode, setOutlineColorMode] = useState('AUTO')

  // Preserve previous viewer settings when collapsing to viewer-only
  const prevViewerStateRef = useRef({
    spinMode: (initialViewer?.spinMode === 'on' || initialViewer?.spinMode === 'off' || initialViewer?.spinMode === 'auto')
      ? initialViewer?.spinMode
      : (typeof initialViewer?.spinEnabled === 'boolean' ? (initialViewer.spinEnabled ? 'on' : 'off') : 'auto'),
    frameMode: initialViewer?.frameMode || 'HIDE',
    shadingMode: (() => {
      const raw = (typeof ui?.shadingMode === 'string' ? ui.shadingMode : ui?.shading)
      const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
      if (s === 'GRAY' || s === 'WHITE' || s === 'BLACK' || s === 'OFF') return s
      return initialViewer?.shadingMode || 'GRAY'
    })(),
    originVisible: !!initialViewer?.originVisible,
  })

  // When entering viewer-only mode, force conservative settings
  useEffect(() => {
    if (!workbenchVisible) {
      // save previous state once when switching off
      prevViewerStateRef.current = {
        spinMode,
        frameMode,
        shadingMode,
        originVisible,
      }
      setFrameMode('HIDE')
      // keep shading as-is (GRAY by default) for pleasant fill
      setOriginVisible(false)
    } else {
      // restore previous state when returning to workbench
      const p = prevViewerStateRef.current
      setSpinMode(p.spinMode || 'off')
      setFrameMode(p.frameMode || 'HIDE')
      setShadingMode(p.shadingMode || 'GRAY')
      setOriginVisible(!!p.originVisible)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workbenchVisible])

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

  // Load external model if provided (viewer-only mode)
  useEffect(() => {
    if (!isModelMode) return
    let cancelled = false
    const load = async () => {
      try {
        setBusy(true)
        setError(null)
        setStatus('Loading model…')
        const src = modelPath
        if (typeof window !== 'undefined') {
          console.log('[CAD][model] Begin load', { src })
        }
        const isHttp = /^https?:\/\//i.test(src)
        const url = isHttp ? src : getAssetPath(`/api/test-models/${src}`)
        if (/\.(stl)$/i.test(src)) {
          const mod = await import('three/examples/jsm/loaders/STLLoader.js')
          const STLLoader = mod.STLLoader || mod.default || mod
          const loader = new STLLoader()
          const geometry = await loader.loadAsync(url)
          if (cancelled) return
          geometry.computeBoundingBox()
          geometry.computeBoundingSphere()
          lastGeometryRef.current = geometry
          viewerRef.current?.setGeometry?.(geometry)
          setStatus('Done')
          if (typeof window !== 'undefined') {
            console.log('[CAD][model] STL loaded', { bbox: geometry.boundingBox?.getSize(new THREE.Vector3()) })
          }
        } else if (/\.(step|stp)$/i.test(src)) {
          // Fetch as ArrayBuffer and hand to OC worker for meshing
          setStatus('Initializing OpenCascade…')
          await waitForOcWorkerReady()
          setStatus('Reading STEP…')
          const resp = await fetch(url)
          if (!resp.ok) {
            const txt = await resp.text().catch(() => '')
            throw new Error(`Failed to fetch STEP: ${resp.status} ${txt ? '- ' + txt : ''}`)
          }
          const buf = await resp.arrayBuffer()
          if (typeof window !== 'undefined') {
            console.log('[CAD][model] STEP bytes fetched', { bytes: buf.byteLength })
          }
          const res = await callOcWorker('loadStep', { filename: src.split('/').pop() || 'model.step', data: buf })
          if (!res || res.type !== 'buildResult') throw new Error('Unexpected worker response for loadStep')
          const geometry = new THREE.BufferGeometry()
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(res.positions, 3))
          // Use index ordering from worker (handles reversed faces) and compute normals here
          geometry.setIndex(new THREE.Uint32BufferAttribute(res.indices, 1))
          geometry.computeVertexNormals()
          geometry.normalizeNormals()
          geometry.computeBoundingSphere()
          geometry.computeBoundingBox()
          lastGeometryRef.current = geometry
          viewerRef.current?.setGeometry?.(geometry)
          setStatus('Done')
          if (typeof window !== 'undefined') {
            console.log('[CAD][model] STEP meshed', { verts: res.positions?.length/3, tris: res.indices?.length/3 })
          }
        } else {
          throw new Error(`Unsupported model extension for: ${src}`)
        }
      } catch (e) {
        const msg = e?.message || String(e)
        const detailed = `${msg}\nPhase: Load Model${e?.stack ? `\n${e.stack}` : ''}`
        if (typeof window !== 'undefined') {
          console.error('[CAD][model] Error loading model', detailed)
        }
        setError(detailed)
        setStatus('Error')
        onError?.(detailed)
      } finally {
        setBusy(false)
      }
    }
    load()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModelMode, modelPath])

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

  // Derive a human-friendly base filename from several sources
  const sanitizeBase = (s) => {
    return String(s || '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w.-]+/g, '_')
      .replace(/^\.+/, '')
      || String(id)
  }

  const deriveExportBaseName = () => {
    // 1) explicit UI name if provided
    const uiName = ui?.exportName || ui?.name
    if (uiName && typeof uiName === 'string') return sanitizeBase(uiName)
    // 2) look for a code comment like: // name: My Part
    const code = editorRef.current?.getValue?.() ?? initialValuesRef.current?.code ?? initialCode ?? ''
    const m = code && code.match(/^\s*\/\/\s*name\s*:\s*(.+)$/mi)
    if (m && m[1]) return sanitizeBase(m[1])
    // 3) document title if available
    if (typeof document !== 'undefined' && document?.title) return sanitizeBase(document.title)
    // 4) fallback to id
    return sanitizeBase(id)
  }

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
      // Use index ordering from worker (handles reversed faces) and compute normals here
      geometry.setIndex(new THREE.Uint32BufferAttribute(res.indices, 1))
      geometry.computeVertexNormals()
      geometry.normalizeNormals()
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
    if (isModelMode) return // model mode does not run builds
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

  const doExportSTEP = async () => {
    try {
      // Ask worker to export STEP from last built shape
      const base = deriveExportBaseName()
      const filename = `${base}.step`
      const res = await callOcWorker('exportStep', { filename })
      if (!res || res.type !== 'exportStepResult' || !res.data) {
        throw new Error('Unexpected worker response for STEP export')
      }
      const rawName = res.filename || filename
      // sanitize filename: allow word chars, dash, underscore, dot; force .step suffix
      let safeName = String(rawName).replace(/[^\w.-]+/g, '_').replace(/^\.+/, '')
      if (!/\.step$/i.test(safeName)) safeName = safeName.replace(/\.[^.]*$/g, '') + '.step'
      const blob = new Blob([res.data], { type: 'application/step' })
      const bytes = res.data?.byteLength ?? blob.size
      if (typeof window !== 'undefined') {
        console.log('[CAD] STEP export filename:', safeName, 'bytes:', bytes)
      }
      setStatus(`Exported STEP: ${safeName} (${Math.max(1, Math.round((bytes||0)/1024))} KB)`) // echo to UI
      await saveBlobWithPicker(safeName, blob)
    } catch (e) {
      const msg = e?.message || String(e)
      const detailed = `${msg}\nPhase: Export STEP${e?.stack ? `\n${e.stack}` : ''}`
      setError(detailed)
      setStatus('Error')
      onError?.(detailed)
    }
  }
  const doExportSTL = async () => {
    try {
      const base = deriveExportBaseName()
      await exportSTL(lastGeometryRef.current, `${base}.stl`, true)
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
      const base = deriveExportBaseName()
      await exportGLTF(lastGeometryRef.current, `${base}.glb`, true)
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
    <Card variant="ghost">
      <Box p="4">
        {workbenchVisible && (
          <Toolbar
            spinMode={spinMode}
            frameMode={frameMode}
            shadingMode={shadingMode}
            originVisible={originVisible}
            styleMode={styleMode}
            outlineThreshold={outlineThreshold}
            outlineScale={outlineScale}
            edgesMode={edgesMode}
            outlineColorMode={outlineColorMode}
            onCycleSpin={() => setSpinMode(prev => prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off')}
            onToggleFrame={() => setFrameMode(prev => prev === 'HIDE' ? 'LIGHT' : prev === 'LIGHT' ? 'DARK' : 'HIDE')}
            onToggleShading={() => setShadingMode(prev => (
              prev === 'GRAY' ? 'WHITE' :
              prev === 'WHITE' ? 'BLACK' :
              prev === 'BLACK' ? 'OFF' :
              'GRAY'
            ))}
            onToggleOrigin={() => setOriginVisible(v => !v)}
            onCycleStyle={() => setStyleMode(prev => {
              const order = ['BASIC','STUDIO','TOON','MATCAP','OUTLINE']
              const idx = order.indexOf(prev)
              return order[(idx + 1 + order.length) % order.length]
            })}
            onCycleEdges={() => setEdgesMode(prev => {
              const order = ['OFF','AUTO','DK GRAY','LGT GRAY','WHITE','BLACK']
              const idx = order.indexOf(prev)
              return order[(idx + 1 + order.length) % order.length]
            })}
            onCycleOutlineColor={() => setOutlineColorMode(prev => {
              const order = ['AUTO','DK GRAY','LGT GRAY','WHITE','BLACK','OFF']
              const idx = order.indexOf(prev)
              return order[(idx + 1 + order.length) % order.length]
            })}
            onCycleOutlineThreshold={() => setOutlineThreshold(prev => {
              const opts = [20, 30, 45, 60, 90]
              const i = opts.indexOf(prev)
              return opts[(i + 1 + opts.length) % opts.length]
            })}
            onCycleOutlineScale={() => setOutlineScale(prev => {
              const opts = [1.005, 1.01, 1.02, 1.03, 1.05]
              const i = opts.indexOf(Number(prev.toFixed ? Number(prev.toFixed(3)) : prev))
              return opts[(i + 1 + opts.length) % opts.length]
            })}
          />
        )}

        <Box mt="3" style={{ position: 'relative' }}>
          <Box style={{ height: (ui?.height ?? 480), width: '100%', borderRadius: 8, border: '1px solid var(--gray-a6)', overflow: 'hidden' }}>
            <ThreeCadViewer
              ref={viewerRef}
              spinEnabled={spinMode === 'on'}
              spinMode={spinMode}
              frameMode={frameMode}
              shadingMode={shadingMode}
              originVisible={originVisible}
              styleMode={styleMode}
              outlineThreshold={outlineThreshold}
              outlineScale={outlineScale}
              edgesMode={edgesMode}
              outlineColorMode={outlineColorMode}
              resize={ui?.resize}
            />
          </Box>
        {/* Minimal diagnostics for model mode */}
        {isModelMode && (
          <Box mt="2">
            <Text size="2" color={error ? 'red' : 'gray'}>
              Status: {status}
            </Text>
            {error && (
              <Box mt="1">
                <Callout.Root color="red">
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              </Box>
            )}
          </Box>
        )}
          {!workbenchVisible && (
            <Button
              size="1"
              variant="ghost"
              onClick={() => setWorkbenchVisible(true)}
              style={{ position: 'absolute', top: 8, right: 8, opacity: 0.9, padding: 6, minWidth: 0 }}
              aria-label="Open workbench"
              title="Open workbench"
            >
              <Wrench width={28} height={28} strokeWidth={2} />
            </Button>
          )}
          {workbenchVisible && (
            <Button
              size="1"
              variant="ghost"
              onClick={() => setWorkbenchVisible(false)}
              style={{ position: 'absolute', top: 8, right: 8, opacity: 0.9, padding: 6, minWidth: 0 }}
              aria-label="Viewer only"
              title="Viewer only"
            >
              <Eye width={28} height={28} strokeWidth={2} />
            </Button>
          )}
        </Box>

        {workbenchVisible && !isModelMode && (
          <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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
        )}

        {workbenchVisible && !isModelMode && (
          <>
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
          </>
        )}

        {workbenchVisible && showEditor && !isModelMode && (
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
                    <DocsTable markdownUrl={getAssetPath('/test/cad-doc/oc-apis.md')} height={360} />
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
