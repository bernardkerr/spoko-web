'use client'

import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { Box, Text, Button } from '@radix-ui/themes'
import { CodeEditor } from '@/components/common/CodeEditor'
import { useLastGoodCode } from '@/components/common/hooks/useLastGoodCode'
import Workbench from '@/components/common/workbench/Workbench'
import { useWorkbenchInterface } from '@/components/common/hooks/useWorkbenchInterface'
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
  // Mirror Workbench visibility if needed for side effects (not required for rendering)
  const [wbVisible, setWbVisible] = useState(undefined)
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

  // Workbench will handle height defaults; allow explicit override via ui.viewerHeight
  const explicitViewerHeight = useMemo(() => (ui?.viewerHeight ? Number(ui.viewerHeight) : undefined), [ui?.viewerHeight])

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
    <Workbench
      toolbarPosition="bottom"
      // Height: rely on Workbench defaults unless explicitly provided
      viewerHeight={explicitViewerHeight}
      // Visibility persistence per-workbench
      defaultWorkbenchVisible={!!ui?.workbench}
      onWorkbenchVisibleChange={setWbVisible}
      persistVisibilityKey={`three:${id}:wb`}
      status={status}
      error={error}
      // Viewer content
      viewer={(
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
        </div>
      )}
      // Overlay viewer controls (top-left)
      overlayTopLeft={(
        <Box style={{ display: 'flex', gap: 6 }}>
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
      )}
      // No viewer toolbar Run; Run is available in editor actions only
      // Editor content and defaults
      editor={(
        <CodeEditor
          ref={editorRef}
          initialCode={initialValuesRef.current?.code ?? initialCode ?? ''}
          storageKey={`three:${id}:code`}
          height={360}
          language="javascript"
          onChange={handleEditorChange}
        />
      )}
      editorTitle="Editor"
      editorSubtext={<Text as="span" color="gray" size="2">Return props (legacy) or a program object with setup/update/dispose. Click RUN.</Text>}
      showDefaultEditorActions
      onRun={doRun}
      running={busy}
      runLabel={busy ? 'Working…' : 'Run'}
      onResetToLast={resetEditorToLastRunning}
      onResetToOriginal={resetEditorToOriginal}
      defaultEditorOpen={!!showEditorDefault}
    />
  )
})
