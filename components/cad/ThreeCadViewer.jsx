'use client'

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'

// frameMode: 'HIDE' | 'LIGHT' | 'DARK'
// shadingMode: 'GRAY' | 'WHITE' | 'BLACK' | 'OFF'
export const ThreeCadViewer = forwardRef(function ThreeCadViewer(
  { spinEnabled = true, spinMode = 'auto', frameMode = 'HIDE', shadingMode = 'GRAY', originVisible = false, resize, styleMode = 'BASIC', outlineThreshold = 45, outlineScale = 1.02, edgesMode = 'AUTO', outlineColorMode = 'AUTO' },
  ref
) {
  const containerRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const rafRef = useRef(0)
  const modelGroupRef = useRef(null) // holds polygon model
  const wireframeRef = useRef(null)  // holds wireframe overlay
  const edgesRef = useRef(null)      // holds edges/outline overlay
  const outlineRef = useRef(null)    // holds silhouette backface meshes
  const spinRef = useRef(spinEnabled)
  const spinModeRef = useRef(spinMode || (spinEnabled ? 'on' : 'off'))
  const pauseUntilRef = useRef(0)
  const pauseTimerRef = useRef(null)
  const axesRef = useRef(null) // origin axes helper
  const lastSizeRef = useRef({ w: 0, h: 0 })
  const debounceRef = useRef(0)
  const envRTRef = useRef(null)      // environment render target (PMREM)
  const pmremRef = useRef(null)      // PMREMGenerator
  const lightRigRef = useRef([])     // style-managed lights
  const toonTexRef = useRef(null)    // gradient map for toon
  const matcapTexRef = useRef(null)  // generated matcap
  const composerRef = useRef(null)   // post-processing composer
  const smaaPassRef = useRef(null)   // SMAA pass
  const lineResolutionRef = useRef(new THREE.Vector2(1, 1)) // for LineMaterial

  // helper to apply shading to current model group
  const applyShading = (mode) => {
    const group = modelGroupRef.current
    const edgesGroup = edgesRef.current
    const outlineGroup = outlineRef.current
    if (!group) return
    // Local helper to check ancestry without relying on outer scope
    const isDescendantOf = (node, ancestor) => {
      if (!node || !ancestor) return false
      let p = node.parent
      while (p) { if (p === ancestor) return true; p = p.parent }
      return false
    }
    // For OFF: hide only base meshes so adorners can remain visible
    if (mode === 'OFF') {
      // Force outline hidden when shading is OFF
      if (outlineGroup) outlineGroup.visible = false
      group.traverse((obj) => {
        if (obj.isMesh) {
          // Keep silhouette meshes (in outline group) visible if outline is enabled
          if (isDescendantOf(obj, outlineGroup)) return
          // Hide base meshes
          obj.visible = false
        }
      })
      return
    }
    // For normal shaded modes, ensure base meshes visible and set their material
    group.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        // Skip outline backfaces; only update base meshes
        if (isDescendantOf(obj, outlineGroup)) return
        obj.visible = true
        const mat = obj.material
        if (mode === 'BLACK') {
          mat.color.setHex(0x000000)
          mat.opacity = 1
          mat.transparent = false
          // suppress specular/reflections for true black
          if ('metalness' in mat) mat.metalness = 0
          if ('roughness' in mat) mat.roughness = 1
          if ('clearcoat' in mat) mat.clearcoat = 0
          if ('envMapIntensity' in mat) mat.envMapIntensity = 0
        } else if (mode === 'WHITE') {
          mat.color.setHex(0xffffff)
          mat.opacity = 1
          mat.transparent = false
        } else { // GRAY
          mat.color.setHex(0xe0e0e0)
          mat.opacity = 1
          mat.transparent = false
        }
        mat.needsUpdate = true
      }
    })
  }

  // init Three
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Defensive: clear any existing children/canvas to avoid multiple contexts (HMR/remounts)
    while (container.firstChild) {
      try { container.removeChild(container.firstChild) } catch {}
    }

    const scene = new THREE.Scene()
    // background set in applyStyle based on theme

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.set(6, 6, 6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    // Size the drawing buffer and CSS style to match container
    renderer.setSize(container.clientWidth, container.clientHeight, true)
    container.appendChild(renderer.domElement)
    // Force canvas to stretch to container both width and height
    if (renderer.domElement && renderer.domElement.style) {
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      renderer.domElement.style.display = 'block'
      renderer.domElement.style.position = 'absolute'
      // ensure full fill regardless of other CSS
      renderer.domElement.style.inset = '0'
      // override typography rules like .prose canvas { max-width: 900px; margin: 16px auto }
      renderer.domElement.style.maxWidth = 'none'
      renderer.domElement.style.margin = '0'
    }

    // Enforce normal block layout and ensure stretching inside flex parents
    container.style.display = 'block'
    container.style.position = 'relative'
    container.style.width = '100%'
    container.style.height = '100%'
    container.style.minWidth = '0'
    container.style.minHeight = '0'
    container.style.flex = '1 1 auto'
    container.style.alignSelf = 'stretch'

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.rotateSpeed = 0.8

    // lights created per-style in applyStyle

    // origin axes helper
    const axes = new THREE.AxesHelper(20)
    axes.visible = !!originVisible
    scene.add(axes)
    axesRef.current = axes

    // groups
    const modelGroup = new THREE.Group()
    const wireGroup = new THREE.Group()
    const edgesGroup = new THREE.Group()
    const outlineGroup = new THREE.Group()
    scene.add(modelGroup)
    // Parent adorners to the main model group so they follow transforms
    modelGroup.add(wireGroup)
    modelGroup.add(edgesGroup)
    modelGroup.add(outlineGroup)
    // Initial visibility: edges follow edgesMode (hidden when OFF)
    edgesGroup.visible = (edgesMode !== 'OFF')

    // placeholder cube as initial model
    const geom = new THREE.BoxGeometry(2, 2, 2)
    const mat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.1, roughness: 0.8 })
    const mesh = new THREE.Mesh(geom, mat)
    modelGroup.add(mesh)

    const wfGeo0 = new THREE.WireframeGeometry(geom)
    const wfSegGeo0 = new LineSegmentsGeometry()
    wfSegGeo0.setPositions(wfGeo0.attributes.position.array)
    const wfMat0 = new LineMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, linewidth: 1.25, depthTest: true, depthWrite: false })
    wfMat0.resolution.copy(lineResolutionRef.current)
    const wire = new LineSegments2(wfSegGeo0, wfMat0)
    wireGroup.add(wire)

    // save refs
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls
    modelGroupRef.current = modelGroup
    wireframeRef.current = wireGroup
    edgesRef.current = edgesGroup
    outlineRef.current = outlineGroup

    // build initial adorners for placeholder
    rebuildAdorners()

    // ---- Post-processing (SMAA + MSAA when available) ----
    // Prefer MSAA with SMAA in the post-processing pipeline on WebGL2 for crisper lines.
    let composer
    if (renderer.capabilities && renderer.capabilities.isWebGL2 && THREE.WebGLMultisampleRenderTarget) {
      const msaaRT = new THREE.WebGLMultisampleRenderTarget(container.clientWidth || 1, container.clientHeight || 1, { samples: 4 })
      composer = new EffectComposer(renderer, msaaRT)
    } else {
      composer = new EffectComposer(renderer)
    }
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)
    // SMAA expects pixel dimensions
    const prInit = renderer.getPixelRatio ? renderer.getPixelRatio() : 1
    const smaa = new SMAAPass((container.clientWidth || 1) * prInit, (container.clientHeight || 1) * prInit)
    composer.addPass(smaa)
    composerRef.current = composer
    smaaPassRef.current = smaa

    // resize
    const resizeNow = (w, h) => {
      const renderer = rendererRef.current
      const camera = cameraRef.current
      if (!renderer || !camera) return
      // Avoid zero sizes
      if (w <= 0 || h <= 0) return
      // Update drawing buffer and CSS size to match container exactly
      renderer.setSize(w, h, true)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      lastSizeRef.current = { w, h }
      // update line material resolution (pixels)
      const pr = renderer.getPixelRatio ? renderer.getPixelRatio() : 1
      lineResolutionRef.current.set(w * pr, h * pr)
      const applyLineResolution = (root) => {
        root.traverse((obj) => {
          const mat = obj.material
          if (mat && (mat instanceof LineMaterial)) {
            mat.resolution.copy(lineResolutionRef.current)
          }
        })
      }
      const wireG = wireframeRef.current
      const edgesG = edgesRef.current
      if (wireG) applyLineResolution(wireG)
      if (edgesG) applyLineResolution(edgesG)
    }

    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      resizeNow(w, h)
      // ensure composer size and SMAA resolution track canvas & pixel ratio
      if (composerRef.current) composerRef.current.setSize(w, h)
      if (smaaPassRef.current) {
        const pr = renderer.getPixelRatio ? renderer.getPixelRatio() : 1
        smaaPassRef.current.setSize(Math.max(1, w * pr), Math.max(1, h * pr))
      }
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(container)
    // Ensure we sync size immediately after mount
    onResize()

    // interaction handling for auto spin pause
    const INTERACTION_EVENTS = ['pointerdown', 'wheel', 'touchstart']
    const onUserInteracted = () => {
      if (spinModeRef.current !== 'auto') return
      // pause spinning for 20s from last interaction
      const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
      pauseUntilRef.current = now + 20000
      spinRef.current = false
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
      const delay = Math.max(0, pauseUntilRef.current - now)
      pauseTimerRef.current = setTimeout(() => {
        // resume if still in auto and pause elapsed
        if (spinModeRef.current === 'auto') {
          spinRef.current = true
        }
      }, delay)
    }
    controls.addEventListener('start', onUserInteracted)
    INTERACTION_EVENTS.forEach((ev) => renderer.domElement.addEventListener(ev, onUserInteracted, { passive: true }))

    // animation loop
    const tick = () => {
      // Auto mode guard: if we are in auto and pause is active, ensure spin is off
      if (spinModeRef.current === 'auto') {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
        if (now < pauseUntilRef.current) {
          spinRef.current = false
        }
      }
      if (spinRef.current && modelGroupRef.current) {
        modelGroupRef.current.rotation.y += 0.01
      }
      controls.update()
      const composer = composerRef.current
      if (composer) composer.render()
      else renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    // Snapshot timers to avoid reading changing refs in cleanup
    const cleanupDebounce = debounceRef.current
    const cleanupPauseTimer = pauseTimerRef.current

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      if (cleanupDebounce) clearTimeout(cleanupDebounce)
      if (cleanupPauseTimer) clearTimeout(cleanupPauseTimer)
      controls.removeEventListener('start', onUserInteracted)
      INTERACTION_EVENTS.forEach((ev) => renderer.domElement.removeEventListener(ev, onUserInteracted))
      controls.dispose()
      // dispose pmrem/env
      if (pmremRef.current) {
        pmremRef.current.dispose?.()
        pmremRef.current = null
      }
      if (envRTRef.current) {
        envRTRef.current.dispose()
        envRTRef.current = null
      }
      // dispose composer
      if (composerRef.current) {
        composerRef.current.passes?.splice(0)
        composerRef.current = null
      }
      renderer.dispose()
      container.removeChild(renderer.domElement)
      // dispose basic resources
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose?.()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose?.())
          else obj.material?.dispose?.()
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

// respond to spin inputs: prefer spinMode if provided
useEffect(() => {
  const mode = spinMode || (spinEnabled ? 'on' : 'off')
  spinModeRef.current = mode
  if (mode === 'on') {
    spinRef.current = true
  } else if (mode === 'off') {
    spinRef.current = false
  } else if (mode === 'auto') {
    // start spinning unless paused
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()
    spinRef.current = now >= pauseUntilRef.current
  }
}, [spinEnabled, spinMode])

// respond to frame mode
useEffect(() => {
  const wire = wireframeRef.current
  if (!wire) return
  if (frameMode === 'HIDE') {
    wire.visible = false
  } else {
    wire.visible = true
    wire.traverse((obj) => {
      if (obj.material) {
        const dark = isDarkTheme()
        if (frameMode === 'LIGHT') {
          obj.material.color.setHex(dark ? 0xeeeeee : 0xffffff)
          obj.material.opacity = 0.65
          obj.material.transparent = true
        } else {
          obj.material.color.setHex(dark ? 0x555555 : 0x333333)
          obj.material.opacity = 0.8
          obj.material.transparent = true
        }
        obj.material.needsUpdate = true
      }
    })
  }
}, [frameMode])

  // respond to origin visibility
  useEffect(() => {
    if (axesRef.current) axesRef.current.visible = !!originVisible
  }, [originVisible])

  // respond to shading mode
  useEffect(() => {
    applyShading(shadingMode)
    // Rebuild adorners to update edge/silhouette colors and visibility
    rebuildAdorners()
    // Re-assert visibility rules after shading changes
    const edgesGroup = edgesRef.current
    const outlineGroup = outlineRef.current
    if (edgesGroup) edgesGroup.visible = (edgesMode !== 'OFF')
    if (outlineGroup) outlineGroup.visible = (shadingMode === 'OFF') ? false : ((styleMode === 'OUTLINE' || styleMode === 'TOON') && (outlineColorMode !== 'OFF'))
  }, [shadingMode])

  // placeholder for future style-driven changes; BASIC is the current look
  useEffect(() => {
    // Apply or switch visual style
    applyStyle(styleMode)
    // Also refresh adorners to reflect style-driven changes immediately
    rebuildAdorners()
    // Ensure outline visibility respects outlineColorMode
    const outlineGroup = outlineRef.current
    if (outlineGroup) outlineGroup.visible = (shadingMode === 'OFF') ? false : ((styleMode === 'OUTLINE' || styleMode === 'TOON') && (outlineColorMode !== 'OFF'))
  }, [styleMode])

  // respond to edges mode: affects edges overlay visibility across all styles
  useEffect(() => {
    const edgesGroup = edgesRef.current
    if (!edgesGroup) return
    edgesGroup.visible = (edgesMode !== 'OFF')
    // Rebuild to apply color override if not AUTO
    rebuildAdorners()
  }, [edgesMode])

  // respond to outline color mode changes
  useEffect(() => {
    const outlineGroup = outlineRef.current
    if (outlineGroup) outlineGroup.visible = (shadingMode === 'OFF') ? false : ((styleMode === 'OUTLINE' || styleMode === 'TOON') && (outlineColorMode !== 'OFF'))
    rebuildAdorners()
  }, [outlineColorMode])

  // respond to outline controls: threshold and scale
  useEffect(() => {
    rebuildAdorners()
  }, [outlineThreshold, outlineScale])

  useImperativeHandle(ref, () => ({
    // Replace the current model geometry with a given BufferGeometry
    // Accepts THREE.BufferGeometry and optional material
    setGeometry: (geometry, material) => {
      const group = modelGroupRef.current
      const wire = wireframeRef.current
      const edgesGroup = edgesRef.current
      const outlineGroup = outlineRef.current
      if (!group || !wire || !edgesGroup || !outlineGroup) return

      // clear previous meshes but keep adorner groups (wire, edges, outline) attached
      for (let i = group.children.length - 1; i >= 0; i--) {
        const child = group.children[i]
        if (child.isMesh) {
          group.remove(child)
          child.geometry?.dispose?.()
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose?.())
          else child.material?.dispose?.()
        }
      }
      for (let i = wire.children.length - 1; i >= 0; i--) {
        const child = wire.children[i]
        wire.remove(child)
        if (child.geometry) child.geometry.dispose?.()
        if (child.material) child.material.dispose?.()
      }
      // clear edges overlay from previous geometry
      for (let i = edgesGroup.children.length - 1; i >= 0; i--) {
        const child = edgesGroup.children[i]
        edgesGroup.remove(child)
        child.geometry?.dispose?.()
        child.material?.dispose?.()
      }
      // clear silhouette outline from previous geometry
      for (let i = outlineGroup.children.length - 1; i >= 0; i--) {
        const child = outlineGroup.children[i]
        outlineGroup.remove(child)
        child.geometry?.dispose?.()
        child.material?.dispose?.()
      }

      const mat = material || createStyleMaterial(styleMode)
      const mesh = new THREE.Mesh(geometry, mat)
      group.add(mesh)

      // ensure current shading is applied immediately to the new material
      applyShading(shadingMode)

      const wfGeo = new THREE.WireframeGeometry(geometry)
      const wfSegGeo = new LineSegmentsGeometry()
      wfSegGeo.setPositions(wfGeo.attributes.position.array)
      const wfMat = new LineMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, linewidth: 1.25, depthTest: true, depthWrite: false })
      wfMat.resolution.copy(lineResolutionRef.current)
      const wireMesh = new LineSegments2(wfSegGeo, wfMat)
      wire.add(wireMesh)

      // rebuild edges/silhouette adorners using current controls
      rebuildAdorners()

      // fit view
      const box = new THREE.Box3().setFromObject(group)
      const size = box.getSize(new THREE.Vector3()).length()
      const center = box.getCenter(new THREE.Vector3())
      const camera = cameraRef.current
      const controls = controlsRef.current
      if (camera && controls) {
        controls.target.copy(center)
        const distance = size * 1.5 / Math.tan((camera.fov * Math.PI) / 360)
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize()
        camera.position.copy(dir.multiplyScalar(distance).add(controls.target))
        camera.near = size / 100
        camera.far = size * 10
        camera.updateProjectionMatrix()
        controls.update()
      }
    },
    fitView: () => {
      const group = modelGroupRef.current
      if (!group) return
      const box = new THREE.Box3().setFromObject(group)
      const size = box.getSize(new THREE.Vector3()).length()
      const center = box.getCenter(new THREE.Vector3())
      const camera = cameraRef.current
      const controls = controlsRef.current
      if (camera && controls) {
        controls.target.copy(center)
        const distance = size * 1.5 / Math.tan((camera.fov * Math.PI) / 360)
        const dir = new THREE.Vector3().subVectors(camera.position, controls.target).normalize()
        camera.position.copy(dir.multiplyScalar(distance).add(controls.target))
        camera.near = size / 100
        camera.far = size * 10
        camera.updateProjectionMatrix()
        controls.update()
      }
    },
    reset: () => {
      const group = modelGroupRef.current
      const wire = wireframeRef.current
      if (group) group.rotation.set(0, 0, 0)
      if (wire) wire.rotation.set(0, 0, 0)
      const camera = cameraRef.current
      const controls = controlsRef.current
      if (camera && controls) {
        camera.position.set(6, 6, 6)
        controls.target.set(0, 0, 0)
        camera.updateProjectionMatrix()
        controls.update()
      }
    },
  }))

  // -------- Style helpers ---------
  const isDarkTheme = () => {
    if (typeof document === 'undefined') return false
    const root = document.documentElement
    const ds = root.getAttribute('data-theme')
    if (ds === 'dark') return true
    if (ds === 'light') return false
    if (root.classList.contains('dark')) return true
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // Determine edges color based on edgesMode override, else shading
  const getAdornerColor = (shading, eMode) => {
    // Edges mode override first
    switch ((eMode || 'AUTO').toUpperCase()) {
      case 'OFF':
        // hidden elsewhere; color irrelevant
        return 0x000000
      case 'DK GRAY':
        return 0x4a4a4a
      case 'LGT GRAY':
        return 0xbfbfbf
      case 'WHITE':
        return 0xffffff
      case 'BLACK':
        return 0x000000
      case 'AUTO':
      default:
        break
    }
    // AUTO: derive from shading
    if (shading === 'GRAY') return 0xffffff
    if (shading === 'WHITE') return 0x7a7a7a
    if (shading === 'BLACK' || shading === 'OFF') return 0x7a7a7a
    return 0x000000
  }

  // Map an explicit outline color mode to a hex color
  const getColorFromMode = (mode) => {
    switch ((mode || 'AUTO').toUpperCase()) {
      case 'DK GRAY': return 0x4a4a4a
      case 'LGT GRAY': return 0xbfbfbf
      case 'WHITE': return 0xffffff
      case 'BLACK': return 0x000000
      default: return null
    }
  }

  // Determine outline color based on outlineColorMode; AUTO follows edges color
  const getOutlineColor = (shading, eMode, oMode) => {
    const m = (oMode || 'AUTO').toUpperCase()
    if (m === 'OFF') return null
    if (m === 'AUTO') return getAdornerColor(shading, eMode)
    const c = getColorFromMode(m)
    return (c == null) ? getAdornerColor(shading, eMode) : c
  }

  const ensurePMREM = () => {
    const renderer = rendererRef.current
    if (!renderer) return null
    if (!pmremRef.current) pmremRef.current = new THREE.PMREMGenerator(renderer)
    return pmremRef.current
  }

  const clearStyle = () => {
    const scene = sceneRef.current
    if (!scene) return
    // remove lights
    lightRigRef.current.forEach(l => scene.remove(l))
    lightRigRef.current = []
    // clear env
    scene.environment = null
    if (envRTRef.current) {
      envRTRef.current.dispose()
      envRTRef.current = null
    }
    // Do not clear edges/silhouette here; they are rebuilt on geometry changes
  }

  const createToonGradient = (steps = 5, dark = false) => {
    if (toonTexRef.current) return toonTexRef.current
    // Use power-of-two width to avoid internal format/LOD issues across WebGL implementations
    const width = 256
    const height = 1
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    // Paint discrete bands across the width
    const bands = Math.max(2, Math.min(16, steps | 0))
    for (let i = 0; i < bands; i++) {
      const t = i / (bands - 1)
      const v = Math.round((dark ? (0.15 + 0.75 * t) : (0.25 + 0.7 * t)) * 255)
      ctx.fillStyle = `rgb(${v},${v},${v})`
      const x0 = Math.floor((i / bands) * width)
      const x1 = Math.floor(((i + 1) / bands) * width)
      ctx.fillRect(x0, 0, Math.max(1, x1 - x0), height)
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.ClampToEdgeWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.generateMipmaps = false
    toonTexRef.current = tex
    return tex
  }

  const createMatcapTexture = (dark = false) => {
    if (matcapTexRef.current) return matcapTexRef.current
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    // radial gradient for soft plastic
    const g = ctx.createRadialGradient(size * 0.35, size * 0.35, size * 0.1, size * 0.5, size * 0.5, size * 0.6)
    const base = dark ? 0x262626 : 0xdedede
    const hi = dark ? 0x444444 : 0xffffff
    const lo = dark ? 0x141414 : 0xc8c8c8
    const toRGB = (hex) => `${(hex>>16)&255},${(hex>>8)&255},${hex&255}`
    g.addColorStop(0, `rgb(${toRGB(hi)})`)
    g.addColorStop(0.5, `rgb(${toRGB(base)})`)
    g.addColorStop(1, `rgb(${toRGB(lo)})`)
    ctx.fillStyle = g
    ctx.fillRect(0,0,size,size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    matcapTexRef.current = tex
    return tex
  }

  const createStyleMaterial = (mode) => {
    const dark = isDarkTheme()
    switch (mode) {
      case 'STUDIO':
        return new THREE.MeshPhysicalMaterial({
          color: dark ? 0x202020 : 0xe8e8e8,
          metalness: 0.05,
          roughness: 0.5,
          clearcoat: 0.25,
          clearcoatRoughness: 0.75,
        })
      case 'TOON': {
        const grad = createToonGradient(5, dark)
        const m = new THREE.MeshToonMaterial({ color: dark ? 0x2a2a2a : 0xe0e0e0, gradientMap: grad })
        return m
      }
      case 'MATCAP': {
        const matcap = createMatcapTexture(dark)
        return new THREE.MeshMatcapMaterial({ color: 0xffffff, matcap })
      }
      case 'OUTLINE':
        // Base on studio material; outline handled by edges overlay
        return new THREE.MeshPhysicalMaterial({
          color: dark ? 0x202020 : 0xededed,
          metalness: 0.05,
          roughness: 0.5,
          clearcoat: 0.2,
          clearcoatRoughness: 0.75,
        })
      case 'BASIC':
      default:
        return new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.1, roughness: 0.8 })
    }
  }

  // Build edges and silhouette adorners from current base model meshes
  const rebuildAdorners = () => {
    const group = modelGroupRef.current
    const edgesGroup = edgesRef.current
    const outlineGroup = outlineRef.current
    if (!group || !edgesGroup || !outlineGroup) return
    const edgesColor = getAdornerColor(shadingMode, edgesMode)
    const outlineColor = getOutlineColor(shadingMode, edgesMode, outlineColorMode)
    // clear existing adorners
    for (let i = edgesGroup.children.length - 1; i >= 0; i--) {
      const c = edgesGroup.children[i]
      edgesGroup.remove(c)
      c.geometry?.dispose?.()
      c.material?.dispose?.()
    }
    for (let i = outlineGroup.children.length - 1; i >= 0; i--) {
      const c = outlineGroup.children[i]
      outlineGroup.remove(c)
      c.geometry?.dispose?.()
      c.material?.dispose?.()
    }
    // add adorners per mesh
    group.traverse((obj) => {
      if (!obj.isMesh || !obj.geometry) return
      const geometry = obj.geometry
      // edges
      const edgeGeom = new THREE.EdgesGeometry(geometry, outlineThreshold || 45)
      const edgeSegGeom = new LineSegmentsGeometry()
      edgeSegGeom.setPositions(edgeGeom.attributes.position.array)
      // Use depthTest so hidden edges are occluded; disable depthWrite to avoid affecting depth buffer
      const edgeMat = new LineMaterial({
        color: edgesColor,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        depthTest: true,
        linewidth: 1.35,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
      edgeMat.resolution.copy(lineResolutionRef.current)
      const edgeLines = new LineSegments2(edgeSegGeom, edgeMat)
      edgeLines.renderOrder = 2
      edgesGroup.add(edgeLines)
      // silhouette
      const silhouetteMat = new THREE.MeshBasicMaterial({
        color: outlineColor ?? 0x000000,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: true,
        transparent: false,
        opacity: 1.0,
      })
      if (outlineColor != null) {
        const silhouette = new THREE.Mesh(geometry.clone(), silhouetteMat)
        silhouette.scale.multiplyScalar(outlineScale || 1.02)
        // Render BEFORE base mesh so front faces naturally occlude the backface silhouette
        silhouette.renderOrder = -1
        outlineGroup.add(silhouette)
      }

      // Soft outer silhouette for faux anti-aliasing (slightly larger, lower opacity)
      const softMat = new THREE.MeshBasicMaterial({
        color: outlineColor ?? 0x000000,
        side: THREE.BackSide,
        depthWrite: false,
        depthTest: true,
        transparent: true,
        opacity: 0.25,
      })
      if (outlineColor != null) {
        const soft = new THREE.Mesh(geometry.clone(), softMat)
        const baseScale = (outlineScale || 1.02)
        soft.scale.multiplyScalar(baseScale * 1.004)
        soft.renderOrder = -2
        outlineGroup.add(soft)
      }
    })
    const mode = styleMode
  }

  const applyStyle = (mode) => {
    const scene = sceneRef.current
    const renderer = rendererRef.current
    const modelGroup = modelGroupRef.current
    const edgesGroup = edgesRef.current
    const outlineGroup = outlineRef.current
    if (!renderer || !scene || !modelGroup || !edgesGroup || !outlineGroup) return

    // base background by theme
    const dark = isDarkTheme()
    scene.background = new THREE.Color(dark ? 0x0b0b0c : 0xf7f7f8)

    // Clear previous style lights/env/edges
    clearStyle()

    // Renderer defaults
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.shadowMap.enabled = false

    // Lights and environment per style
    if (mode === 'BASIC') {
      // simple ambient + directional, no env
      const amb = new THREE.AmbientLight(0xffffff, 0.5)
      const dir = new THREE.DirectionalLight(0xffffff, 0.8)
      dir.position.set(3, 4, 5)
      scene.add(amb, dir)
      lightRigRef.current = [amb, dir]
      scene.environment = null
      // outlines off in BASIC
      if (edgesRef.current) edgesRef.current.visible = false
      if (outlineRef.current) outlineRef.current.visible = false
    } else if (mode === 'STUDIO' || mode === 'OUTLINE') {
      // three-point light rig + room environment
      const key = new THREE.DirectionalLight(0xffffff, 1.0)
      key.position.set(5, 6, 4)
      const fill = new THREE.DirectionalLight(0xffffff, 0.4)
      fill.position.set(-6, 3, 2)
      const rim = new THREE.DirectionalLight(0xffffff, 0.6)
      rim.position.set(0, 4, -6)
      const amb = new THREE.AmbientLight(0xffffff, 0.2)
      scene.add(key, fill, rim, amb)
      lightRigRef.current = [key, fill, rim, amb]
      // Neutral room environment
      const pmrem = ensurePMREM()
      if (pmrem) {
        const env = new RoomEnvironment()
        const rt = pmrem.fromScene(env, 0.04)
        envRTRef.current = rt
        scene.environment = rt.texture
      }
    } else if (mode === 'TOON') {
      // Three-point rig for stronger shape definition; no env for clean banding
      const key = new THREE.DirectionalLight(0xffffff, 1.0)
      key.position.set(5, 6, 4)
      const fill = new THREE.DirectionalLight(0xffffff, 0.35)
      fill.position.set(-5, 2.5, 3)
      const rim = new THREE.DirectionalLight(0xffffff, 0.7)
      rim.position.set(-1, 4, -6)
      const amb = new THREE.AmbientLight(0xffffff, 0.15)
      scene.add(key, fill, rim, amb)
      lightRigRef.current = [key, fill, rim, amb]
      scene.environment = null
      renderer.toneMapping = THREE.NoToneMapping
      renderer.toneMappingExposure = 1.0
    } else if (mode === 'MATCAP') {
      // no lights, no env (matcap ignores lighting)
      lightRigRef.current = []
      scene.environment = null
      renderer.toneMapping = THREE.NoToneMapping
      renderer.toneMappingExposure = 1.0
    }

    // Apply new base material to model meshes (skip adorners)
    const newMat = createStyleMaterial(mode)
    const wireGroup = wireframeRef.current
    const edgesG = edgesRef.current
    const outlineG = outlineRef.current
    const isUnder = (node, ancestor) => {
      if (!node || !ancestor) return false
      let p = node.parent
      while (p) { if (p === ancestor) return true; p = p.parent }
      return false
    }
    modelGroup.traverse((obj) => {
      if (obj.isMesh) {
        if (isUnder(obj, wireGroup) || isUnder(obj, edgesG) || isUnder(obj, outlineG)) return
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose?.())
        else obj.material?.dispose?.()
        obj.material = newMat.clone()
      }
    })
    // Reapply current shading choice
    applyShading(shadingMode)

    // Toggle adorner visibility for the selected style immediately
    outlineGroup.visible = (mode === 'OUTLINE' || mode === 'TOON')
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        position: 'relative',
        minWidth: 0,
        minHeight: 0,
        flex: '1 1 auto',
        alignSelf: 'stretch',
      }}
    />
  )
})
