'use client'

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Box, Card, Heading, Text, Button, Callout } from '@radix-ui/themes'
import { ThreeCadViewer } from '@/components/cad/ThreeCadViewer'
import { Toolbar } from '@/components/cad/Toolbar'
import { CodeEditor } from '@/components/cad/CodeEditor'
import { shapeToGeometry } from '@/components/cad/OcToThree'
import { runBuildModel } from '@/components/cad/OcModelBuilder'
import { exportSTEP, exportSTL, exportGLTF } from '@/components/cad/Exporters'
import { useOcModuleCache } from '@/components/cad/hooks/useOcModuleCache'
import { useLastGoodCode } from '@/components/cad/hooks/useLastGoodCode'

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

  const viewerRef = useRef(null)
  const editorRef = useRef(null)
  const lastOcRef = useRef(null)
  const lastShapeRef = useRef(null)
  const lastGeometryRef = useRef(null)

  const { loadOc } = useOcModuleCache()
  const { read, writeCode, writeLastGood, resolveSource } = useLastGoodCode(id, initialCode || '')

  // initialize editor value if editor mounts later
  const initialValuesRef = useRef(null)
  useEffect(() => {
    initialValuesRef.current = read()
  }, [read])

  const runBuild = async () => {
    setBusy(true)
    setError(null)
    let phase = 'Loading OpenCascade…'
    setStatus(phase)
    onStatus?.(phase)
    try {
      const oc = await loadOc()
      lastOcRef.current = oc
      const src = resolveSource(() => editorRef.current?.getValue?.()) || ''
      phase = 'Building model…'
      setStatus(phase)
      onStatus?.(phase)
      const shape = runBuildModel(oc, src)
      lastShapeRef.current = shape
      phase = 'Meshing and converting…'
      setStatus(phase)
      onStatus?.(phase)
      const geometry = await Promise.resolve(shapeToGeometry(oc, shape))
      lastGeometryRef.current = geometry
      phase = 'Rendering…'
      setStatus(phase)
      onStatus?.(phase)
      viewerRef.current?.setGeometry?.(geometry)
      // persist last good
      writeLastGood(src)
      setStatus('Done')
      onStatus?.('Done')
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

  // auto run once
  useEffect(() => {
    if (!autoRun) return
    const t = setTimeout(() => runBuild(), 0)
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
    try {
      exportSTEP(lastOcRef.current, lastShapeRef.current, `${id}.step`)
    } catch (e) {
      const msg = e?.message || String(e)
      const detailed = `${msg}\nPhase: Export STEP${e?.stack ? `\n${e.stack}` : ''}`
      setError(detailed)
      setStatus('Error')
      onError?.(detailed)
    }
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
          <Button onClick={runBuild} disabled={busy}>{busy ? 'Working…' : 'Run'}</Button>
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
                  <Button onClick={runBuild} disabled={busy}>{busy ? 'Working…' : 'Run'}</Button>
                  <Button variant="soft" onClick={resetEditorToLastRunning}>Reset to Last Running</Button>
                  <Button variant="soft" onClick={resetEditorToOriginal}>Reset to Original</Button>
                </Box>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Card>
  )
})
