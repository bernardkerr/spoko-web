'use client'

import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react'
import { Box, Card, IconButton, Text } from '@radix-ui/themes'
import { Wrench, Download } from 'lucide-react'
import { ThreeCadViewer } from '@/components/cad/ThreeCadViewer'
import { Toolbar } from '@/components/cad/Toolbar'
import { getAssetPath } from '@/lib/paths'
import { saveBlobWithPicker } from '@/components/cad/Exporters'

// A lightweight STL viewer with optional view controls and download.
// - No editor, no OpenCascade. Pure Three.js rendering via ThreeCadViewer.
// - Props mirror many of the CAD viewer options with defaults.
// - "Tool" icon reveals compact tool strip under the viewer: View + Download.
// - "View" toggles the CAD Toolbar overlay; clicking again hides all tools.
// - When tools are open, viewer height expands for comfort.
export const STLViewer = forwardRef(function STLViewer(
  {
    id = 'stlviewer',
    src, // STL file path or URL
    // Size
    height = 280,
    expandedHeight = 460,
    // Whether the Tools (wrench) button is available; hidden by default
    toolsEnabled = false,
    // Motion
    spinMode = 'auto', // 'on' | 'off' | 'auto'
    // Visual defaults align with CAD viewer
    frameMode = 'HIDE',
    shadingMode = 'GRAY',
    originVisible = false,
    styleMode = 'BASIC',
    backgroundMode = 'WHITE',
    outlineThreshold = 45,
    outlineScale = 1.02,
    edgesMode = 'AUTO',
    outlineColorMode = 'AUTO',
    edgesLineWidth = 2,
    ambientLevel = 2.0,
    directionalLevel = 2.0,
    // Behavior
    autoFitOnLoad = true,
    name, // optional display/export base name
  },
  ref
) {
  const noSrc = !src

  const viewerRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // When true, show the CAD-style appearance toolbar overlay and expand height
  const [viewTools, setViewTools] = useState(false)

  // Mirror viewer option states so Toolbar can mutate them
  const [vSpinMode, setVSpinMode] = useState(() => (spinMode === 'on' || spinMode === 'off' || spinMode === 'auto') ? spinMode : 'auto')
  const [vFrameMode, setVFrameMode] = useState(frameMode)
  const [vShadingMode, setVShadingMode] = useState(shadingMode)
  const [vOriginVisible, setVOriginVisible] = useState(!!originVisible)
  const [vStyleMode, setVStyleMode] = useState(styleMode)
  const [vBackgroundMode, setVBackgroundMode] = useState(backgroundMode)
  const [vOutlineThreshold, setVOutlineThreshold] = useState(outlineThreshold)
  const [vOutlineScale, setVOutlineScale] = useState(outlineScale)
  const [vEdgesMode, setVEdgesMode] = useState(edgesMode)
  const [vOutlineColorMode, setVOutlineColorMode] = useState(outlineColorMode)
  const [vEdgesLineWidth, setVEdgesLineWidth] = useState(edgesLineWidth)
  const [vAmbientLevel, setVAmbientLevel] = useState(ambientLevel)
  const [vDirectionalLevel, setVDirectionalLevel] = useState(directionalLevel)

  // Resolve URL respecting basePath for local models
  const resolvedUrl = useMemo(() => {
    if (!src) return ''
    if (/^https?:\/\//i.test(src)) return src
    // route: /api/test-models/models/<file>
    if (src.startsWith('/')) return getAssetPath(src)
    // Treat bare filenames as test-models under docs-test
    return getAssetPath(`/api/test-models/models/${src}`)
  }, [src])

  // Load STL once on mount or when src changes
  useEffect(() => {
    if (!resolvedUrl) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const mod = await import('three/examples/jsm/loaders/STLLoader.js')
        const STLLoader = mod.STLLoader || mod.default || mod
        const loader = new STLLoader()
        const geometry = await loader.loadAsync(resolvedUrl)
        if (cancelled) return
        geometry.computeBoundingBox()
        geometry.computeBoundingSphere()
        viewerRef.current?.setGeometry?.(geometry)
        if (autoFitOnLoad) viewerRef.current?.fitView?.()
      } catch (e) {
        setError(e?.message || String(e))
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [resolvedUrl, autoFitOnLoad])

  const onCycleAmbientLevel = () => {
    const levels = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
    const cur = Number(vAmbientLevel) || 0
    const idx = levels.findIndex(v => Math.abs(v - cur) < 1e-6)
    setVAmbientLevel(levels[(idx >= 0 ? idx + 1 : 0) % levels.length])
  }
  const onCycleDirectionalLevel = () => {
    const levels = [0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
    const cur = Number(vDirectionalLevel) || 0
    const idx = levels.findIndex(v => Math.abs(v - cur) < 1e-6)
    setVDirectionalLevel(levels[(idx >= 0 ? idx + 1 : 0) % levels.length])
  }
  const onCycleStyle = () => {
    const order = ['BASIC', 'STUDIO', 'OUTLINE', 'TOON', 'MATCAP']
    const i = order.indexOf(String(vStyleMode))
    setVStyleMode(order[(i >= 0 ? i + 1 : 0) % order.length])
  }
  const onCycleBackground = () => {
    const order = ['WHITE', 'GRADIENT', 'GRID', 'HORIZON']
    const i = order.indexOf(String(vBackgroundMode))
    setVBackgroundMode(order[(i >= 0 ? i + 1 : 0) % order.length])
  }
  const onCycleEdges = () => {
    const order = ['OFF', 'AUTO', 'BLACK', 'DARK GRAY', 'LIGHT GRAY', 'WHITE']
    const i = order.indexOf(String(vEdgesMode))
    setVEdgesMode(order[(i >= 0 ? i + 1 : 0) % order.length])
  }
  const onCycleOutlineThreshold = () => {
    const vals = [30, 45, 60, 75]
    const i = vals.indexOf(Number(vOutlineThreshold))
    setVOutlineThreshold(vals[(i >= 0 ? i + 1 : 0) % vals.length])
  }
  const onCycleOutlineScale = () => {
    const vals = [1.01, 1.02, 1.03]
    const cur = Number(vOutlineScale) || 1.02
    const i = vals.findIndex(v => Math.abs(v - cur) < 1e-6)
    setVOutlineScale(vals[(i >= 0 ? i + 1 : 0) % vals.length])
  }
  const onCycleEdgesLineWidth = () => {
    const vals = [1.0, 1.35, 1.7, 2.0, 2.5, 3.0]
    const cur = Number(vEdgesLineWidth) || 2
    const i = vals.findIndex(v => Math.abs(v - cur) < 1e-6)
    setVEdgesLineWidth(vals[(i >= 0 ? i + 1 : 0) % vals.length])
  }
  const onCycleOutlineColor = () => {
    const vals = ['AUTO', 'BLACK', 'WHITE']
    const i = vals.indexOf(String(vOutlineColorMode))
    setVOutlineColorMode(vals[(i >= 0 ? i + 1 : 0) % vals.length])
  }
  const onCycleSpin = () => {
    const order = ['off', 'auto', 'on']
    const i = order.indexOf(String(vSpinMode))
    setVSpinMode(order[(i >= 0 ? i + 1 : 0) % order.length])
  }
  const onToggleFrame = () => {
    setVFrameMode(prev => (prev === 'HIDE' ? 'LIGHT' : prev === 'LIGHT' ? 'DARK' : 'HIDE'))
  }
  const onToggleShading = () => {
    const order = ['GRAY', 'WHITE', 'BLACK', 'OFF']
    const i = order.indexOf(String(vShadingMode))
    setVShadingMode(order[(i >= 0 ? i + 1 : 0) % order.length])
  }
  const onToggleOrigin = () => setVOriginVisible(v => !v)

  const doDownload = async () => {
    try {
      const resp = await fetch(resolvedUrl)
      if (!resp.ok) throw new Error(`Download failed: ${resp.status}`)
      const blob = await resp.blob()
      // Derive filename from src by default
      let base = 'model.stl'
      try {
        if (/^https?:\/\//i.test(src)) {
          const u = new URL(src)
          base = u.pathname.split('/').pop() || 'model.stl'
        } else {
          base = (src || 'model.stl').toString().split('/').pop() || 'model.stl'
        }
      } catch {
        base = (src || 'model.stl').toString().split('/').pop() || 'model.stl'
      }
      // Sanitize and enforce .stl
      let safe = (name || base || 'model.stl').replace(/[^\w.-]+/g, '_').replace(/^\.+/, '')
      if (!/\.stl$/i.test(safe)) safe = safe.replace(/\.[^.]*$/g, '') + '.stl'
      await saveBlobWithPicker(safe, blob)
    } catch (e) {
      setError(e?.message || String(e))
    }
  }

  return (
    <Card variant="ghost" className="stlviewer-card">
      <Box p="3" style={{ position: 'relative' }}>
        {/* Missing src message */}
        {noSrc && (
          <Box mb="2"><Text color="red">STLViewer: missing src</Text></Box>
        )}
        {/* Viewer container */}
        <div className="stlviewer-frame" style={{ position: 'relative', width: '100%', height: viewTools ? expandedHeight : height }}>
          {/* Top-right controls: Download (always) + Tools (optional) */}
          <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 8 }}>
            <IconButton variant="soft" radius="full" onClick={doDownload} aria-label="Download STL">
              <Download size={18} />
            </IconButton>
            {toolsEnabled && (
              <IconButton
                variant={viewTools ? 'solid' : 'soft'}
                radius="full"
                onClick={() => setViewTools(v => !v)}
                aria-label={viewTools ? 'Hide Tools' : 'Show Tools'}
              >
                <Wrench size={18} />
              </IconButton>
            )}
          </div>
          {/* Viewer */}
          <ThreeCadViewer
            ref={viewerRef}
            spinMode={vSpinMode}
            frameMode={vFrameMode}
            shadingMode={vShadingMode}
            originVisible={vOriginVisible}
            styleMode={vStyleMode}
            backgroundMode={vBackgroundMode}
            outlineThreshold={vOutlineThreshold}
            outlineScale={vOutlineScale}
            edgesMode={vEdgesMode}
            outlineColorMode={vOutlineColorMode}
            edgesLineWidth={vEdgesLineWidth}
            ambientLevel={vAmbientLevel}
            directionalLevel={vDirectionalLevel}
          />
          {/* Overlay: CAD toolbar when View is toggled on */}
          {viewTools && (
            <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 9 }}>
              <Toolbar
                spinMode={vSpinMode}
                frameMode={vFrameMode}
                shadingMode={vShadingMode}
                originVisible={vOriginVisible}
                onCycleSpin={onCycleSpin}
                onToggleFrame={onToggleFrame}
                onToggleShading={onToggleShading}
                onToggleOrigin={onToggleOrigin}
                styleMode={vStyleMode}
                onCycleStyle={onCycleStyle}
                backgroundMode={vBackgroundMode}
                onCycleBackground={onCycleBackground}
                outlineThreshold={vOutlineThreshold}
                onCycleOutlineThreshold={onCycleOutlineThreshold}
                outlineScale={vOutlineScale}
                onCycleOutlineScale={onCycleOutlineScale}
                edgesMode={vEdgesMode}
                onCycleEdges={onCycleEdges}
                outlineColorMode={vOutlineColorMode}
                onCycleOutlineColor={onCycleOutlineColor}
                edgesLineWidth={vEdgesLineWidth}
                onCycleEdgesLineWidth={onCycleEdgesLineWidth}
                ambientLevel={vAmbientLevel}
                directionalLevel={vDirectionalLevel}
                onCycleAmbientLevel={onCycleAmbientLevel}
                onCycleDirectionalLevel={onCycleDirectionalLevel}
              />
            </div>
          )}
        </div>
        {/* Optional error surface (brief) */}
        {error && (
          <Box mt="2"><Text color="red" size="2">{error}</Text></Box>
        )}
      </Box>
    </Card>
  )
})

export default STLViewer
