'use client'

import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { Box, Text, Button } from '@radix-ui/themes'
import { Play } from 'lucide-react'
import { CodeEditor } from '@/components/common/CodeEditor'
import { useLastGoodCode } from '@/components/common/hooks/useLastGoodCode'
import { WorkbenchShell } from '@/components/common/WorkbenchShell'
import { useWorkbenchInterface } from '@/components/common/hooks/useWorkbenchInterface'
import { ViewerChrome } from '@/components/common/ViewerChrome'
import { EditorPanel } from '@/components/common/EditorPanel'
import { ThreeCanvas } from '@/components/ThreeCanvas'

export const ThreeWorkbench = forwardRef(function ThreeWorkbench(
  {
    id = 'threewb',
    initialCode = `// Three.js Workbench quickstart\n// Option A: return props (legacy)\n//   return { spinning: true, wireframe: false, showBackground: true, geometry: 'cube' }\n// Option B: return a program lifecycle (setup/update/dispose) to build full apps.\n//   return {\n//     async setup({ THREE, add, materials, themeColors }) {\n//       const geo = new THREE.TorusKnotGeometry(1.2, 0.35, 150, 16)\n//       const mat = materials.standard({ color: themeColors.accent, roughness: 0.35, metalness: 0.2 })\n//       const mesh = new THREE.Mesh(geo, mat); add(mesh); this.mesh = mesh\n//     },\n//     update({ dt }) { if (this.mesh) this.mesh.rotation.y += dt * 0.8 },\n//     dispose({ remove }) { if (this.mesh) { remove(this.mesh); this.mesh.geometry.dispose(); this.mesh.material.dispose() } },\n//   }\n`,
    autoRun = true,
    showEditorDefault = false,
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
  const [sceneProps, setSceneProps] = useState({ spinning: true, wireframe: false, showBackground: true, geometry: 'cube' })
  const [program, setProgram] = useState(null)
  const [lightIntensity, setLightIntensity] = useState(1)
  const [bgMode, setBgMode] = useState('auto') // auto | white | black | light | dark

  const bgColor = useMemo(() => {
    switch (bgMode) {
      case 'white': return '#ffffff'
      case 'black': return '#000000'
      case 'light': return '#f8fafc' // slate-50-ish
      case 'dark': return '#0f172a'  // slate-900-ish
      default: return null // auto -> theme
    }
  }, [bgMode])

  const containerRef = useRef(null)
  const editorRef = useRef(null)

  const { read, writeCode, writeLastGood, resolveSource } = useLastGoodCode('three', id, initialCode || '')
  const initialValuesRef = useRef(null)
  useEffect(() => { initialValuesRef.current = read() }, [read])

  const handleEditorChange = (val) => { writeCode(val) }

  const viewerHeight = useMemo(() => (ui?.viewerHeight ? Number(ui.viewerHeight) : (workbenchVisible ? 420 : 520)), [ui?.viewerHeight, workbenchVisible])

  async function doRun() {
    if (!containerRef.current) return
    setBusy(true)
    setError(null)
    setStatus('Running…')
    onStatus?.('Running…')

    try {
      const src = resolveSource(() => editorRef.current?.getValue?.()) || ''
      // Wrap user code to allow returning props
      const wrapped = '"use strict"; return (async () => {\n' + src + '\n})'
      const factory = new Function(wrapped)()
      const result = await factory()
      const isProgram = result && (typeof result.setup === 'function' || typeof result.update === 'function' || typeof result.dispose === 'function')
      if (isProgram) {
        setProgram(result)
        // Keep sceneProps unchanged for back-compat
      } else {
        setProgram(null)
        const allowed = ['cube', 'torusKnot', 'icosahedron']
        const next = {
          spinning: Boolean(result?.spinning),
          wireframe: Boolean(result?.wireframe),
          showBackground: result?.showBackground !== false,
          geometry: allowed.includes(result?.geometry) ? result.geometry : 'cube',
        }
        setSceneProps(next)
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
    <WorkbenchShell
      viewer={(
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <ViewerChrome
            visible={workbenchVisible}
            onOpen={() => setWorkbenchVisible(true)}
            onClose={() => setWorkbenchVisible(false)}
          />
          <div ref={containerRef} style={{ width: '100%', height: '100%', padding: 8, boxSizing: 'border-box' }}>
            <ThreeCanvas
              spinning={sceneProps.spinning}
              wireframe={sceneProps.wireframe}
              showBackground={sceneProps.showBackground}
              geometry={sceneProps.geometry}
              program={program}
              fullscreen={!!ui?.fullscreen}
              lightIntensity={lightIntensity}
              backgroundColor={bgColor}
            />
          </div>
          {/* Overlay viewer controls (top-left) */}
          <Box style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 6, zIndex: 3 }}>
            <Button size="1" variant="surface" onClick={() => {
              const order = ['auto','white','black','light','dark']
              const i = order.indexOf(bgMode)
              setBgMode(order[(i >= 0 ? i + 1 : 0) % order.length])
            }} title={`Background: ${bgMode}`}>
              BG: {bgMode}
            </Button>
            <Button size="1" variant="surface" onClick={() => {
              const levels = [0.5, 1.0, 1.5, 2.0]
              const cur = Number(lightIntensity) || 1
              const idx = levels.findIndex(v => Math.abs(v - cur) < 1e-6)
              setLightIntensity(levels[(idx >= 0 ? idx + 1 : 0) % levels.length])
            }} title={`Light: ${lightIntensity.toFixed(1)}x`}>
              Light: {lightIntensity.toFixed(1)}x
            </Button>
          </Box>
        </div>
      )}
      toolbar={workbenchVisible ? (
        <Box style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button onClick={doRun} disabled={busy}>
            <Play width={18} height={18} style={{ marginRight: 6 }} />
            {busy ? 'Working…' : 'Run'}
          </Button>
          {!showEditor && (
            <Button variant="solid" onClick={() => setShowEditor(true)}>Open Editor</Button>
          )}
        </Box>
      ) : null}
      status={workbenchVisible ? (<Text size="2" color={error ? 'red' : 'gray'}>Status: {status}</Text>) : null}
      error={workbenchVisible && error ? (<pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{error}</pre>) : null}
      editor={workbenchVisible && showEditor ? (
        <EditorPanel
          title="Editor"
          onClose={() => setShowEditor(false)}
          description={<Text as="span" color="gray" size="2">Return props (legacy) or a program object with setup/update/dispose. Click RUN.</Text>}
          actions={(
            <>
              <Button onClick={doRun} disabled={busy}>{busy ? 'Working…' : 'Run'}</Button>
              <Button variant="soft" onClick={resetEditorToLastRunning}>Reset to Last Running</Button>
              <Button variant="soft" onClick={resetEditorToOriginal}>Reset to Original</Button>
            </>
          )}
        >
          <CodeEditor
            ref={editorRef}
            initialCode={initialValuesRef.current?.code ?? initialCode ?? ''}
            storageKey={`three:${id}:code`}
            height={360}
            language="javascript"
            onChange={handleEditorChange}
          />
        </EditorPanel>
      ) : null}
      viewerHeight={viewerHeight}
    />
  )
})
