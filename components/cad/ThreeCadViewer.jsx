'use client'

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// frameMode: 'HIDE' | 'LIGHT' | 'DARK'
// shadingMode: 'GRAY' | 'WHITE' | 'BLACK' | 'OFF'
export const ThreeCadViewer = forwardRef(function ThreeCadViewer(
  { spinEnabled = true, spinMode = 'auto', frameMode = 'HIDE', shadingMode = 'GRAY', originVisible = false, resize },
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
  const spinRef = useRef(spinEnabled)
  const spinModeRef = useRef(spinMode || (spinEnabled ? 'on' : 'off'))
  const pauseUntilRef = useRef(0)
  const pauseTimerRef = useRef(null)
  const axesRef = useRef(null) // origin axes helper
  const lastSizeRef = useRef({ w: 0, h: 0 })
  const debounceRef = useRef(0)

  // init Three
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Defensive: clear any existing children/canvas to avoid multiple contexts (HMR/remounts)
    while (container.firstChild) {
      try { container.removeChild(container.firstChild) } catch {}
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000)
    camera.position.set(6, 6, 6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

    // lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const dir = new THREE.DirectionalLight(0xffffff, 0.8)
    dir.position.set(5, 10, 7)
    scene.add(dir)

    // origin axes helper
    const axes = new THREE.AxesHelper(20)
    axes.visible = !!originVisible
    scene.add(axes)
    axesRef.current = axes

    // groups
    const modelGroup = new THREE.Group()
    const wireGroup = new THREE.Group()
    scene.add(modelGroup)
    scene.add(wireGroup)

    // placeholder cube as initial model
    const geom = new THREE.BoxGeometry(2, 2, 2)
    const mat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.1, roughness: 0.8 })
    const mesh = new THREE.Mesh(geom, mat)
    modelGroup.add(mesh)

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geom),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
    )
    wireGroup.add(wire)

    // save refs
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls
    modelGroupRef.current = modelGroup
    wireframeRef.current = wireGroup

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
    }

    const onResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      resizeNow(w, h)
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
      if (spinRef.current) {
        if (modelGroupRef.current) {
          modelGroupRef.current.rotation.y += 0.01
        }
        if (wireframeRef.current) {
          wireframeRef.current.rotation.y += 0.01
        }
      }
      controls.update()
      renderer.render(scene, camera)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
      controls.removeEventListener('start', onUserInteracted)
      INTERACTION_EVENTS.forEach((ev) => renderer.domElement.removeEventListener(ev, onUserInteracted))
      controls.dispose()
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
          if (frameMode === 'LIGHT') {
            obj.material.color.setHex(0xffffff)
            obj.material.opacity = 0.6
            obj.material.transparent = true
          } else {
            obj.material.color.setHex(0x333333)
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
    const group = modelGroupRef.current
    if (!group) return
    if (shadingMode === 'OFF') {
      group.visible = false
      return
    }
    group.visible = true
    group.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material
        if (shadingMode === 'BLACK') {
          mat.color.setHex(0x202020)
          mat.opacity = 1
          mat.transparent = false
        } else if (shadingMode === 'WHITE') {
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
  }, [shadingMode])

  useImperativeHandle(ref, () => ({
    // Replace the current model geometry with a given BufferGeometry
    // Accepts THREE.BufferGeometry and optional material
    setGeometry: (geometry, material) => {
      const group = modelGroupRef.current
      const wire = wireframeRef.current
      if (!group || !wire) return

      // clear old
      for (let i = group.children.length - 1; i >= 0; i--) {
        const child = group.children[i]
        group.remove(child)
        if (child.isMesh) {
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

      const mat = material || new THREE.MeshStandardMaterial({ color: 0xe0e0e0, metalness: 0.1, roughness: 0.8 })
      const mesh = new THREE.Mesh(geometry, mat)
      group.add(mesh)

      const wireMesh = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 })
      )
      wire.add(wireMesh)

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
