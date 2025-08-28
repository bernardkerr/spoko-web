'use client'

import { Suspense, useState, useRef, useEffect, useMemo, memo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Color, Clock, TextureLoader, MeshStandardMaterial, MeshBasicMaterial } from 'three'
import * as THREE from 'three'

// Animated object component supporting multiple geometry types
function AnimatedObject({ geometry = 'cube', spinning, wireframe, color }) {
  const meshRef = useRef()
  useFrame((state, delta) => {
    if (spinning && meshRef.current) {
      meshRef.current.rotation.x += delta * 1
      meshRef.current.rotation.y += delta * 0.5
    }
  })
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      {geometry === 'torusKnot' ? (
        <torusKnotGeometry args={[1.2, 0.35, 150, 20]} />
      ) : geometry === 'icosahedron' ? (
        <icosahedronGeometry args={[1.6, 0]} />
      ) : (
        <boxGeometry args={[2, 2, 2]} />
      )}
      <meshStandardMaterial color={color} wireframe={wireframe} toneMapped={false} />
    </mesh>
  )
}

// Host a user-provided program lifecycle (setup/update/dispose + events)
function ProgramHost({ program, themeColors }) {
  const { scene, camera, gl: renderer } = useThree()
  const clockRef = useRef(new Clock())
  const texLoaderRef = useRef(null)
  const handlersRef = useRef({})
  const setupCompleteRef = useRef(false)

  const ctx = useMemo(() => {
    const add = (obj) => scene.add(obj)
    const remove = (obj) => scene.remove(obj)
    const materials = {
      standard: (opts) => new MeshStandardMaterial(opts),
      basic: (opts) => new MeshBasicMaterial(opts),
    }
    return {
      scene,
      camera,
      renderer,
      clock: clockRef.current,
      THREE,
      add,
      remove,
      materials,
      loaders: {
        texture: (url) => {
          if (!texLoaderRef.current) texLoaderRef.current = new TextureLoader()
          return new Promise((resolve, reject) => {
            texLoaderRef.current.load(url, resolve, undefined, reject)
          })
        },
      },
      themeColors,
    }
  }, [scene, camera, renderer, themeColors])

  useEffect(() => {
    let disposed = false
    setupCompleteRef.current = false
    ;(async () => {
      try {
        await program?.setup?.(ctx)
        if (!disposed) setupCompleteRef.current = true
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[ThreeCanvas] program.setup error', e)
      }
    })()
    return () => {
      if (disposed) return
      disposed = true
      setupCompleteRef.current = false
      try {
        program?.dispose?.(ctx)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[ThreeCanvas] program.dispose error', e)
      }
    }
  }, [program, ctx])

  useFrame(() => {
    if (!setupCompleteRef.current) return
    try {
      const dt = clockRef.current.getDelta()
      program?.update?.({ ...ctx, dt, elapsed: clockRef.current.elapsedTime })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[ThreeCanvas] program.update error', e)
    }
  })

  useEffect(() => {
    const canvas = renderer?.domElement
    if (!canvas) return
    const onPointerDown = (e) => program?.onPointerDown?.(e, ctx)
    const onPointerMove = (e) => program?.onPointerMove?.(e, ctx)
    const onPointerUp = (e) => program?.onPointerUp?.(e, ctx)
    const onWheel = (e) => program?.onWheel?.(e, ctx)
    const onKeyDown = (e) => program?.onKeyDown?.(e, ctx)
    const onKeyUp = (e) => program?.onKeyUp?.(e, ctx)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    handlersRef.current = { onPointerDown, onPointerMove, onPointerUp, onWheel, onKeyDown, onKeyUp }
    return () => {
      const h = handlersRef.current
      canvas.removeEventListener('pointerdown', h.onPointerDown)
      canvas.removeEventListener('pointermove', h.onPointerMove)
      canvas.removeEventListener('pointerup', h.onPointerUp)
      canvas.removeEventListener('wheel', h.onWheel)
      window.removeEventListener('keydown', h.onKeyDown)
      window.removeEventListener('keyup', h.onKeyUp)
    }
  }, [renderer, program, ctx])

  return null
}

// Only re-render when actual visual props change. Prevents hover/enter bubbling re-renders.
export const ThreeCanvas = memo(
  ThreeCanvasImpl,
  (prev, next) => (
    prev.spinning === next.spinning &&
    prev.wireframe === next.wireframe &&
    prev.showBackground === next.showBackground &&
    prev.geometry === next.geometry &&
    prev.fullscreen === next.fullscreen &&
    prev.className === next.className &&
    prev.program === next.program &&
    prev.lightIntensity === next.lightIntensity &&
    prev.backgroundColor === next.backgroundColor
  )
)

// Background plane component
function BackgroundPlane({ showBackground, color }) {
  if (!showBackground) return null
  
  return (
    <mesh position={[0, 0, -5]}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

// Helper to set the renderer clear color from props/theme
function ClearColor({ color, fallback }) {
  const { gl } = useThree()
  useEffect(() => {
    const target = color || fallback
    if (!target) return
    try { gl.setClearColor(new Color(target)) } catch (_) { gl.setClearColor(target) }
  }, [gl, color, fallback])
  return null
}

// Scene setup component
function Scene({ spinning, wireframe, showBackground, geometry, colors, backgroundColor, lightIntensity }) {
  const { camera, gl } = useThree()
  
  useEffect(() => {
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Bind WebGL clear color to Radix theme without relying on CSS background
  useEffect(() => {
    const target = backgroundColor || colors?.background
    if (target) {
      try { gl.setClearColor(new Color(target)) } catch (_) { gl.setClearColor(target) }
    }
  }, [gl, colors?.background, backgroundColor])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6 * lightIntensity} />
      <hemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.4 * lightIntensity} />
      <pointLight position={[10, 10, 10]} intensity={1 * lightIntensity} />
      
      {/* 3D Objects */}
      <AnimatedObject geometry={geometry} spinning={spinning} wireframe={wireframe} color={colors?.accent} />
      <BackgroundPlane showBackground={showBackground} color={backgroundColor || colors?.panel} />

      {/* Controls */}
      <OrbitControls enableDamping dampingFactor={0.1} rotateSpeed={0.8} />
    </>
  )
}

// Loading component
function LoadingFallback() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--theme-colors-neutral-neutral-9)' }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', borderBottom: '2px solid currentColor', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: 8 }}>Loading 3D scene...</span>
      </div>
    </div>
  )
}

// Error boundary component
function ErrorFallback({ error, resetError }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', textAlign: 'center', padding: 16 }}>
      <div style={{ color: '#ef4444', marginBottom: 16 }}>
        <svg style={{ width: 48, height: 48, display: 'block', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>3D Canvas Error</h3>
      </div>
      <p style={{ color: 'var(--theme-colors-neutral-neutral-9)', marginBottom: 16 }}>{error?.message || 'Failed to initialize 3D scene'}</p>
      <button 
        onClick={resetError}
        style={{ padding: '8px 12px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: 6, border: 'none', cursor: 'pointer' }}
      >
        Try Again
      </button>
    </div>
  )
}

// Client-side detection hook
function useIsClient() {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  return isClient
}

// Resolve Radix Theme colors from CSS variables on a target element
function useRadixThemeColors(targetRef) {
  const [colors, setColors] = useState({
    background: '#f1f5f9',
    panel: '#eaeef2',
    accent: '#3b82f6',
  })

  useEffect(() => {
    const el = targetRef?.current || document.documentElement
    if (!el) return

    const toCssColor = (val) => {
      if (!val) return undefined
      const v = String(val).trim()
      if (!v) return undefined
      // If already hsl() or a hex/rgb string, pass through
      if (v.startsWith('hsl(') || v.startsWith('#') || v.startsWith('rgb')) return v
      // Radix often provides space-separated HSL without the function, e.g. "240 6.9% 10.0%"
      return `hsl(${v})`
    }

    const read = () => {
      // Prefer the Radix Theme root if present for token resolution
      const themeRoot = el.closest?.('.rt-Theme') || document.querySelector('.rt-Theme') || document.documentElement
      const cs = getComputedStyle(themeRoot)

      // Try a sequence of possible tokens to maximize compatibility
      const background =
        toCssColor(cs.getPropertyValue('--color-background')) ||
        toCssColor(cs.getPropertyValue('--color-page-background')) ||
        toCssColor(cs.getPropertyValue('--background'))

      const panel =
        toCssColor(cs.getPropertyValue('--color-panel')) ||
        toCssColor(cs.getPropertyValue('--panel')) ||
        toCssColor(cs.getPropertyValue('--gray-3')) ||
        toCssColor(cs.getPropertyValue('--gray-4'))

      const accent =
        toCssColor(cs.getPropertyValue('--accent-9')) ||
        toCssColor(cs.getPropertyValue('--iris-9')) ||
        toCssColor(cs.getPropertyValue('--indigo-9')) ||
        toCssColor(cs.getPropertyValue('--accent'))

      setColors((prev) => ({
        background: background || prev.background,
        panel: panel || prev.panel,
        accent: accent || prev.accent,
      }))

      if (process.env.NODE_ENV !== 'production') {
        // One-time debug output to verify resolution
        // eslint-disable-next-line no-console
        console.debug('[ThreeCanvas] Radix colors', {
          background: background || '(fallback)',
          panel: panel || '(fallback)',
          accent: accent || '(fallback)',
          themeRoot,
        })
      }
    }

    read()

    // Update on theme-change events (emitted by ThemeToggle flow)
    const handler = () => read()
    window.addEventListener('theme-change', handler)
    return () => window.removeEventListener('theme-change', handler)
  }, [targetRef])

  return colors
}

function ThreeCanvasImpl({ 
  spinning = true, 
  wireframe = false, 
  showBackground = true,
  geometry = 'cube',
  fullscreen = false,
  className = '',
  program = null,
  shell = { lights: true, controls: true, background: true },
  lightIntensity = 1,
  backgroundColor = null,
}) {
  const [error, setError] = useState(null)
  const [mountId, setMountId] = useState(0) // force remounts on failure/retry
  const [attempts, setAttempts] = useState(0)
  const isClient = useIsClient()
  const containerRef = useRef(null)
  const themeColors = useRadixThemeColors(containerRef)

  // Diagnostics: track mounts/unmounts and theme color changes
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[ThreeCanvas] mount', { mountId, attempts })
    return () => {
      // eslint-disable-next-line no-console
      console.debug('[ThreeCanvas] unmount', { mountId })
    }
  }, [mountId])

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('[ThreeCanvas] themeColors', themeColors)
  }, [themeColors])

  // Memoize camera options so Canvas doesn't recreate renderer/context
  const cameraOptions = useMemo(() => ({ position: [5, 5, 5], fov: 60 }), [])
  // Note: We previously experimented with an explicit WebGL context factory.
  // Revert to R3F defaults which are highly compatible.
  const canvasStyle = useMemo(() => ({ width: '100%', height: '100%' }), [])

  const handleError = (error) => {
    console.error('Three.js Canvas Error:', error)
    // eslint-disable-next-line no-console
    console.debug('[ThreeCanvas] error encountered', { attempts, mountId, message: error?.message })
    // First creation sometimes fails on slower GPUs/browsers. Retry once.
    if (attempts < 1) {
      setAttempts((a) => a + 1)
      // Small delay to give the browser a chance to settle layout/GPU
      setTimeout(() => setMountId((k) => k + 1), 50)
      return
    }
    setError(error)
  }

  const resetError = () => {
    setError(null)
    setAttempts(0)
    setMountId((k) => k + 1)
  }

  // Don't render on server side
  if (!isClient) {
    return (
      <div className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}>
        <LoadingFallback />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}>
        <ErrorFallback error={error} resetError={resetError} />
      </div>
    )
  }

  return (
    <div 
      className={`three-canvas ${fullscreen ? 'three-fullscreen' : ''} ${className}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
      ref={containerRef}
    >
      <Canvas
        key={mountId}
        camera={cameraOptions}
        // Use a safe, low DPR to reduce GPU memory pressure during initialization
        dpr={1}
        onPointerEnter={(e) => e.stopPropagation()}
        onPointerLeave={(e) => e.stopPropagation()}
        onError={handleError}
        onCreated={({ gl: renderer }) => {
          // renderer here is THREE.WebGLRenderer
          const canvas = renderer.domElement
          try {
            const ctx = renderer.getContext()
            // eslint-disable-next-line no-console
            console.debug('[ThreeCanvas] onCreated', {
              contextType: ctx?.constructor?.name,
              attributes: ctx?.getContextAttributes?.(),
              dpr: typeof window !== 'undefined' ? window.devicePixelRatio : 'n/a',
            })
          } catch (e) {
            // ignore
          }
          const onLost = (e) => {
            e.preventDefault()
            console.warn('[ThreeCanvas] WebGL context lost, remounting...')
            setMountId((k) => k + 1)
          }
          const onRestored = () => {
            console.info('[ThreeCanvas] WebGL context restored')
          }
          canvas.addEventListener('webglcontextlost', onLost, { passive: false })
          canvas.addEventListener('webglcontextrestored', onRestored)
        }}
        // Avoid CSS background to prevent any secondary 2D draws; background is set via gl.clearColor
        style={canvasStyle}
      >
        <Suspense fallback={<LoadingFallback />}>
          {program ? (
            <>
              {/* Shell: lighting/background/controls */}
              <ClearColor color={backgroundColor} fallback={themeColors?.background} />
              {shell?.lights !== false && (
                <>
                  <ambientLight intensity={0.6 * (lightIntensity || 1)} />
                  <hemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.4 * (lightIntensity || 1)} />
                  <pointLight position={[10, 10, 10]} intensity={1 * (lightIntensity || 1)} />
                </>
              )}
              {shell?.background !== false && (
                <BackgroundPlane showBackground={showBackground} color={backgroundColor || themeColors?.panel} />
              )}
              {shell?.controls !== false && (
                <OrbitControls enableDamping dampingFactor={0.1} rotateSpeed={0.8} />
              )}
              <ProgramHost program={program} themeColors={themeColors} />
            </>
          ) : (
            <>
              {/* Legacy demo scene for back-compat */}
              <Scene 
                spinning={spinning} 
                wireframe={wireframe} 
                showBackground={showBackground} 
                geometry={geometry}
                colors={themeColors}
                backgroundColor={backgroundColor}
                lightIntensity={lightIntensity}
              />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
