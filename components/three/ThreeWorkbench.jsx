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
    initialCode = `// Three.js workbench quickstart\n// Return an object to control the scene props.\n// Available: spinning (bool), wireframe (bool), showBackground (bool), geometry ('cube' | 'torusKnot' | 'icosahedron')\n// Width/height are inferred from the viewer container.\n\nreturn {\n  spinning: true,\n  wireframe: false,\n  showBackground: true,\n  geometry: 'cube',\n}`,
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
      const allowed = ['cube', 'torusKnot', 'icosahedron']
      const next = {
        spinning: Boolean(result?.spinning),
        wireframe: Boolean(result?.wireframe),
        showBackground: result?.showBackground !== false,
        geometry: allowed.includes(result?.geometry) ? result.geometry : 'cube',
      }
      setSceneProps(next)
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
              fullscreen={!!ui?.fullscreen}
            />
          </div>
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
          description={<Text as="span" color="gray" size="2">Return an object to control ThreeCanvas props and click RUN.</Text>}
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
