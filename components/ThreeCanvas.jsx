'use client'

import { Suspense, useState, useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Color } from 'three'

// Animated cube component
function AnimatedCube({ spinning, wireframe, color }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    if (spinning && meshRef.current) {
      meshRef.current.rotation.x += delta * 1
      meshRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color={color} wireframe={wireframe} toneMapped={false} />
    </mesh>
  )
}

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

// Scene setup component
function Scene({ spinning, wireframe, showBackground, colors }) {
  const { camera, gl } = useThree()
  
  useEffect(() => {
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Bind WebGL clear color to Radix theme without relying on CSS background
  useEffect(() => {
    if (colors?.background) {
      try {
        gl.setClearColor(new Color(colors.background))
      } catch (_) {
        // Fallback: try raw string if Color parsing fails
        gl.setClearColor(colors.background)
      }
    }
  }, [gl, colors?.background])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <hemisphereLight skyColor={0xffffff} groundColor={0x444444} intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {/* 3D Objects */}
      <AnimatedCube spinning={spinning} wireframe={wireframe} color={colors?.accent} />
      <BackgroundPlane showBackground={showBackground} color={colors?.panel} />

      {/* Controls */}
      <OrbitControls enableDamping dampingFactor={0.1} rotateSpeed={0.8} />
    </>
  )
}

// Loading component
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
      <div className="flex items-center text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
        <span className="ml-2">Loading 3D scene...</span>
      </div>
    </div>
  )
}

// Error boundary component
function ErrorFallback({ error, resetError }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-center p-4">
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="text-lg font-semibold">3D Canvas Error</h3>
      </div>
      <p className="text-muted-foreground mb-4">{error?.message || 'Failed to initialize 3D scene'}</p>
      <button 
        onClick={resetError}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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

export function ThreeCanvas({ 
  spinning = true, 
  wireframe = false, 
  showBackground = true,
  fullscreen = false,
  className = ''
}) {
  const [error, setError] = useState(null)
  const isClient = useIsClient()
  const containerRef = useRef(null)
  const themeColors = useRadixThemeColors(containerRef)

  const handleError = (error) => {
    console.error('Three.js Canvas Error:', error)
    setError(error)
  }

  const resetError = () => {
    setError(null)
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
      style={{ width: '100%', height: '400px', position: 'relative' }}
      ref={containerRef}
    >
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'default'
        }}
        onError={handleError}
        // Avoid CSS background to prevent any secondary 2D draws; background is set via gl.clearColor
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={<LoadingFallback />}>
          {/* Inject colors via context by setting materials inline below */}
          <Scene 
            spinning={spinning} 
            wireframe={wireframe} 
            showBackground={showBackground} 
            colors={themeColors}
          />
          {/* Apply Radix theme-driven colors by mutating materials each frame */}
        </Suspense>
      </Canvas>
    </div>
  )
}
