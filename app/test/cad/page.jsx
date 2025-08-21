'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Section, Box, Card, Heading, Text, Button, Callout } from '@radix-ui/themes'
import { ThreeCadViewer } from '@/components/cad/ThreeCadViewer'
import { Toolbar } from '@/components/cad/Toolbar'
import { CodeEditor } from '@/components/cad/CodeEditor'
import { loadOc } from '@/components/cad/OcLoader'
import { getDefaultModelCode, runBuildModel } from '@/components/cad/OcModelBuilder'
import { shapeToGeometry } from '@/components/cad/OcToThree'
import { exportSTEP, exportSTL, exportGLTF } from '@/components/cad/Exporters'

export default function CadTestPage() {
  const [spinEnabled, setSpinEnabled] = useState(true)
  const [frameMode, setFrameMode] = useState('HIDE') // HIDE | LIGHT | DARK
  const [shadingMode, setShadingMode] = useState('GRAY') // GRAY | BLACK | OFF
  const viewerRef = useRef(null)
  const [status, setStatus] = useState('Ready')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const editorRef = useRef(null)
  const lastOcRef = useRef(null)
  const lastShapeRef = useRef(null)
  const lastGeometryRef = useRef(null)

  const buildSample = async () => {
    setBusy(true)
    setError(null)
    setStatus('Loading OpenCascade…')
    try {
      const oc = await loadOc()
      lastOcRef.current = oc
      setStatus('Building model (48×32×32)…')
      const src = getDefaultModelCode()
      const shape = runBuildModel(oc, src)
      lastShapeRef.current = shape
      setStatus('Meshing and converting to geometry…')
      const geometry = await Promise.resolve(shapeToGeometry(oc, shape))
      lastGeometryRef.current = geometry
      setStatus('Rendering geometry…')
      viewerRef.current?.setGeometry?.(geometry)
      setStatus('Done')
    } catch (e) {
      console.error(e)
      setError(e?.message || String(e))
      setStatus('Error')
    } finally {
      setBusy(false)
    }

  }

  const runFromEditor = async () => {
    setBusy(true)
    setError(null)
    setStatus('Loading OpenCascade…')
    try {
      const oc = await loadOc()
      lastOcRef.current = oc
      const src = editorRef.current?.getValue?.() || ''
      setStatus('Building model from editor…')
      const shape = runBuildModel(oc, src)
      lastShapeRef.current = shape
      setStatus('Meshing and converting to geometry…')
      const geometry = await Promise.resolve(shapeToGeometry(oc, shape))
      lastGeometryRef.current = geometry
      setStatus('Rendering geometry…')
      viewerRef.current?.setGeometry?.(geometry)
      setStatus('Done')
    } catch (e) {
      console.error(e)
      setError(e?.message || String(e))
      setStatus('Error')
    } finally {
      setBusy(false)
    }
  }

  const resetEditorToDefault = () => {
    const def = getDefaultModelCode()
    editorRef.current?.setValue?.(def)
  }

  const doExportSTEP = () => {
    try {
      exportSTEP(lastOcRef.current, lastShapeRef.current, 'model.step')
    } catch (e) {
      setError(e?.message || String(e))
      setStatus('Error')
    }
  }

  const doExportSTL = () => {
    try {
      exportSTL(lastGeometryRef.current, 'model.stl', true)
    } catch (e) {
      setError(e?.message || String(e))
      setStatus('Error')
    }
  }

  const doExportGLB = async () => {
    try {
      await exportGLTF(lastGeometryRef.current, 'model.glb', true)
    } catch (e) {
      setError(e?.message || String(e))
      setStatus('Error')
    }
  }

  return (
    <Section size="4">
      <Box mx="auto" style={{ maxWidth: 1200, width: '100%' }}>
        <Box mb="5" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <Heading size="9">CAD Viewer (Test)</Heading>
            <Text as="p" color="gray" size="4">
              Raw Three.js viewer scaffold using local three package. OC + Editor will be wired next.
            </Text>
          </div>
          <Button asChild variant="soft">
            <Link href="/test">Back to Tests</Link>
          </Button>
        </Box>

        <Card>
          <Box p="4">
            <Toolbar
              spinEnabled={spinEnabled}
              frameMode={frameMode}
              shadingMode={shadingMode}
              onToggleSpin={() => setSpinEnabled(v => !v)}
              onToggleFrame={() => setFrameMode(prev => prev === 'HIDE' ? 'LIGHT' : prev === 'LIGHT' ? 'DARK' : 'HIDE')}
              onToggleShading={() => setShadingMode(prev => prev === 'GRAY' ? 'BLACK' : prev === 'BLACK' ? 'OFF' : 'GRAY')}
            />

            <Box mt="3" style={{ height: 480, width: '100%', borderRadius: 8, border: '1px solid var(--gray-a6)', overflow: 'hidden' }}>
              <ThreeCadViewer
                ref={viewerRef}
                spinEnabled={spinEnabled}
                frameMode={frameMode}
                shadingMode={shadingMode}
              />
            </Box>

            <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="surface" onClick={() => viewerRef.current?.fitView?.()}>Fit View</Button>
              <Button variant="surface" onClick={() => viewerRef.current?.reset?.()}>Reset</Button>
              <Button onClick={buildSample} disabled={busy}>
                {busy ? 'Working…' : 'Build Sample (48×32×32)'}
              </Button>
              <Button variant="soft" onClick={doExportSTEP}>Export STEP</Button>
              <Button variant="soft" onClick={doExportSTL}>Export STL</Button>
              <Button variant="soft" onClick={doExportGLB}>Export GLB</Button>
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
          </Box>
        </Card>

        <Box mt="6">
          <Card>
            <Box p="4">
              <Heading size="6">Editor</Heading>
              <Text as="p" color="gray" size="2">Edit the buildModel(oc) function and RUN to rebuild.</Text>
              <Box mt="3">
                <CodeEditor ref={editorRef} initialCode={getDefaultModelCode()} storageKey="cad-editor-code" height={360} />
              </Box>
              <Box mt="3" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button onClick={runFromEditor} disabled={busy}>{busy ? 'Working…' : 'Run'}</Button>
                <Button variant="soft" onClick={resetEditorToDefault}>Reset to Default</Button>
              </Box>
            </Box>
          </Card>

          <div style={{ maxWidth: 'none' }}>
            <h2>Next Steps</h2>
            <ul>
              <li>Implement exports (STEP/STL/GLTF).</li>
            </ul>
          </div>
        </Box>
      </Box>
    </Section>
  )
}
